from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str = "user"
    avatar_url: Optional[str] = None
    created_at: str
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[dict] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    user: UserResponse