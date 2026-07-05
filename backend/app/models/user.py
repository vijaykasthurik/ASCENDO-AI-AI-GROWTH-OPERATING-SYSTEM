from datetime import datetime, timezone

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.security import validate_password_strength


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)

    @field_validator("password")
    @classmethod
    def _check_password_strength(cls, value: str) -> str:
        validate_password_strength(value)
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str = Field(min_length=8)

    @field_validator("new_password")
    @classmethod
    def _check_password_strength(cls, value: str) -> str:
        validate_password_strength(value)
        return value


class UserInDB(BaseModel):
    email: EmailStr
    full_name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    full_name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
