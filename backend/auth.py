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

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from users import verify_user, get_user_by_username
from models import UserResponse

load_dotenv()

router = APIRouter()

# Debug environment variables
print("==== AUTH DEBUGGING ====")
print(f"JWT_SECRET available: {'Yes, length: ' + str(len(os.getenv('JWT_SECRET'))) if os.getenv('JWT_SECRET') else 'No'}")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-for-jwt")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

@router.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    print(f"Login attempt: username='{form_data.username}', password_length={len(form_data.password)}")
    
    # Debug: Check if the user exists
    existing_user = get_user_by_username(form_data.username)
    if existing_user:
        print(f"User found in database: id={existing_user.id}")
        print(f"  username='{existing_user.username}'")
        print(f"  is_admin={existing_user.is_admin}")
        print(f"  password_hash_starts_with='{existing_user.password_hash[:10]}...'")
    else:
        print(f"User NOT found in database: '{form_data.username}'")
    
    # Try authenticate
    user = verify_user(form_data.username, form_data.password)
    if not user:
        print(f"Authentication FAILED for: '{form_data.username}'")
        if existing_user:
            print("  User exists but password verification failed")
            # Debug the bcrypt verification process
            from passlib.hash import bcrypt
            try:
                is_valid = bcrypt.verify(form_data.password, existing_user.password_hash)
                print(f"  Bcrypt verify result: {is_valid}")
            except Exception as e:
                print(f"  Bcrypt error: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Authentication SUCCESS for: '{form_data.username}'")
    
    token = jwt.encode({
        "sub": user.username,
        "id": user.id,
        "display_name": user.display_name,
        "admin": user.is_admin,
        "avatar_url": getattr(user, 'avatar_url', None),  # Include avatar_url in the token
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }, JWT_SECRET, algorithm=ALGORITHM)

    return {"access_token": token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = get_user_by_username(username)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
            
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.get("/api/user_info", response_model=UserResponse)
def get_user_info(user = Depends(get_current_user)):
    return UserResponse(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        is_admin=user.is_admin,
        avatar_url=getattr(user, 'avatar_url', None)  # Include avatar_url in the response
    )