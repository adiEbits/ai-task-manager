from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from app.services.email_service import email_service
from app.services.database import db_service
from app.middleware.auth import get_current_user
from app.utils.logger import logger

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class SendReminderRequest(BaseModel):
    task_id: str

@router.post("/send-reminder")
async def send_task_reminder(
    request: SendReminderRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send email reminder for a specific task"""
    try:
        user_id = current_user["user_id"]
        user_email = current_user["email"]
        
        # Get task
        tasks = await db_service.query(
            table="tasks",
            filters={"id": request.task_id, "auth_users_id": user_id}
        )
        
        if not tasks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        task = tasks[0]
        
        # Send email
        success = email_service.send_task_reminder(user_email, task)
        
        if success:
            return {"message": "Reminder sent successfully", "email": user_email}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send reminder"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Send reminder failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/test-email")
async def test_email(current_user: dict = Depends(get_current_user)):
    """Test email configuration"""
    try:
        user_email = current_user["email"]
        
        test_task = {
            "title": "Test Email Notification",
            "description": "This is a test email from AI Task Manager",
            "priority": "medium",
            "due_date": "2025-12-22T16:06:00"
        }
        
        success = email_service.send_task_reminder(user_email, test_task)
        
        if success:
            return {"message": f"Test email sent to {user_email}"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send test email - check SMTP credentials"
            )
        
    except Exception as e:
        logger.error(f"Test email failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )