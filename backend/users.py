import json
import os
import uuid
from typing import List, Optional
from passlib.hash import bcrypt
from models import User, UserCreate, UserResponse
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
        is_admin=user_create.is_admin
    )
    
    users.append(new_user)
    save_users(users)
    
    return new_user

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
    
    load_dotenv()
    
    users = get_users()
    if not users:
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin_password = os.getenv("ADMIN_PASSWORD")
        
        if not admin_password:
            print("Warning: No ADMIN_PASSWORD set in environment. Using default password 'admin'")
            admin_password = "admin"
        
        try:
            create_user(UserCreate(
                username=admin_username,
                password=admin_password,
                is_admin=True
            ))
            print(f"Created admin user: {admin_username}")
        except Exception as e:
            print(f"Error creating admin user: {e}")