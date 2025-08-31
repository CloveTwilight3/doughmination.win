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

import json
import os
from typing import List, Dict, Optional, Set
from models import SubSystem, MemberTag

SUBSYSTEMS_FILE = "subsystems.json"
MEMBER_TAGS_FILE = "member_tags.json"

# Default sub-systems configuration
DEFAULT_SUBSYSTEMS = [
    {
        "name": "HUNTR/X", 
        "label": "huntrix",
        "color": "#FF69B4",  # Hot pink
        "description": "All huntrix members"
    },
    {
        "name": "Saja Boys", 
        "label": "saja",
        "color": "#FF4655",  # Hot red
        "description": "All the saja boys"
    }
]

# Default member tag assignments
DEFAULT_MEMBER_TAGS = {
    "Clove": ["host"],
    "baby": ["saja"],
    "abby": ["saja"],
    "jinu": ["saja"],
    "mystery": ["saja"],
    "romance": ["saja"],
    "Rumi": ["huntrix"],
    "Zoey": ["huntrix"],
    "Mira": ["huntrix"],
    "Bobby": ["huntrix"]
}

def get_subsystems() -> List[SubSystem]:
    """Get all defined sub-systems"""
    if not os.path.exists(SUBSYSTEMS_FILE):
        # Create default subsystems file
        save_subsystems(DEFAULT_SUBSYSTEMS)
        return [SubSystem(**subsystem) for subsystem in DEFAULT_SUBSYSTEMS]
    
    with open(SUBSYSTEMS_FILE, "r") as f:
        subsystems_data = json.load(f)
    
    return [SubSystem(**subsystem) for subsystem in subsystems_data]

def save_subsystems(subsystems_data: List[Dict]):
    """Save sub-systems to file"""
    with open(SUBSYSTEMS_FILE, "w") as f:
        json.dump(subsystems_data, f, indent=2)

def get_member_tags() -> Dict[str, List[str]]:
    """Get member tag assignments"""
    if not os.path.exists(MEMBER_TAGS_FILE):
        # Create default member tags file
        save_member_tags(DEFAULT_MEMBER_TAGS)
        return DEFAULT_MEMBER_TAGS.copy()
    
    with open(MEMBER_TAGS_FILE, "r") as f:
        return json.load(f)

def save_member_tags(member_tags: Dict[str, List[str]]):
    """Save member tags to file"""
    with open(MEMBER_TAGS_FILE, "w") as f:
        json.dump(member_tags, f, indent=2)

def get_member_tags_by_id(member_id: str, member_name: str) -> List[str]:
    """Get tags for a specific member by ID or name"""
    member_tags = get_member_tags()
    
    # First try by member name
    if member_name in member_tags:
        return member_tags[member_name]
    
    # Then try by member ID
    if member_id in member_tags:
        return member_tags[member_id]
    
    return []

def update_member_tags(member_identifier: str, tags: List[str]) -> bool:
    """Update tags for a member (can use ID or name)"""
    member_tags = get_member_tags()
    member_tags[member_identifier] = tags
    save_member_tags(member_tags)
    return True

def add_member_tag(member_identifier: str, tag: str) -> bool:
    """Add a single tag to a member"""
    member_tags = get_member_tags()
    if member_identifier not in member_tags:
        member_tags[member_identifier] = []
    
    if tag not in member_tags[member_identifier]:
        member_tags[member_identifier].append(tag)
        save_member_tags(member_tags)
        return True
    
    return False

def remove_member_tag(member_identifier: str, tag: str) -> bool:
    """Remove a single tag from a member"""
    member_tags = get_member_tags()
    if member_identifier in member_tags and tag in member_tags[member_identifier]:
        member_tags[member_identifier].remove(tag)
        save_member_tags(member_tags)
        return True
    
    return False

def filter_members_by_subsystem(members: List[Dict], subsystem_filter: Optional[str] = None, include_untagged: bool = True) -> List[Dict]:
    """Filter members by sub-system tag"""
    if not subsystem_filter:
        return members
    
    member_tags = get_member_tags()
    filtered_members = []
    
    for member in members:
        member_name = member.get("name", "")
        member_id = member.get("id", "")
        
        # Get tags for this member
        tags = get_member_tags_by_id(member_id, member_name)
        
        # Check if member should be included
        if subsystem_filter in tags:
            # Add tags to member data for frontend use
            member_with_tags = {**member, "tags": tags}
            filtered_members.append(member_with_tags)
        elif include_untagged and not tags:
            # Include untagged members if requested
            member_with_tags = {**member, "tags": []}
            filtered_members.append(member_with_tags)
    
    return filtered_members

def get_members_by_subsystem(members: List[Dict]) -> Dict[str, List[Dict]]:
    """Group members by their sub-systems"""
    member_tags = get_member_tags()
    subsystems = get_subsystems()
    
    # Initialize result with all subsystems
    result = {}
    for subsystem in subsystems:
        result[subsystem.label] = []
    result["untagged"] = []
    
    for member in members:
        member_name = member.get("name", "")
        member_id = member.get("id", "")
        
        # Get tags for this member
        tags = get_member_tags_by_id(member_id, member_name)
        member_with_tags = {**member, "tags": tags}
        
        if not tags:
            result["untagged"].append(member_with_tags)
        else:
            # Add member to each subsystem they belong to
            for tag in tags:
                if tag in result:
                    result[tag].append(member_with_tags)
                elif tag == "host":
                    # Special handling for host tag - could create a separate category or add to untagged
                    if "host" not in result:
                        result["host"] = []
                    result["host"].append(member_with_tags)
    
    return result

def enrich_members_with_tags(members: List[Dict]) -> List[Dict]:
    """Add tag information to all members"""
    enriched_members = []
    
    for member in members:
        member_name = member.get("name", "")
        member_id = member.get("id", "")
        
        # Get tags for this member
        tags = get_member_tags_by_id(member_id, member_name)
        
        # Add tags to member data
        member_with_tags = {**member, "tags": tags}
        enriched_members.append(member_with_tags)
    
    return enriched_members

def validate_subsystem_tag(tag: str) -> bool:
    """Check if a tag corresponds to a valid sub-system"""
    subsystems = get_subsystems()
    valid_tags = [s.label for s in subsystems] + ["host"]  # Allow "host" as special tag
    return tag in valid_tags

def initialize_default_subsystems():
    """Initialize default sub-systems and member tags if they don't exist"""
    if not os.path.exists(SUBSYSTEMS_FILE):
        save_subsystems(DEFAULT_SUBSYSTEMS)
        print("Initialized default sub-systems: Pets, Valorant, Vocaloids")
    
    if not os.path.exists(MEMBER_TAGS_FILE):
        save_member_tags(DEFAULT_MEMBER_TAGS)
        print("Initialized default member tags")
