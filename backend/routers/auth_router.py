from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from models import User, Token
from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Setup initial admin if it doesn't exist
@router.post("/setup")
async def setup_admin():
    db = get_db()
    users_collection = db["users"]
    existing_user = await users_collection.find_one({"email": "admin@admin.com"})
    if existing_user:
        return {"msg": "Admin already exists"}
    
    hashed_password = get_password_hash("admin123")
    user = {"email": "admin@admin.com", "hashed_password": hashed_password}
    await users_collection.insert_one(user)
    return {"msg": "Admin created successfully"}

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    users_collection = db["users"]
    user = await users_collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
