import secrets
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.core.email_client import send_email
from app.core.email_templates import otp_email, password_changed_email, welcome_email
from app.core.security import (
    PASSWORD_RESET_PURPOSE,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.db import mongodb
from app.models.user import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserLogin,
    UserPublic,
    VerifyOtpRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])

OTP_EXPIRE_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
RESET_TOKEN_EXPIRE_MINUTES = 10


@router.post("/register", response_model=Token)
async def register(payload: UserCreate, background_tasks: BackgroundTasks) -> Token:
    existing = await mongodb.users_collection().find_one({"email": payload.email})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    doc = {
        "email": payload.email,
        "full_name": payload.full_name,
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    result = await mongodb.users_collection().insert_one(doc)
    user_id = str(result.inserted_id)
    token = create_access_token(subject=user_id)

    subject, html, text = welcome_email(payload.full_name)
    background_tasks.add_task(send_email, payload.email, subject, html, text)

    return Token(
        access_token=token,
        user=UserPublic(id=user_id, email=payload.email, full_name=payload.full_name),
    )


@router.post("/login", response_model=Token)
async def login(payload: UserLogin) -> Token:
    doc = await mongodb.users_collection().find_one({"email": payload.email})
    if not doc or not verify_password(payload.password, doc["hashed_password"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    user_id = str(doc["_id"])
    token = create_access_token(subject=user_id)
    return Token(
        access_token=token,
        user=UserPublic(id=user_id, email=doc["email"], full_name=doc["full_name"]),
    )


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, background_tasks: BackgroundTasks) -> dict:
    generic_response = {"message": "If that email is registered, we've sent a verification code."}

    user = await mongodb.users_collection().find_one({"email": payload.email})
    if not user:
        return generic_response

    otp = "".join(secrets.choice("0123456789") for _ in range(6))
    now = datetime.now(timezone.utc)
    await mongodb.password_resets_collection().update_one(
        {"email": payload.email},
        {
            "$set": {
                "email": payload.email,
                "otp_hash": hash_password(otp),
                "expires_at": now + timedelta(minutes=OTP_EXPIRE_MINUTES),
                "attempts": 0,
                "created_at": now,
            }
        },
        upsert=True,
    )

    subject, html, text = otp_email(user["full_name"], otp, purpose="reset your password")
    background_tasks.add_task(send_email, payload.email, subject, html, text)

    return generic_response


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtpRequest) -> dict:
    doc = await mongodb.password_resets_collection().find_one({"email": payload.email})
    if not doc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code")

    now = datetime.now(timezone.utc)
    expires_at = doc["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if doc["attempts"] >= OTP_MAX_ATTEMPTS or now > expires_at:
        await mongodb.password_resets_collection().delete_one({"email": payload.email})
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code")

    if not verify_password(payload.otp, doc["otp_hash"]):
        await mongodb.password_resets_collection().update_one(
            {"email": payload.email}, {"$inc": {"attempts": 1}}
        )
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code")

    user = await mongodb.users_collection().find_one({"email": payload.email})
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code")

    await mongodb.password_resets_collection().delete_one({"email": payload.email})

    reset_token = create_access_token(
        subject=str(user["_id"]),
        extra_claims={"purpose": PASSWORD_RESET_PURPOSE},
        expires_minutes=RESET_TOKEN_EXPIRE_MINUTES,
    )
    return {"reset_token": reset_token}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, background_tasks: BackgroundTasks) -> dict:
    try:
        claims = decode_access_token(payload.reset_token)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link") from exc

    if claims.get("purpose") != PASSWORD_RESET_PURPOSE:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link")

    user_id = claims["sub"]
    user = await mongodb.users_collection().find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link")

    await mongodb.users_collection().update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"hashed_password": hash_password(payload.new_password)}},
    )

    subject, html, text = password_changed_email(user["full_name"])
    background_tasks.add_task(send_email, user["email"], subject, html, text)

    return {"status": "ok", "message": "Password updated successfully."}
