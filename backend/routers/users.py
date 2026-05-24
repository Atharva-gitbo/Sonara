from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime

from database import get_db
from auth import hash_password, verify_password, create_access_token, get_current_user, require_admin
from models.user import UserRegister, UserLogin, UserUpdate, PasswordChange, UserOut, TokenResponse

router = APIRouter(prefix="/api/users", tags=["users"])


def _user_out(u: dict) -> UserOut:
    return UserOut(
        id=str(u["_id"]),
        username=u["username"],
        email=u["email"],
        role=u["role"],
        created_at=u["created_at"],
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: UserRegister):
    db = get_db()
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(400, "Email already registered")
    if await db.users.find_one({"username": body.username}):
        raise HTTPException(400, "Username already taken")

    user_doc = {
        "username": body.username,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "role": "user",
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    return TokenResponse(access_token=token, user=_user_out(user_doc))


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token, user=_user_out(user))


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    return _user_out(current_user)


@router.put("/me", response_model=UserOut)
async def update_me(body: UserUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "Nothing to update")

    if "email" in updates and updates["email"] != current_user["email"]:
        if await db.users.find_one({"email": updates["email"]}):
            raise HTTPException(400, "Email already in use")
    if "username" in updates and updates["username"] != current_user["username"]:
        if await db.users.find_one({"username": updates["username"]}):
            raise HTTPException(400, "Username already taken")

    await db.users.update_one({"_id": current_user["_id"]}, {"$set": updates})
    updated = await db.users.find_one({"_id": current_user["_id"]})
    return _user_out(updated)


@router.put("/me/password")
async def change_password(body: PasswordChange, current_user=Depends(get_current_user)):
    db = get_db()
    if not verify_password(body.current_password, current_user["password_hash"]):
        raise HTTPException(400, "Current password is incorrect")
    new_hash = hash_password(body.new_password)
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": {"password_hash": new_hash}})
    return {"message": "Password updated successfully"}


# ── Admin routes ──────────────────────────────────────────────────────────────

@router.get("/", response_model=list[UserOut])
async def list_users(admin=Depends(require_admin)):
    db = get_db()
    users = await db.users.find().sort("created_at", -1).to_list(None)
    return [_user_out(u) for u in users]


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str, admin=Depends(require_admin)):
    db = get_db()
    if str(admin["_id"]) == user_id:
        raise HTTPException(400, "Cannot delete your own account")
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "User not found")
    await db.cart.delete_many({"user_id": user_id})


@router.put("/{user_id}/role")
async def set_user_role(user_id: str, role: str, admin=Depends(require_admin)):
    if role not in ("user", "admin"):
        raise HTTPException(400, "Role must be 'user' or 'admin'")
    db = get_db()
    result = await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": role}})
    if result.matched_count == 0:
        raise HTTPException(404, "User not found")
    return {"message": f"Role updated to {role}"}
