import httpx
import os
from dotenv import load_dotenv
from cache import get_from_cache, set_in_cache

load_dotenv()

BASE_URL = "https://api.pluralkit.me/v2"
TOKEN = os.getenv("SYSTEM_TOKEN")
CACHE_TTL = int(os.getenv("CACHE_TTL", 30))

HEADERS = {
    "Authorization": TOKEN
}

async def get_system():
    cache_key = "system"
    if (cached := get_from_cache(cache_key)):
        return cached
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/systems/@me", headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        set_in_cache(cache_key, data, CACHE_TTL)
        return data

async def get_members():
    cache_key = "members"
    if (cached := get_from_cache(cache_key)):
        return cached
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/systems/@me/members", headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        set_in_cache(cache_key, data, CACHE_TTL)
        return data

async def get_fronters():
    cache_key = "fronters"
    if (cached := get_from_cache(cache_key)):
        return cached
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/systems/@me/fronters", headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        set_in_cache(cache_key, data, CACHE_TTL)
        return data

async def set_front(member_ids):
    """
    Sets the current front to the provided list of member IDs.
    Pass an empty list to clear the front.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/systems/@me/switches",
            headers=HEADERS,
            json={"members": member_ids}
        )
        if resp.status_code != 204:
            raise Exception(f"Failed to set front: {resp.status_code} - {resp.text}")
