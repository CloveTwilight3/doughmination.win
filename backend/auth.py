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

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-for-jwt")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

@router.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = verify_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = jwt.encode({
        "sub": user.username,
        "id": user.id,
        "display_name": user.display_name,
        "admin": user.is_admin,
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
        is_admin=user.is_admin
    )