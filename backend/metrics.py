from datetime import datetime, timedelta
import httpx
import os
from dotenv import load_dotenv
from cache import get_from_cache, set_in_cache
from typing import List, Dict, Any, Optional

load_dotenv()

BASE_URL = "https://api.pluralkit.me/v2"
TOKEN = os.getenv("SYSTEM_TOKEN")
CACHE_TTL = int(os.getenv("CACHE_TTL", 30))

HEADERS = {
    "Authorization": TOKEN
}

async def get_switches(limit: int = 1000) -> List[Dict[str, Any]]:
    """Get recent switches from PluralKit"""
    cache_key = f"switches_{limit}"
    if (cached := get_from_cache(cache_key)):
        return cached
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/systems/@me/switches?limit={limit}", headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        set_in_cache(cache_key, data, CACHE_TTL)
        return data

async def get_fronting_time_metrics(days: int = 30) -> Dict[str, Any]:
    """Calculate fronting time metrics for each member"""
    # Get all switches for the specified period
    switches = await get_switches(1000)  # Get a large number of switches
    
    # Get current time and calculate the cutoff time
    now = datetime.utcnow()
    cutoff_time = now - timedelta(days=days)
    
    # Get member details for display purposes
    member_details = {}
    try:
        from pluralkit import get_members
        members = await get_members()
        for member in members:
            member_details[member["id"]] = {
                "name": member["name"],
                "display_name": member.get("display_name", member["name"]),
                "avatar_url": member.get("avatar_url", None)
            }
    except Exception as e:
        print(f"Error fetching member details: {e}")
    
    # Filter switches to only include those within the specified period
    filtered_switches = []
    for switch in switches:
        timestamp = datetime.fromisoformat(switch["timestamp"].replace("Z", "+00:00"))
        if timestamp >= cutoff_time:
            filtered_switches.append(switch)
    
    # Sort switches by timestamp (oldest first)
    filtered_switches.sort(key=lambda x: x["timestamp"])
    
    # Calculate fronting time for each member
    fronting_times = {}
    
    # If there are no switches in the period, return empty metrics
    if not filtered_switches:
        return {
            "total_time": 0,
            "members": {},
            "timeframes": {
                "24h": {},
                "48h": {},
                "5d": {},
                "7d": {},
                "30d": {}
            }
        }
    
    # Add a virtual "current" switch to include time up to now
    current_members = filtered_switches[-1]["members"]
    filtered_switches.append({
        "timestamp": now.isoformat(),
        "members": current_members
    })
    
    # Calculate total time for each member
    total_time_seconds = 0
    for i in range(1, len(filtered_switches)):
        prev_switch = filtered_switches[i-1]
        curr_switch = filtered_switches[i]
        
        prev_time = datetime.fromisoformat(prev_switch["timestamp"].replace("Z", "+00:00"))
        curr_time = datetime.fromisoformat(curr_switch["timestamp"].replace("Z", "+00:00"))
        
        # Calculate duration in seconds
        duration_seconds = (curr_time - prev_time).total_seconds()
        total_time_seconds += duration_seconds
        
        # Add duration to each member that was fronting
        for member_id in prev_switch["members"]:
            if member_id not in fronting_times:
                fronting_times[member_id] = {
                    "total_seconds": 0,
                    "24h": 0,
                    "48h": 0,
                    "5d": 0,
                    "7d": 0,
                    "30d": 0
                }
            
            fronting_times[member_id]["total_seconds"] += duration_seconds
            
            # Check which timeframes this duration falls into
            time_ago = (now - prev_time).total_seconds()
            
            if time_ago <= 24 * 3600:  # 24 hours
                fronting_times[member_id]["24h"] += duration_seconds
            
            if time_ago <= 48 * 3600:  # 48 hours
                fronting_times[member_id]["48h"] += duration_seconds
            
            if time_ago <= 5 * 24 * 3600:  # 5 days
                fronting_times[member_id]["5d"] += duration_seconds
            
            if time_ago <= 7 * 24 * 3600:  # 7 days
                fronting_times[member_id]["7d"] += duration_seconds
            
            if time_ago <= 30 * 24 * 3600:  # 30 days
                fronting_times[member_id]["30d"] += duration_seconds
    
    # Format the result
    result = {
        "total_time": total_time_seconds,
        "members": {},
        "timeframes": {
            "24h": {},
            "48h": {},
            "5d": {},
            "7d": {},
            "30d": {}
        }
    }
    
    for member_id, times in fronting_times.items():
        # Get member name and other details
        name = member_id
        display_name = member_id
        avatar_url = None
        
        if member_id in member_details:
            name = member_details[member_id]["name"]
            display_name = member_details[member_id]["display_name"]
            avatar_url = member_details[member_id]["avatar_url"]
        
        # Calculate percentages
        total_percent = (times["total_seconds"] / total_time_seconds) * 100 if total_time_seconds > 0 else 0
        
        # Add to result
        result["members"][member_id] = {
            "id": member_id,
            "name": name,
            "display_name": display_name,
            "avatar_url": avatar_url,
            "total_seconds": times["total_seconds"],
            "total_percent": total_percent,
            "24h": times["24h"],
            "48h": times["48h"],
            "5d": times["5d"],
            "7d": times["7d"],
            "30d": times["30d"]
        }
        
        # Add to timeframes for easier processing
        result["timeframes"]["24h"][member_id] = times["24h"]
        result["timeframes"]["48h"][member_id] = times["48h"]
        result["timeframes"]["5d"][member_id] = times["5d"]
        result["timeframes"]["7d"][member_id] = times["7d"]
        result["timeframes"]["30d"][member_id] = times["30d"]
    
    return result

async def get_switch_frequency_metrics(days: int = 30) -> Dict[str, Any]:
    """Calculate switch frequency metrics"""
    # Get all switches for the specified period
    switches = await get_switches(1000)  # Get a large number of switches
    
    # Get current time and calculate the cutoff time
    now = datetime.utcnow()
    cutoff_time = now - timedelta(days=days)
    
    # Filter switches to only include those within the specified period
    filtered_switches = []
    for switch in switches:
        timestamp = datetime.fromisoformat(switch["timestamp"].replace("Z", "+00:00"))
        if timestamp >= cutoff_time:
            filtered_switches.append(switch)
    
    # Calculate metrics
    total_switches = len(filtered_switches)
    
    # Calculate switches per day for the last specified days
    timeframes = {
        "24h": 0,
        "48h": 0,
        "5d": 0,
        "7d": 0,
        "30d": total_switches
    }
    
    for switch in filtered_switches:
        timestamp = datetime.fromisoformat(switch["timestamp"].replace("Z", "+00:00"))
        time_ago = (now - timestamp).total_seconds()
        
        if time_ago <= 24 * 3600:  # 24 hours
            timeframes["24h"] += 1
        
        if time_ago <= 48 * 3600:  # 48 hours
            timeframes["48h"] += 1
        
        if time_ago <= 5 * 24 * 3600:  # 5 days
            timeframes["5d"] += 1
        
        if time_ago <= 7 * 24 * 3600:  # 7 days
            timeframes["7d"] += 1
    
    # Calculate average switches per day
    avg_switches_per_day = total_switches / days if days > 0 else 0
    
    return {
        "total_switches": total_switches,
        "avg_switches_per_day": avg_switches_per_day,
        "timeframes": timeframes
    }