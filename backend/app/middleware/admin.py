from fastapi import HTTPException, status, Depends
from app.middleware.auth import get_current_user
from app.utils.logger import logger

async def require_admin(current_user: dict = Depends(get_current_user)):
    """Require admin role for access"""
    user_id = current_user.get("user_id")
    email = current_user.get("email")
    role = current_user.get("role", "user")
    
    # Check if user is admin
    if role != "admin" and email != "aditya@ealphabits.com":
        logger.warning(f"Unauthorized admin access attempt by user: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    logger.info(f"Admin access granted to user: {user_id}")
    return current_user