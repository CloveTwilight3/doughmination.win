from fastapi import FastAPI, HTTPException, Request
from pluralkit import get_system, get_members, get_fronters, set_front
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS configuration: Allowing frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://104.219.236.52:8080", "https://plural.clovetwilight3.co.uk:8080"],  # Replace with your frontend's origin or use a list of origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

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
async def switch_front(request: Request):
    try:
        body = await request.json()
        member_ids = body.get("members", [])

        if not isinstance(member_ids, list):
            raise HTTPException(status_code=400, detail="'members' must be a list of member IDs")

        await set_front(member_ids)
        return {"status": "success", "message": "Front updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))