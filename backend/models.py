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

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class User(BaseModel):
    id: str
    username: str
    password_hash: str
    display_name: Optional[str] = None
    is_admin: bool = False
    avatar_url: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str
    display_name: Optional[str] = None
    is_admin: bool = False

class UserResponse(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    is_admin: bool = False
    avatar_url: Optional[str] = None

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None
    avatar_url: Optional[str] = None

class MentalState(BaseModel):
    level: str  # safe, unstable, idealizing, self-harming, highly at risk
    updated_at: datetime
    notes: Optional[str] = None

class SystemInfo(BaseModel):
    id: str
    name: str
    description: Optional[str]
    tag: Optional[str]
    mental_state: Optional[MentalState] = None

# Sub-system models
class SubSystem(BaseModel):
    """Model for sub-system definitions"""
    name: str
    label: str
    color: Optional[str] = None
    description: Optional[str] = None

class MemberTag(BaseModel):
    """Model for member tags/sub-system assignments"""
    member_id: str
    member_name: str
    tags: List[str]  # List of sub-system labels

class SubSystemFilter(BaseModel):
    """Model for filtering members by sub-system"""
    subsystem: Optional[str] = None  # Filter by specific sub-system label
    include_untagged: bool = True  # Whether to include members without tags

# New models for cofront support

class DynamicCofrontCreate(BaseModel):
    """Model for creating a dynamic cofront"""
    member_ids: List[str]
    name: Optional[str] = None
    set_as_current: bool = False

class CofrontResponse(BaseModel):
    """Model for cofront information"""
    is_cofront: bool = True
    component_members: List[Dict[str, Any]]
    display_name: str
    original_name: str
    component_avatars: List[str]
    member_count: int
    is_dynamic: Optional[bool] = False

class MultiSwitchRequest(BaseModel):
    """Model for switching multiple fronters at once"""
    member_ids: List[str]

class MultiSwitchResponse(BaseModel):
    """Response for multi-switch operation"""
    status: str
    message: str
    fronters: List[Dict[str, Any]]
    count: int
