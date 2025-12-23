from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from app.services.database import db_service
from app.middleware.admin import require_admin
from app.utils.logger import logger
from datetime import datetime
import httpx
from app.config import settings

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# ==================== MODELS ====================

class UserUpdateAdmin(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreateAdmin(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "user"

class SystemSettings(BaseModel):
    maintenance_mode: bool = False
    allow_registration: bool = True
    max_tasks_per_user: int = 1000
    ai_features_enabled: bool = True

# ==================== DASHBOARD STATS ====================

@router.get("/dashboard/stats")
async def get_admin_stats(admin: dict = Depends(require_admin)):
    """Get overall platform statistics"""
    try:
        # Get all tasks
        all_tasks = await db_service.query(
            table="tasks",
            filters={},
            limit=10000
        )
        
        # Get all users (profiles)
        all_users = await db_service.query(
            table="profiles",
            filters={},
            limit=10000
        )
        
        # Calculate stats
        total_users = len(all_users)
        total_tasks = len(all_tasks)
        completed_tasks = len([t for t in all_tasks if t.get('status') == 'completed'])
        
        # Mock data for now (you can enhance this)
        stats = {
            "total_users": total_users,
            "total_tasks": total_tasks,
            "active_users_today": max(1, total_users // 3),
            "tasks_completed_today": max(1, completed_tasks // 10),
            "ai_queries_today": total_tasks * 2,
            "system_health": "excellent"
        }
        
        logger.info(f"Admin {admin['user_id']} retrieved dashboard stats")
        return stats
        
    except Exception as e:
        logger.error(f"Admin stats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ==================== USER MANAGEMENT (CRUD) ====================

@router.get("/users")
async def get_all_users(admin: dict = Depends(require_admin)):
    """Get all users with their task counts"""
    try:
        # Get all profiles
        users = await db_service.query(
            table="profiles",
            filters={},
            limit=1000
        )
        
        # Get task counts for each user
        all_tasks = await db_service.query(
            table="tasks",
            filters={},
            limit=10000
        )
        
        # Count tasks per user
        task_counts = {}
        for task in all_tasks:
            user_id = task.get('auth_users_id')
            task_counts[user_id] = task_counts.get(user_id, 0) + 1
        
        # Enhance user data
        for user in users:
            user['task_count'] = task_counts.get(user['id'], 0)
        
        logger.info(f"Admin {admin['user_id']} retrieved {len(users)} users")
        return users
        
    except Exception as e:
        logger.error(f"Get all users error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )

@router.get("/users/{user_id}")
async def get_user_detail(user_id: str, admin: dict = Depends(require_admin)):
    """Get detailed user information"""
    try:
        # Get user profile
        users = await db_service.query(
            table="profiles",
            filters={"id": user_id}
        )
        
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = users[0]
        
        # Get user's tasks
        tasks = await db_service.query(
            table="tasks",
            filters={"auth_users_id": user_id}
        )
        
        user['tasks'] = tasks
        user['task_count'] = len(tasks)
        user['completed_tasks'] = len([t for t in tasks if t.get('status') == 'completed'])
        
        logger.info(f"Admin {admin['user_id']} viewed user {user_id} details")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user detail error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user details"
        )

@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_data: UserUpdateAdmin,
    admin: dict = Depends(require_admin)
):
    """Update user profile (admin only)"""
    try:
        # Build update data
        update_data = {}
        if user_data.full_name is not None:
            update_data['full_name'] = user_data.full_name
        if user_data.role is not None:
            update_data['role'] = user_data.role
        if user_data.avatar_url is not None:
            update_data['avatar_url'] = user_data.avatar_url
        
        # Update profile
        updated = await db_service.update(
            table="profiles",
            filters={"id": user_id},
            data=update_data
        )
        
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"Admin {admin['user_id']} updated user {user_id}")
        return {"message": "User updated successfully", "user": updated[0]}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    """Delete user and all their data (admin only)"""
    try:
        # Prevent self-deletion
        if user_id == admin['user_id']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        # Delete user's tasks first
        await db_service.delete(
            table="tasks",
            filters={"auth_users_id": user_id}
        )
        
        # Delete user profile
        deleted = await db_service.delete(
            table="profiles",
            filters={"id": user_id}
        )
        
        # Delete from Supabase Auth
        try:
            async with httpx.AsyncClient() as client:
                await client.delete(
                    f"{settings.SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                    headers={
                        "apikey": settings.SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"
                    }
                )
        except Exception as e:
            logger.warning(f"Failed to delete user from auth: {str(e)}")
        
        logger.info(f"Admin {admin['user_id']} deleted user {user_id}")
        return {"message": "User deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )

@router.post("/users")
async def create_user(
    user_data: UserCreateAdmin,
    admin: dict = Depends(require_admin)
):
    """Create new user (admin only)"""
    try:
        # Create user in Supabase Auth
        async with httpx.AsyncClient() as client:
            auth_response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/admin/users",
                headers={
                    "apikey": settings.SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "email": user_data.email,
                    "password": user_data.password,
                    "email_confirm": True,
                    "user_metadata": {
                        "full_name": user_data.full_name
                    }
                }
            )
            
            if auth_response.status_code != 200:
                error = auth_response.json()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error.get("msg", "Failed to create user")
                )
            
            user = auth_response.json()
            
            # Update role in profile
            await db_service.update(
                table="profiles",
                filters={"id": user["id"]},
                data={"role": user_data.role}
            )
        
        logger.info(f"Admin {admin['user_id']} created user {user['id']}")
        return {"message": "User created successfully", "user": user}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

# ==================== ACTIVITY LOGS ====================

@router.get("/logs")
async def get_system_logs(
    limit: int = 100,
    admin: dict = Depends(require_admin)
):
    """Get system activity logs"""
    try:
        # Mock logs (in production, read from log files or database)
        logs = [
            {
                "id": "1",
                "timestamp": datetime.now().isoformat(),
                "level": "info",
                "message": "User login successful",
                "user_email": "user@example.com"
            },
            {
                "id": "2",
                "timestamp": datetime.now().isoformat(),
                "level": "warning",
                "message": "High API usage detected",
            },
            {
                "id": "3",
                "timestamp": datetime.now().isoformat(),
                "level": "error",
                "message": "Email notification failed",
            }
        ]
        
        logger.info(f"Admin {admin['user_id']} viewed system logs")
        return logs[:limit]
        
    except Exception as e:
        logger.error(f"Get logs error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve logs"
        )

# ==================== SYSTEM SETTINGS ====================

@router.get("/settings")
async def get_system_settings(admin: dict = Depends(require_admin)):
    """Get system settings"""
    try:
        # Mock settings (in production, store in database)
        settings_data = {
            "maintenance_mode": False,
            "allow_registration": True,
            "max_tasks_per_user": 1000,
            "ai_features_enabled": True
        }
        
        logger.info(f"Admin {admin['user_id']} viewed system settings")
        return settings_data
        
    except Exception as e:
        logger.error(f"Get settings error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve settings"
        )

@router.put("/settings")
async def update_system_settings(
    settings_data: SystemSettings,
    admin: dict = Depends(require_admin)
):
    """Update system settings"""
    try:
        # In production, save to database
        logger.info(f"Admin {admin['user_id']} updated system settings")
        return {"message": "Settings updated successfully", "settings": settings_data}
        
    except Exception as e:
        logger.error(f"Update settings error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update settings"
        )

# ==================== BULK OPERATIONS ====================

@router.post("/users/bulk-update-role")
async def bulk_update_user_roles(
    user_ids: List[str],
    role: str,
    admin: dict = Depends(require_admin)
):
    """Bulk update user roles"""
    try:
        updated_count = 0
        for user_id in user_ids:
            try:
                await db_service.update(
                    table="profiles",
                    filters={"id": user_id},
                    data={"role": role}
                )
                updated_count += 1
            except Exception as e:
                logger.warning(f"Failed to update user {user_id}: {str(e)}")
        
        logger.info(f"Admin {admin['user_id']} bulk updated {updated_count} users to role {role}")
        return {"message": f"Updated {updated_count} users successfully"}
        
    except Exception as e:
        logger.error(f"Bulk update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bulk update users"
        )

@router.delete("/users/bulk-delete")
async def bulk_delete_users(
    user_ids: List[str],
    admin: dict = Depends(require_admin)
):
    """Bulk delete users"""
    try:
        deleted_count = 0
        for user_id in user_ids:
            if user_id == admin['user_id']:
                continue  # Skip self
            
            try:
                # Delete tasks
                await db_service.delete(
                    table="tasks",
                    filters={"auth_users_id": user_id}
                )
                # Delete profile
                await db_service.delete(
                    table="profiles",
                    filters={"id": user_id}
                )
                deleted_count += 1
            except Exception as e:
                logger.warning(f"Failed to delete user {user_id}: {str(e)}")
        
        logger.info(f"Admin {admin['user_id']} bulk deleted {deleted_count} users")
        return {"message": f"Deleted {deleted_count} users successfully"}
        
    except Exception as e:
        logger.error(f"Bulk delete error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bulk delete users"
        )