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
        
        # Process private members
        for member in data:
            # If the member has a privacy field or the name is "Alex"
            if member.get("privacy") == "private" or member.get("name") == "Alex":
                # Set fields to indicate privacy
                member["is_private"] = True
                member["display_name"] = "PRIVATE"
                
                # Clear identifiable information but keep ID for reference
                if "avatar_url" in member:
                    member["avatar_url"] = None
                if "description" in member:
                    member["description"] = "This member's information is private."
                if "pronouns" in member:
                    member["pronouns"] = None
                    
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
        
        # Process private members in fronters
        if "members" in data:
            for member in data["members"]:
                # If the member has a privacy field or the name is "Alex"
                if member.get("privacy") == "private" or member.get("name") == "Alex":
                    # Set fields to indicate privacy
                    member["is_private"] = True
                    member["display_name"] = "PRIVATE"
                    
                    # Clear identifiable information but keep ID for reference
                    if "avatar_url" in member:
                        member["avatar_url"] = None
                    if "description" in member:
                        member["description"] = "This member's information is private."
                    if "pronouns" in member:
                        member["pronouns"] = None
        
        set_in_cache(cache_key, data, CACHE_TTL)
        return data

async def set_front(member_ids):
    """
    Sets the current front to the provided list of member IDs.
    Pass an empty list to clear the front.
    """
    # Clear fronters cache since we're updating it
    cache_key = "fronters"
    set_in_cache(cache_key, None, 0)  # Invalidate cache
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/systems/@me/switches",
            headers=HEADERS,
            json={"members": member_ids}
        )
        if resp.status_code not in (200, 204):
            raise Exception(f"Failed to set front: {resp.status_code} - {resp.text}")

        # If there's a response body, return it, otherwise return None
        return resp.json() if resp.content else None
