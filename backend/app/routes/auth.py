"""
Authentication routes - signup, login, email verification
Enforces email verification via AWS SES - no auto-verify fallback
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import secrets

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserLogin, UserResponse, Token
from ..services.email_service import send_verification_email
from ..config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register new user. Sends verification email via AWS SES. User MUST verify email before login."""
    print(f"Registration attempt for: {user_data.email}")

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        # If existing user is unverified, allow re-registration with new token
        if not existing_user.is_verified:
            print(f"Unverified user re-registering: {user_data.email}")
            existing_user.name = user_data.name
            existing_user.password_hash = hash_password(user_data.password)
            existing_user.verification_token = secrets.token_urlsafe(32)
            existing_user.verification_sent_at = datetime.utcnow()
            try:
                db.commit()
                db.refresh(existing_user)
            except Exception as e:
                db.rollback()
                raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
            try:
                await send_verification_email(
                    user_data.email, user_data.name,
                    existing_user.verification_token, settings.FRONTEND_URL
                )
                print(f"Re-sent verification email to: {user_data.email}")
            except Exception as e:
                print(f"SES email failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Could not send verification email. Please try again later."
                )
            return {
                "message": "Verification email sent! Please check your inbox.",
                "email": user_data.email,
                "requires_verification": True
            }

        print(f"Email already exists (verified): {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please login instead."
        )

    # Generate verification token
    verification_token = secrets.token_urlsafe(32)

    # Create new user (UNVERIFIED)
    hashed_pw = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_pw,
        is_verified=False,
        verification_token=verification_token,
        verification_sent_at=datetime.utcnow()
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
        print(f"User created (unverified): {new_user.user_id}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

    # Send verification email via SES - MUST succeed, no auto-verify fallback
    try:
        await send_verification_email(
            user_data.email, user_data.name,
            verification_token, settings.FRONTEND_URL
        )
        print(f"Verification email sent to: {user_data.email}")
    except Exception as e:
        print(f"SES email failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not send verification email. Please try again later."
        )

    return {
        "message": "Registration successful! Please check your email to verify your account.",
        "email": user_data.email,
        "requires_verification": True
    }


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user - requires verified email"""
    print(f"Login attempt for: {credentials.email}")
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    # Strict verification check (None = True for pre-existing users)
    is_verified = user.is_verified if user.is_verified is not None else True
    if not is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox for the verification link."
        )

    print(f"Login successful for: {user.email}")
    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token, user=UserResponse.from_orm(user))


@router.get("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify user email address using the token from the verification link"""
    print(f"Email verification attempt with token: {token[:10]}...")

    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")

    if user.is_verified:
        return {"message": "Email already verified. You can login now.", "verified": True}

    # Check if token expired (24 hours)
    if user.verification_sent_at:
        token_age = datetime.utcnow() - user.verification_sent_at
        if token_age.total_seconds() > 86400:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification link expired. Please request a new one.")

    # Mark user as verified
    user.is_verified = True
    user.verification_token = None
    try:
        db.commit()
        print(f"Email verified for: {user.email}")
        access_token = create_access_token(data={"sub": user.email})
        return {
            "message": "Email verified successfully! You can now login.",
            "verified": True,
            "access_token": access_token,
            "user": {"user_id": user.user_id, "name": user.name, "email": user.email}
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to verify email")


@router.post("/resend-verification")
async def resend_verification(data: dict, db: Session = Depends(get_db)):
    """Resend verification email"""
    email = data.get("email", "")
    print(f"Resend verification for: {email}")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"message": "If that email is registered, a verification link has been sent."}

    if user.is_verified:
        return {"message": "Email already verified. You can login."}

    # Rate limit: 60 second cooldown
    if user.verification_sent_at:
        elapsed = (datetime.utcnow() - user.verification_sent_at).total_seconds()
        if elapsed < 60:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {int(60 - elapsed)} seconds before requesting another email."
            )

    new_token = secrets.token_urlsafe(32)
    user.verification_token = new_token
    user.verification_sent_at = datetime.utcnow()
    try:
        db.commit()
        await send_verification_email(email, user.name, new_token, settings.FRONTEND_URL)
        print(f"Verification email resent to: {email}")
        return {"message": "Verification email sent. Please check your inbox."}
    except Exception as e:
        db.rollback()
        print(f"Failed to resend verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not send verification email. Please try again later."
        )
