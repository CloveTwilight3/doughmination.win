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

from datetime import datetime, timedelta, timezone
import httpx
import os
from dotenv import load_dotenv
from cache import get_from_cache, set_in_cache
from typing import List, Dict, Any, Optional
import traceback
import re

load_dotenv()

BASE_URL = "https://api.pluralkit.me/v2"
TOKEN = os.getenv("SYSTEM_TOKEN")
CACHE_TTL = int(os.getenv("CACHE_TTL", 30))

HEADERS = {
    "Authorization": TOKEN
}

def parse_timestamp(timestamp_str: str) -> datetime:
    """Parse timestamp string into datetime with proper timezone handling"""
    try:
        # Handle Z timezone
        if timestamp_str.endswith('Z'):
            timestamp_str = timestamp_str[:-1] + '+00:00'
        
        # Try direct parsing first
        try:
            dt = datetime.fromisoformat(timestamp_str)
        except ValueError:
            # If direct parsing fails, try handling microsecond precision issues
            match = re.match(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+)(\+\d{2}:\d{2})', timestamp_str)
            if match:
                # Truncate microseconds to 6 digits and rebuild the string
                base = match.group(1)
                if len(base.split('.')[-1]) > 6:
                    base = base.split('.')[0] + '.' + base.split('.')[-1][:6]
                timestamp_str = f"{base}{match.group(2)}"
                dt = datetime.fromisoformat(timestamp_str)
            else:
                # Try another approach for microsecond issues
                parts = timestamp_str.split('.')
                if len(parts) == 2 and '+' in parts[1]:
                    ms_part, tz_part = parts[1].split('+', 1)
                    if len(ms_part) > 6:
                        ms_part = ms_part[:6]
                    timestamp_str = f"{parts[0]}.{ms_part}+{tz_part}"
                    dt = datetime.fromisoformat(timestamp_str)
                else:
                    raise ValueError(f"Could not parse timestamp: {timestamp_str}")
        
        # Ensure it's timezone-aware
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        
        return dt
    except Exception as e:
        print(f"Error parsing timestamp {timestamp_str}: {str(e)}")
        raise

async def get_switches(limit: int = 1000) -> List[Dict[str, Any]]:
    """Get recent switches from PluralKit"""
    try:
        cache_key = f"switches_{limit}"
        if (cached := get_from_cache(cache_key)):
            return cached
        
        print(f"Fetching switches from PluralKit API, limit={limit}")
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{BASE_URL}/systems/@me/switches?limit={limit}", headers=HEADERS)
            resp.raise_for_status()
            data = resp.json()
            print(f"Received {len(data)} switches from API")
            set_in_cache(cache_key, data, CACHE_TTL)
            return data
    except Exception as e:
        print(f"Error in get_switches: {str(e)}")
        print(traceback.format_exc())
        # Return empty list instead of failing
        return []

async def get_fronting_time_metrics(days: int = 30) -> Dict[str, Any]:
    """Calculate fronting time metrics for each member"""
    try:
        print(f"Calculating fronting metrics for past {days} days")
        # Get all switches for the specified period
        switches = await get_switches(1000)  # Get a large number of switches
        print(f"Retrieved {len(switches)} switches")
        
        # Get current time and calculate the cutoff time
        now = datetime.now(timezone.utc)
        cutoff_time = now - timedelta(days=days)
        print(f"Cutoff time: {cutoff_time.isoformat()}")
        
        # Get member details for display purposes
        member_details = {}
        try:
            from pluralkit import get_members
            members = await get_members()
            print(f"Retrieved {len(members)} members for details")
            for member in members:
                member_details[member["id"]] = {
                    "name": member["name"],
                    "display_name": member.get("display_name", member["name"]),
                    "avatar_url": member.get("avatar_url", None)
                }
        except Exception as e:
            print(f"Error fetching member details: {e}")
            print(traceback.format_exc())
        
        # Filter switches to only include those within the specified period
        filtered_switches = []
        for switch in switches:
            try:
                timestamp = parse_timestamp(switch["timestamp"])
                if timestamp >= cutoff_time:
                    filtered_switches.append({
                        **switch,
                        "_parsed_timestamp": timestamp  # Store the parsed timestamp
                    })
            except Exception as e:
                print(f"Error parsing timestamp {switch.get('timestamp', 'unknown')}: {str(e)}")
                continue
        
        print(f"Filtered to {len(filtered_switches)} switches within time period")
        
        # Sort switches by timestamp (oldest first)
        filtered_switches.sort(key=lambda x: x["_parsed_timestamp"])
        
        # Calculate fronting time for each member
        fronting_times = {}
        
        # If there are no switches in the period, return empty metrics
        if not filtered_switches:
            print("No switches found in the specified time period")
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
            "members": current_members,
            "_parsed_timestamp": now
        })
        
        # Calculate total time for each member
        total_time_seconds = 0
        for i in range(1, len(filtered_switches)):
            prev_switch = filtered_switches[i-1]
            curr_switch = filtered_switches[i]
            
            try:
                # Use the parsed timestamps
                prev_time = prev_switch["_parsed_timestamp"]
                curr_time = curr_switch["_parsed_timestamp"]
                
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
            except Exception as e:
                print(f"Error processing switch {i}: {str(e)}")
                print(f"Previous switch timestamp: {prev_switch.get('timestamp', 'unknown')}")
                print(f"Current switch timestamp: {curr_switch.get('timestamp', 'unknown')}")
                print(traceback.format_exc())
                continue
        
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
        
        print(f"Successfully calculated metrics for {len(result['members'])} members")
        return result
    except Exception as e:
        print(f"Error in get_fronting_time_metrics: {str(e)}")
        print(traceback.format_exc())
        # Return a basic structure so the frontend doesn't crash
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

async def get_switch_frequency_metrics(days: int = 30) -> Dict[str, Any]:
    """Calculate switch frequency metrics"""
    try:
        # Get all switches for the specified period
        switches = await get_switches(1000)  # Get a large number of switches
        
        # Get current time and calculate the cutoff time
        now = datetime.now(timezone.utc)
        cutoff_time = now - timedelta(days=days)
        
        # Filter switches to only include those within the specified period
        filtered_switches = []
        for switch in switches:
            try:
                timestamp = parse_timestamp(switch["timestamp"])
                if timestamp >= cutoff_time:
                    filtered_switches.append({
                        **switch,
                        "_parsed_timestamp": timestamp
                    })
            except Exception as e:
                print(f"Error parsing timestamp in switch_frequency: {str(e)}")
                continue
        
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
            try:
                timestamp = switch["_parsed_timestamp"]
                time_ago = (now - timestamp).total_seconds()
                
                if time_ago <= 24 * 3600:  # 24 hours
                    timeframes["24h"] += 1
                
                if time_ago <= 48 * 3600:  # 48 hours
                    timeframes["48h"] += 1
                
                if time_ago <= 5 * 24 * 3600:  # 5 days
                    timeframes["5d"] += 1
                
                if time_ago <= 7 * 24 * 3600:  # 7 days
                    timeframes["7d"] += 1
            except Exception as e:
                print(f"Error calculating timeframes: {str(e)}")
                continue
        
        # Calculate average switches per day
        avg_switches_per_day = total_switches / days if days > 0 else 0
        
        return {
            "total_switches": total_switches,
            "avg_switches_per_day": avg_switches_per_day,
            "timeframes": timeframes
        }
    except Exception as e:
        print(f"Error in get_switch_frequency_metrics: {str(e)}")
        print(traceback.format_exc())
        # Return basic structure
        return {
            "total_switches": 0,
            "avg_switches_per_day": 0,
            "timeframes": {
                "24h": 0,
                "48h": 0,
                "5d": 0,
                "7d": 0,
                "30d": 0
            }
        }