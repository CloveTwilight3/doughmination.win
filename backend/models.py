from pydantic import BaseModel
from typing import Optional, List

class User(BaseModel):
    id: str
    username: str
    password_hash: str
    display_name: Optional[str] = None
    is_admin: bool = False

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

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None
    avatar_url: Optional[str] = None