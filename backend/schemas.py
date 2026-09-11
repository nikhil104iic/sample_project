from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


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
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
