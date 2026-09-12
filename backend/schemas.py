from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

from models import UserRole


# --- Request Schemas ---

class UserCreate(BaseModel):
    """Schema for user registration."""
    email: str
    password: str
    full_name: str


class UserLogin(BaseModel):
    """Schema for user login."""
    email: str
    password: str


class RoleUpdate(BaseModel):
    role: UserRole


# --- Response Schemas ---

class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Schema for returning user data (no password)."""
    id: int
    email: str
    full_name: str
    role: UserRole
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProfileResponse(BaseModel):
    """Minimal profile returned after authentication."""
    full_name: str
    email: str
    role: UserRole


class DocumentResponse(BaseModel):
    """Metadata returned for an uploaded PDF."""
    id: int
    original_name: str
    file_size: int
    uploaded_by: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
