from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pluralkit import get_system, get_members, get_fronters, set_front

from auth import router as auth_router, get_current_user  # 👈 Import auth
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://104.219.236.52:8000", "https://plural.clovetwilight3.co.uk:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include login route
app.include_router(auth_router)

@app.get("/api/system")
async def system_info():
    return await get_system()

@app.get("/api/members")
async def members():
    return await get_members()

@app.get("/api/fronters")
async def fronters():
    return await get_fronters()

@app.get("/api/member/{member_id}")
async def member_detail(member_id: str):
    members = await get_members()
    for member in members.get("members", []):
        if member["id"] == member_id or member["name"].lower() == member_id.lower():
            return member
    raise HTTPException(status_code=404, detail="Member not found")

@app.post("/api/switch")
async def switch_front(request: Request, user: str = Depends(get_current_user)):  # 🔐 protected
    try:
        body = await request.json()
        member_ids = body.get("members", [])

        if not isinstance(member_ids, list):
            raise HTTPException(status_code=400, detail="'members' must be a list of member IDs")

        await set_front(member_ids)
        return {"status": "success", "message": "Front updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
