from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.database import db_service
from app.utils.jwt import create_access_token, create_refresh_token, get_token_expiry
from app.utils.logger import logger, log_auth
from app.config import settings
from app.middleware.auth import get_current_user
import httpx

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user using Supabase Auth"""
    try:
        logger.info(f"Registration attempt for email: {user_data.email}")
        
        # Register with Supabase Auth (profile auto-created by trigger)
        async with httpx.AsyncClient() as client:
            auth_response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/signup",
                headers={
                    "apikey": settings.SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "email": user_data.email,
                    "password": user_data.password,
                    "data": {
                        "full_name": user_data.full_name
                    }
                }
            )
            
            if auth_response.status_code != 200:
                error_detail = auth_response.json()
                logger.error(f"Supabase auth registration failed: {error_detail}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error_detail.get("msg", "Registration failed")
                )
            
            auth_data = auth_response.json()
            user = auth_data.get("user")
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create user"
                )
            
            # Generate JWT tokens
            token_data = {
                "sub": user["id"],
                "email": user["email"],
                "role": "user"
            }
            
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)
            
            log_auth("REGISTER", user_id=user["id"], details="User registered successfully")
            
            user_response = UserResponse(
                id=user["id"],
                email=user["email"],
                full_name=user_data.full_name,
                role="user",
                avatar_url=None,
                created_at=user["created_at"]
            )
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=get_token_expiry(),
                user=user_response
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )
@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user using Supabase Auth"""
    try:
        logger.info(f"Login attempt for email: {credentials.email}")
        
        # Login with Supabase Auth
        async with httpx.AsyncClient() as client:
            auth_response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
                headers={
                    "apikey": settings.SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "email": credentials.email,
                    "password": credentials.password
                }
            )
            
            if auth_response.status_code != 200:
                log_auth("FAILED", details=f"Invalid credentials for: {credentials.email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            auth_data = auth_response.json()
            user = auth_data.get("user")
            
            # Get profile data
            profiles = await db_service.query(
                table="profiles",
                filters={"id": user["id"]}
            )
            
            profile = profiles[0] if profiles else {}
            
            # Generate our own JWT tokens
            token_data = {
                "sub": user["id"],
                "email": user["email"],
                "role": profile.get("role", "user")
            }
            
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)
            
            log_auth("LOGIN", user_id=user["id"], details="Login successful")
            
            user_response = UserResponse(
                id=user["id"],
                email=user["email"],
                full_name=profile.get("full_name"),
                role=profile.get("role", "user"),
                avatar_url=profile.get("avatar_url"),
                created_at=user["created_at"]
            )
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=get_token_expiry(),
                user=user_response
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    try:
        user_id = current_user["user_id"]
        
        profiles = await db_service.query(
            table="profiles",
            filters={"id": user_id}
        )
        
        if not profiles:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        profile = profiles[0]
        
        return UserResponse(
            id=user_id,
            email=profile["email"],
            full_name=profile["full_name"],
            role=profile["role"],
            avatar_url=profile.get("avatar_url"),
            created_at=profile["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get current user failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )