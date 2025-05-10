"""
MIT License

Copyright (c) 2025 Clove Twilight

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

from fastapi import FastAPI, HTTPException, Request, Depends, Security, status, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pluralkit import get_system, get_members, get_fronters, set_front
from auth import router as auth_router, get_current_user, oauth2_scheme
import os
import shutil
import aiofiles
import uuid
import json
import asyncio
import weakref
from datetime import datetime, timezone
from fastapi.security import SecurityScopes
from jose import JWTError
from dotenv import load_dotenv
from models import UserCreate, UserResponse, UserUpdate, MentalState
from users import get_users, create_user, delete_user, initialize_admin_user, update_user, get_user_by_id
from typing import List, Optional, Set, Dict
from metrics import get_fronting_time_metrics, get_switch_frequency_metrics
from pathlib import Path

load_dotenv()

app = FastAPI()

# Initialize the admin user if no users exist
initialize_admin_user()

# Default fallback avatar URL
DEFAULT_AVATAR = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/75bff394-4f86-45a8-a923-e26223aa74cb/de901o7-d61b3bfb-f1b1-453b-8268-9200130bbc65.png"

# File size limit middleware
class FileSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == 'POST' and '/avatar' in request.url.path:
            try:
                # 2MB in bytes
                MAX_SIZE = 2 * 1024 * 1024
                content_length = request.headers.get('content-length')
                if content_length and int(content_length) > MAX_SIZE:
                    return JSONResponse(
                        status_code=413,
                        content={"detail": "File size exceeds the limit of 2MB"}
                    )
            except:
                pass
        
        response = await call_next(request)
        return response

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",              # Local development
        "http://127.0.0.1:8080",              # Alternative local address
        "https://friends.clovetwilight3.co.uk", # Production domain
        "http://friends.clovetwilight3.co.uk",  # HTTP version of production domain
        "http://frontend",                    # Docker service name
        "http://frontend:80",                 # Docker service with port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add the file size limit middleware
app.add_middleware(FileSizeLimitMiddleware)

# Include login route
app.include_router(auth_router)

# Create upload directory for avatars if it doesn't exist
UPLOAD_DIR = Path("avatars")
UPLOAD_DIR.mkdir(exist_ok=True)

# Optional authentication function for public endpoints
async def get_optional_user(token: str = Security(oauth2_scheme, scopes=[])):
    try:
        return await get_current_user(token)
    except (HTTPException, JWTError):
        return None

# ============================================================================
# WebSocket Connection Manager
# ============================================================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "all": set(),  # All connected clients
            "authenticated": set()  # Authenticated users
        }
        # Use weakref to prevent memory leaks
        self._weak_connections = weakref.WeakSet()

    async def connect(self, websocket: WebSocket, group: str = "all"):
        await websocket.accept()
        self.active_connections[group].add(websocket)
        self._weak_connections.add(websocket)
        print(f"Client connected to group: {group}. Total connections: {len(self.active_connections[group])}")

    def disconnect(self, websocket: WebSocket, group: str = "all"):
        self.active_connections[group].discard(websocket)
        # Clean up from all groups when disconnecting
        for group_set in self.active_connections.values():
            group_set.discard(websocket)
        print(f"Client disconnected from group: {group}. Remaining connections: {len(self.active_connections[group])}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
            # Remove the connection if it's broken
            self.disconnect(websocket)

    async def broadcast(self, message: str, group: str = "all"):
        """Broadcast message to all connections in a group"""
        disconnected = set()
        
        for connection in self.active_connections[group].copy():
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                disconnected.add(connection)
            except Exception as e:
                print(f"Error broadcasting to client: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn, group)

    async def broadcast_json(self, data: dict, group: str = "all"):
        """Broadcast JSON data to all connections in a group"""
        message = json.dumps(data)
        await self.broadcast(message, group)

# Create a global connection manager instance
manager = ConnectionManager()

# ============================================================================
# WebSocket Endpoint
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Accept the WebSocket connection
    await manager.connect(websocket)
    
    try:
        while True:
            # Keep the connection alive
            data = await websocket.receive_text()
            
            # You can handle different message types if needed
            if data == "ping":
                await websocket.send_text("pong")
            else:
                # Handle other message types here if needed
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# ============================================================================
# WebSocket Broadcast Helpers
# ============================================================================

async def broadcast_frontend_update(data_type: str, data: dict = None):
    """Broadcast an update to all connected clients"""
    message = {
        "type": data_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": data or {}
    }
    await manager.broadcast_json(message)

async def broadcast_fronting_update(fronters_data: dict):
    """Broadcast fronting member changes"""
    await broadcast_frontend_update("fronting_update", fronters_data)

async def broadcast_mental_state_update(mental_state_data: dict):
    """Broadcast mental state changes"""
    await broadcast_frontend_update("mental_state_update", mental_state_data)

async def broadcast_member_update(members_data: list):
    """Broadcast member list changes"""
    await broadcast_frontend_update("members_update", {"members": members_data})

# ============================================================================
# API Endpoints (with WebSocket broadcast integration)
# ============================================================================

@app.get("/api/mental-state")
async def get_mental_state():
    """Get current mental state from database"""
    try:
        # Check if mental_state.json exists
        if os.path.exists("mental_state.json"):
            with open("mental_state.json", "r") as f:
                state_data = json.load(f)
                # Convert the string back to datetime
                state_data["updated_at"] = datetime.fromisoformat(state_data["updated_at"])
                return MentalState(**state_data)
        else:
            # Default state
            return MentalState(
                level="safe",
                updated_at=datetime.now(timezone.utc),
                notes=None
            )
    except Exception as e:
        print(f"Error loading mental state: {e}")
        return MentalState(
            level="safe",
            updated_at=datetime.now(timezone.utc),
            notes=None
        )

@app.post("/api/mental-state")
async def update_mental_state(state: MentalState, user = Depends(get_current_user)):
    """Update mental state (admin only)"""
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    try:
        state_data = state.dict()
        state_data["updated_at"] = state_data["updated_at"].isoformat()
        
        with open("mental_state.json", "w") as f:
            json.dump(state_data, f, indent=2)
        
        # Broadcast the mental state update
        await broadcast_mental_state_update(state_data)
        
        return {"success": True, "message": "Mental state updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update mental state: {str(e)}")

@app.get("/api/system")
async def system_info():
    try:
        # Get system data
        system_data = await get_system()
        
        # Get mental state
        mental_state_data = None
        if os.path.exists("mental_state.json"):
            with open("mental_state.json", "r") as f:
                state_data = json.load(f)
                # Convert the string back to datetime for the response
                state_data["updated_at"] = datetime.fromisoformat(state_data["updated_at"])
                mental_state_data = MentalState(**state_data)
        else:
            mental_state_data = MentalState(
                level="safe",
                updated_at=datetime.now(timezone.utc),
                notes=None
            )
        
        # Add mental state to system data
        system_data["mental_state"] = mental_state_data.dict()
        
        return system_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch system info: {str(e)}")

@app.get("/api/members")
async def members():
    try:
        return await get_members()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch members: {str(e)}")

@app.get("/api/fronters")
async def fronters():
    try:
        return await get_fronters()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch fronters: {str(e)}")

@app.get("/api/member/{member_id}")
async def member_detail(member_id: str):
    try:
        members = await get_members()
        for member in members:
            if member["id"] == member_id or member["name"].lower() == member_id.lower():
                return member
        raise HTTPException(status_code=404, detail="Member not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch member details: {str(e)}")

@app.post("/api/switch")
async def switch_front(request: Request, user = Depends(get_current_user)):
    try:
        body = await request.json()
        member_ids = body.get("members", [])

        if not isinstance(member_ids, list):
            raise HTTPException(status_code=400, detail="'members' must be a list of member IDs")

        await set_front(member_ids)
        
        # Broadcast the fronting update
        fronters_data = await get_fronters()
        await broadcast_fronting_update(fronters_data)
        
        return {"status": "success", "message": "Front updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/switch_front")
async def switch_single_front(request: Request, user = Depends(get_current_user)):
    try:
        body = await request.json()
        member_id = body.get("member_id")
        
        if not member_id:
            raise HTTPException(status_code=400, detail="member_id is required")

        result = await set_front([member_id])

        # After successful switch, broadcast the update
        if result or True:  # Broadcast even if result is None
            # Fetch the updated fronters data
            fronters_data = await get_fronters()
            await broadcast_fronting_update(fronters_data)

        return {"success": True, "message": "Front updated", "data": result}

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        print("Error in /api/switch_front:", e)
        raise HTTPException(status_code=500, detail=f"Failed to switch front: {str(e)}")

# Add admin check endpoint
@app.get("/api/is_admin")
async def check_admin(user = Depends(get_current_user)):
    return {"isAdmin": user.is_admin}

# User management endpoints
@app.get("/api/users", response_model=List[UserResponse])
async def list_users(current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    users = get_users()
    return [UserResponse(
        id=user.id, 
        username=user.username, 
        display_name=user.display_name, 
        is_admin=user.is_admin,
        avatar_url=getattr(user, 'avatar_url', None)
    ) for user in users]

@app.post("/api/users", response_model=UserResponse)
async def add_user(user_create: UserCreate, current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    try:
        new_user = create_user(user_create)
        return UserResponse(
            id=new_user.id, 
            username=new_user.username, 
            display_name=new_user.display_name, 
            is_admin=new_user.is_admin,
            avatar_url=getattr(new_user, 'avatar_url', None)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@app.delete("/api/users/{user_id}")
async def remove_user(user_id: str, current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    # Prevent self-deletion
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    success = delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

@app.put("/api/users/{user_id}")
async def update_user_info(user_id: str, user_update: UserUpdate, current_user = Depends(get_current_user)):
    # Only admins or the user themselves can update their info
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    try:
        updated_user = update_user(user_id, user_update)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=updated_user.id,
            username=updated_user.username,
            display_name=updated_user.display_name,
            is_admin=updated_user.is_admin,
            avatar_url=getattr(updated_user, 'avatar_url', None)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/users/{user_id}/avatar")
async def upload_user_avatar(
    user_id: str,
    avatar: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    # Only admins or the user themselves can update their avatar
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    # Verify user exists
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only allow specific file extensions
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    
    # Get file extension and convert to lowercase
    _, file_ext = os.path.splitext(avatar.filename)
    file_ext = file_ext.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types are: {', '.join(allowed_extensions)}"
        )
    
    # Validate file size (2MB limit)
    MAX_SIZE = 2 * 1024 * 1024  # 2MB
    
    # First check content-length header
    content_length = int(avatar.headers.get("content-length", 0))
    if content_length > MAX_SIZE:
        raise HTTPException(
            status_code=413, 
            detail="File size exceeds the limit of 2MB"
        )
    
    try:
        # Read the file content
        contents = await avatar.read()
        file_size = len(contents)
        
        # Double-check file size
        if file_size > MAX_SIZE:
            raise HTTPException(
                status_code=413,
                detail="File size exceeds the limit of 2MB"
            )
        
        # Generate unique filename
        unique_filename = f"{user_id}_{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / unique_filename
        
        # If there's an existing avatar, try to remove it
        users = get_users()
        for i, u in enumerate(users):
            if u.id == user_id and hasattr(u, 'avatar_url') and u.avatar_url:
                old_filename = u.avatar_url.split("/")[-1]
                old_path = UPLOAD_DIR / old_filename
                try:
                    if os.path.exists(old_path):
                        os.remove(old_path)
                except Exception as e:
                    print(f"Error removing old avatar: {e}")
        
        # Save the new file
        async with aiofiles.open(file_path, 'wb') as out_file:
            await out_file.write(contents)
        
        # Get the base URL from environment variables
        base_url = os.getenv("BASE_URL", "").rstrip('/')
        if not base_url:
            # Fallback to a default URL
            base_url = "https://friends.clovetwilight3.co.uk"
        
        # Construct full avatar URL
        avatar_url = f"{base_url}/avatars/{unique_filename}"
        
        # Update user with avatar URL
        user_update = UserUpdate(avatar_url=avatar_url)
        updated_user = update_user(user_id, user_update)
        
        if not updated_user:
            raise HTTPException(status_code=500, detail="Failed to update user with avatar URL")
        
        return {"success": True, "avatar_url": avatar_url}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error saving avatar: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading avatar: {str(e)}")

@app.get("/avatars/{filename}")
async def get_avatar(filename: str):
    """Serve avatar images with proper content type handling"""
    file_path = UPLOAD_DIR / filename
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        # Set the appropriate media type based on file extension
        media_type = None
        if filename.lower().endswith(('.jpg', '.jpeg')):
            media_type = "image/jpeg"
        elif filename.lower().endswith('.png'):
            media_type = "image/png"
        elif filename.lower().endswith('.gif'):
            media_type = "image/gif"
        
        return FileResponse(
            path=file_path,
            media_type=media_type,
            filename=filename
        )
    
    # If not found locally, redirect to default avatar
    return RedirectResponse(url=DEFAULT_AVATAR)

# Add metric information
@app.get("/api/metrics/fronting-time")
async def fronting_time_metrics(days: int = 30, user = Depends(get_current_user)):
    """Get fronting time metrics for each member over different timeframes"""
    try:
        metrics = await get_fronting_time_metrics(days)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch fronting metrics: {str(e)}")

@app.get("/api/metrics/switch-frequency")
async def switch_frequency_metrics(days: int = 30, user = Depends(get_current_user)):
    """Get switch frequency metrics over different timeframes"""
    try:
        metrics = await get_switch_frequency_metrics(days)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch switch frequency metrics: {str(e)}")

# Admin refresh endpoint
@app.post("/api/admin/refresh")
async def admin_refresh(user = Depends(get_current_user)):
    """Force refresh all connected clients"""
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    try:
        # Broadcast refresh command
        await broadcast_frontend_update("force_refresh", {
            "message": "Admin initiated refresh"
        })
        
        return {"success": True, "message": "Refresh broadcast sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to broadcast refresh: {str(e)}")