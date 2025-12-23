from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.services.database import db_service
from app.services.email_service import email_service
from app.utils.logger import logger
from datetime import datetime, timedelta
from typing import List, Dict
import asyncio

class TaskScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.sent_reminders = set()  # Track sent reminders to avoid duplicates
        
    async def check_task_reminders(self):
        """Check for tasks that need reminders and send emails"""
        try:
            logger.info("🔍 Checking for tasks needing reminders...")
            
            # Get all tasks with due dates
            all_tasks = await db_service.query(
                table="tasks",
                filters={},
                limit=1000
            )
            
            if not all_tasks:
                logger.info("No tasks found")
                return
            
            now = datetime.now()
            reminder_sent_count = 0
            
            for task in all_tasks:
                # Skip if no due date or already completed
                if not task.get('due_date') or task.get('status') == 'completed':
                    continue
                
                try:
                    # Parse due date
                    due_date_str = task['due_date']
                    if 'T' in due_date_str:
                        due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                    else:
                        due_date = datetime.fromisoformat(due_date_str)
                    
                    # Remove timezone info for comparison
                    if due_date.tzinfo:
                        due_date = due_date.replace(tzinfo=None)
                    
                    task_id = task['id']
                    user_id = task['auth_users_id']
                    
                    # Calculate time difference
                    time_until_due = due_date - now
                    hours_until_due = time_until_due.total_seconds() / 3600
                    
                    # Create unique reminder key
                    reminder_key_1h = f"{task_id}_1h"
                    reminder_key_due = f"{task_id}_due"
                    reminder_key_overdue = f"{task_id}_overdue"
                    
                    # Get user email from tasks table (we'll need to fetch it)
                    # For now, we'll get it from the user_id
                    user_data = await self._get_user_email(user_id)
                    if not user_data:
                        continue
                    
                    user_email = user_data.get('email')
                    if not user_email:
                        continue
                    
                    # Send reminder 1 hour before due (if not sent yet)
                    if 0.9 <= hours_until_due <= 1.1 and reminder_key_1h not in self.sent_reminders:
                        logger.info(f"📧 Sending 1-hour reminder for task: {task['title']}")
                        success = email_service.send_task_reminder(user_email, task)
                        if success:
                            self.sent_reminders.add(reminder_key_1h)
                            reminder_sent_count += 1
                    
                    # Send reminder when due (within 5 minutes)
                    elif -0.08 <= hours_until_due <= 0.08 and reminder_key_due not in self.sent_reminders:
                        logger.info(f"⏰ Sending due-now reminder for task: {task['title']}")
                        success = email_service.send_task_reminder(user_email, task)
                        if success:
                            self.sent_reminders.add(reminder_key_due)
                            reminder_sent_count += 1
                    
                    # Send overdue reminder (1 hour after due)
                    elif -1.1 <= hours_until_due <= -0.9 and reminder_key_overdue not in self.sent_reminders:
                        logger.info(f"🚨 Sending overdue reminder for task: {task['title']}")
                        # Modify task data to indicate overdue
                        overdue_task = task.copy()
                        overdue_task['title'] = f"OVERDUE: {task['title']}"
                        success = email_service.send_task_reminder(user_email, overdue_task)
                        if success:
                            self.sent_reminders.add(reminder_key_overdue)
                            reminder_sent_count += 1
                
                except Exception as e:
                    logger.error(f"Error processing task {task.get('id')}: {str(e)}")
                    continue
            
            if reminder_sent_count > 0:
                logger.info(f"✅ Sent {reminder_sent_count} email reminders")
            else:
                logger.info("✓ No reminders needed at this time")
            
            # Clean up old reminder keys (tasks completed or past)
            self._cleanup_old_reminders()
            
        except Exception as e:
            logger.error(f"❌ Reminder check failed: {str(e)}")
    
    async def _get_user_email(self, user_id: str) -> Dict:
        """Get user email from auth.users table"""
        try:
            # Query the profiles table or auth.users
            from app.config import settings
            import httpx
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.SUPABASE_URL}/rest/v1/profiles",
                    headers={
                        "apikey": settings.SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"
                    },
                    params={"id": f"eq.{user_id}"}
                )
                
                if response.status_code == 200:
                    profiles = response.json()
                    if profiles:
                        # Get email from auth.users via another query
                        auth_response = await client.get(
                            f"{settings.SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                            headers={
                                "apikey": settings.SUPABASE_SERVICE_KEY,
                                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"
                            }
                        )
                        if auth_response.status_code == 200:
                            user_data = auth_response.json()
                            return {"email": user_data.get("email")}
        except Exception as e:
            logger.error(f"Failed to get user email: {str(e)}")
        
        return {}
    
    def _cleanup_old_reminders(self):
        """Remove reminder keys older than 24 hours"""
        # In production, you'd want to implement this with timestamps
        # For now, keep it simple
        if len(self.sent_reminders) > 1000:
            self.sent_reminders.clear()
    
    def start(self):
        """Start the scheduler"""
        try:
            # Check every 5 minutes
            self.scheduler.add_job(
                self.check_task_reminders,
                IntervalTrigger(minutes=5),
                id='task_reminder_check',
                name='Check task reminders',
                replace_existing=True
            )
            
            self.scheduler.start()
            logger.info("✅ Task reminder scheduler started (checking every 5 minutes)")
            
        except Exception as e:
            logger.error(f"Failed to start scheduler: {str(e)}")
    
    def stop(self):
        """Stop the scheduler"""
        try:
            self.scheduler.shutdown()
            logger.info("Task reminder scheduler stopped")
        except Exception as e:
            logger.error(f"Failed to stop scheduler: {str(e)}")

# Global scheduler instance
task_scheduler = TaskScheduler()