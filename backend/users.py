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
import uuid
from typing import List, Optional
from passlib.hash import bcrypt
from models import User, UserCreate, UserResponse, UserUpdate
import time

USERS_FILE = "users.json"

def get_users() -> List[User]:
    if not os.path.exists(USERS_FILE):
        return []
    
    with open(USERS_FILE, "r") as f:
        users_data = json.load(f)
    
    return [User(**user) for user in users_data]

def save_users(users: List[User]):
    with open(USERS_FILE, "w") as f:
        json.dump([user.dict() for user in users], f, indent=2)

def get_user_by_username(username: str) -> Optional[User]:
    users = get_users()
    for user in users:
        if user.username.lower() == username.lower():
            return user
    return None

def get_user_by_id(user_id: str) -> Optional[User]:
    users = get_users()
    for user in users:
        if user.id == user_id:
            return user
    return None

def create_user(user_create: UserCreate) -> User:
    users = get_users()
    
    # Check if username already exists
    if get_user_by_username(user_create.username):
        raise ValueError(f"Username '{user_create.username}' already exists")
    
    # Create new user
    new_user = User(
        id=str(uuid.uuid4()),
        username=user_create.username,
        password_hash=bcrypt.hash(user_create.password),
        display_name=user_create.display_name,
        is_admin=user_create.is_admin,
        avatar_url=None
    )
    
    users.append(new_user)
    save_users(users)
    
    return new_user

def update_user(user_id: str, user_update: UserUpdate) -> Optional[User]:
    users = get_users()
    
    for i, user in enumerate(users):
        if user.id == user_id:
            # Verify current password if attempting to change password
            if user_update.current_password and user_update.new_password:
                if not bcrypt.verify(user_update.current_password, user.password_hash):
                    raise ValueError("Current password is incorrect")
                
                # Update password hash
                password_hash = bcrypt.hash(user_update.new_password)
            else:
                # Keep existing password
                password_hash = user.password_hash
            
            # Update the user
            updated_user = User(
                id=user.id,
                username=user.username,
                password_hash=password_hash,
                display_name=user_update.display_name if user_update.display_name is not None else user.display_name,
                is_admin=user.is_admin,
                avatar_url=user_update.avatar_url if user_update.avatar_url is not None else getattr(user, 'avatar_url', None)
            )
            users[i] = updated_user
            save_users(users)
            return updated_user
    
    return None

def delete_user(user_id: str) -> bool:
    users = get_users()
    
    original_count = len(users)
    users = [user for user in users if user.id != user_id]
    
    if len(users) < original_count:
        save_users(users)
        return True
    
    return False

def verify_user(username: str, password: str) -> Optional[User]:
    user = get_user_by_username(username)
    if user and bcrypt.verify(password, user.password_hash):
        return user
    return None

def initialize_admin_user():
    """Creates the admin user from environment variables if no users exist"""
    import os
    from dotenv import load_dotenv
    import re
    
    load_dotenv()
    
    users = get_users()
    if not users:
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin_password_or_hash = os.getenv("ADMIN_PASSWORD")
        admin_display_name = os.getenv("ADMIN_DISPLAY_NAME", "Administrator")
        
        if not admin_password_or_hash:
            print("Warning: No ADMIN_PASSWORD set in environment. Using default password 'admin'")
            admin_password_or_hash = "admin"
        
        try:
            # Check if the password is already a bcrypt hash
            # Bcrypt hashes typically start with $2a$, $2b$, or $2y$
            is_hash = bool(re.match(r'^\$2[aby]\$\d+\$.+', admin_password_or_hash))
            
            if is_hash:
                # If it's already a hash, create the user directly
                new_user = User(
                    id=str(uuid.uuid4()),
                    username=admin_username,
                    password_hash=admin_password_or_hash,
                    display_name=admin_display_name,
                    is_admin=True,
                    avatar_url=None
                )
                users.append(new_user)
                save_users(users)
                print(f"Created admin user with provided hash: {admin_username} (Display name: {admin_display_name})")
            else:
                # If it's not a hash, create the user normally which will hash the password
                create_user(UserCreate(
                    username=admin_username,
                    password=admin_password_or_hash,
                    display_name=admin_display_name,
                    is_admin=True
                ))
                print(f"Created admin user: {admin_username} (Display name: {admin_display_name})")
        except Exception as e:
            print(f"Error creating admin user: {e}")