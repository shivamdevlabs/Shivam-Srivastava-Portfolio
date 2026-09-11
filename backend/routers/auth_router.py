from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

try:
    from models import User, Token, AdminProfileUpdate
    from auth import (
        get_current_admin,
        get_password_hash,
        verify_password,
        create_access_token,
        ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    from database import get_db
except ImportError:
    from backend.models import User, Token, AdminProfileUpdate
    from backend.auth import (
        get_current_admin,
        get_password_hash,
        verify_password,
        create_access_token,
        ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    from backend.database import get_db

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
    user = {
        "name": "Admin",
        "email": "admin@admin.com",
        "hashed_password": hashed_password,
    }
    await users_collection.insert_one(user)
    return {"msg": "Admin created successfully"}


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    users_collection = db["users"]
    user = await users_collection.find_one({"email": form_data.username.lower()})

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


@router.get("/me")
async def get_current_user_profile(
    current_admin_email: str = Depends(get_current_admin),
):
    db = get_db()
    user = await db["users"].find_one({"email": current_admin_email})
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return {
        "name": user.get("name", "Admin"),
        "email": user["email"],
    }


@router.put("/profile")
async def update_admin_profile(
    payload: AdminProfileUpdate,
    current_admin_email: str = Depends(get_current_admin),
):
    db = get_db()
    users_collection = db["users"]
    user = await users_collection.find_one({"email": current_admin_email})
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")

    update_fields = {}

    # Check if updating sensitive fields (email or password)
    is_updating_sensitive = (
        (payload.email and payload.email.lower() != user["email"].lower())
        or bool(payload.new_password)
    )

    if is_updating_sensitive:
        if not payload.current_password:
            raise HTTPException(
                status_code=400,
                detail="Current password is required to change email or password",
            )
        if not verify_password(payload.current_password, user["hashed_password"]):
            raise HTTPException(
                status_code=400, detail="Current password is incorrect"
            )

    # 1. Update Name
    if payload.name is not None:
        name = payload.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        update_fields["name"] = name

    # 2. Update Email
    new_email = None
    if payload.email and payload.email.lower() != user["email"].lower():
        new_email = payload.email.lower()
        existing = await users_collection.find_one({"email": new_email})
        if existing and str(existing["_id"]) != str(user["_id"]):
            raise HTTPException(
                status_code=400,
                detail="This email is already in use by another account",
            )
        update_fields["email"] = new_email

    # 3. Update Password
    if payload.new_password:
        if len(payload.new_password) < 6:
            raise HTTPException(
                status_code=400,
                detail="New password must be at least 6 characters",
            )
        update_fields["hashed_password"] = get_password_hash(payload.new_password)

    if not update_fields:
        return {"msg": "No changes were made"}

    await users_collection.update_one({"_id": user["_id"]}, {"$set": update_fields})

    # If email was updated, generate a fresh token so user stays authenticated
    effective_email = new_email if new_email else user["email"]
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_token = create_access_token(
        data={"sub": effective_email}, expires_delta=access_token_expires
    )

    return {
        "msg": "Profile updated successfully",
        "name": update_fields.get("name", user.get("name", "Admin")),
        "email": effective_email,
        "access_token": new_token,
    }
