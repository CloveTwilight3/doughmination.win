from fastapi import FastAPI, HTTPException
from pluralkit import get_system, get_members, get_fronters

app = FastAPI()

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