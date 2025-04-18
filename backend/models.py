from pydantic import BaseModel
from typing import Optional, List

class User(BaseModel):
    id: str
    username: str
    password_hash: str
    is_admin: bool = False

class UserCreate(BaseModel):
    username: str
    password: str
    is_admin: bool = False

class UserResponse(BaseModel):
    id: str
    username: str
    is_admin: bool = False