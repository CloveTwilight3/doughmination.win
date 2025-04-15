from fastapi import FastAPI, HTTPException, Request, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from pluralkit import get_system, get_members, get_fronters, set_front
from auth import router as auth_router, get_current_user, oauth2_scheme  # Import auth
import os
from fastapi.security import SecurityScopes
from jose import JWTError
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Get environment variables
ADMIN_USERNAME = os.getenv("USERNAME")

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
async def switch_front(request: Request, user: str = Depends(get_current_user)):
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
async def switch_single_front(request: Request, user: str = Depends(get_current_user)):
    try:
        body = await request.json()
        member_id = body.get("member_id")

        if not member_id:
            raise HTTPException(status_code=400, detail="member_id is required")

        await set_front([member_id])
        return {"success": True, "message": "Front updated successfully"}

    except Exception as e:
        print("Error in /api/switch_front:", e)  # 👈 add this
        raise HTTPException(status_code=500, detail=f"Failed to switch front: {str(e)}")
        
# Add admin check endpoint
@app.get("/api/is_admin")
async def check_admin(user: str = Depends(get_current_user)):
    # Since we only have one admin user, we can simply check if the authenticated
    # user matches the admin username from environment variables
    return {"isAdmin": user == ADMIN_USERNAME}