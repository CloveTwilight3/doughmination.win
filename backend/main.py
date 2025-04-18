from fastapi import FastAPI, HTTPException, Request, Depends, Security, status, File, UploadFile
from typing import Optional
import uuid
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pluralkit import get_system, get_members, get_fronters, set_front
from auth import router as auth_router, get_current_user
import shutil
import aiofiles
import os
from fastapi.security import SecurityScopes
from jose import JWTError
from dotenv import load_dotenv
from models import UserCreate, UserResponse, UserUpdate
from users import get_users, create_user, delete_user, initialize_admin_user, update_user
from typing import List
from metrics import get_fronting_time_metrics, get_switch_frequency_metrics
from pathlib import Path

load_dotenv()

app = FastAPI()

# Create upload directory if it doesn't exist
UPLOAD_DIR = Path("avatars")
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize the admin user if no users exist
initialize_admin_user()

# CORS - Updated for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://104.219.236.52:8000", "https://friends.clovetwilight3.co.uk:8000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include login route
app.include_router(auth_router)

# Optional authentication function for public endpoints
async def get_optional_user(token: str = Security(oauth2_scheme, scopes=[])):
    try:
        return await get_current_user(token)
    except (HTTPException, JWTError):
        return None

@app.get("/api/system")
async def system_info():
    try:
        return await get_system()
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
        return {"status": "success", "message": "Front updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# New endpoint to match frontend's AdminDashboard component
@app.post("/api/switch_front")
async def switch_single_front(request: Request, user = Depends(get_current_user)):
    try:
        body = await request.json()
        member_id = body.get("member_id")
        
        if not member_id:
            raise HTTPException(status_code=400, detail="member_id is required")

        result = await set_front([member_id])

        # If result is a successful dict, return it or just say success
        return {"success": True, "message": "Front updated", "data": result}

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        # Optionally log and parse pluralkit error responses here
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
    return [UserResponse(id=user.id, username=user.username, is_admin=user.is_admin) for user in users]

@app.post("/api/users", response_model=UserResponse)
async def add_user(user_create: UserCreate, current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    try:
        new_user = create_user(user_create)
        return UserResponse(id=new_user.id, username=new_user.username, is_admin=new_user.is_admin)
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
    
    updated_user = update_user(user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=updated_user.id,
        username=updated_user.username,
        display_name=updated_user.display_name,
        is_admin=updated_user.is_admin
    )

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
    
    # Validate file type
    valid_types = ["image/jpeg", "image/png", "image/gif"]
    if avatar.content_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and GIF are allowed.")
    
    # Generate unique filename
    file_ext = avatar.filename.split(".")[-1]
    unique_filename = f"{user_id}_{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
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
            content = await avatar.read()
            await out_file.write(content)
        
        # Update user with avatar URL
        avatar_url = f"/avatars/{unique_filename}"
        user_update = UserUpdate(avatar_url=avatar_url)
        updated_user = update_user(user_id, user_update)
        
        if not updated_user:
            raise HTTPException(status_code=500, detail="Failed to update user with avatar URL")
        
        return {"success": True, "avatar_url": avatar_url}
    except Exception as e:
        print(f"Error saving avatar: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading avatar: {str(e)}")

# Add a route to serve avatar files
@app.get("/avatars/{filename}")
async def get_avatar(filename: str):
    file_path = UPLOAD_DIR / filename
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Avatar not found")
    
    return FileResponse(file_path)