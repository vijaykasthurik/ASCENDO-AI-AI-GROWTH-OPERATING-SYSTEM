import re
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PASSWORD_RESET_PURPOSE = "password_reset"

_HAS_LOWER = re.compile(r"[a-z]")
_HAS_UPPER = re.compile(r"[A-Z]")
_HAS_DIGIT = re.compile(r"\d")
_HAS_SPECIAL = re.compile(r"[^\w\s]")


def validate_password_strength(password: str) -> None:
    """Rejects any password that doesn't satisfy the policy, naming exactly
    what's missing so the frontend/API caller can show a precise error.
    """
    missing = []
    if len(password) < 8:
        missing.append("at least 8 characters")
    if not _HAS_LOWER.search(password):
        missing.append("a lowercase letter")
    if not _HAS_UPPER.search(password):
        missing.append("an uppercase letter")
    if not _HAS_DIGIT.search(password):
        missing.append("a number")
    if not _HAS_SPECIAL.search(password):
        missing.append("a special character")
    if missing:
        raise ValueError("Password must contain " + ", ".join(missing) + ".")


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: str, extra_claims: dict[str, Any] | None = None, expires_minutes: int | None = None
) -> str:
    settings = get_settings()
    minutes = expires_minutes if expires_minutes is not None else settings.jwt_expire_minutes
    expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc
