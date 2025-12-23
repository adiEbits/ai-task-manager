import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from app.utils.logger import logger
from typing import Dict
from datetime import datetime

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST if hasattr(settings, 'SMTP_HOST') else "smtp-mail.outlook.com"
        self.smtp_port = settings.SMTP_PORT if hasattr(settings, 'SMTP_PORT') else 587
        self.sender_email = settings.SMTP_EMAIL if hasattr(settings, 'SMTP_EMAIL') else None
        self.sender_password = settings.SMTP_PASSWORD if hasattr(settings, 'SMTP_PASSWORD') else None
    
    def send_task_reminder(self, recipient_email: str, task: Dict) -> bool:
        """Send task reminder email"""
        if not self.sender_email or not self.sender_password:
            logger.warning("Email credentials not configured")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"⏰ Task Reminder: {task['title']}"
            msg['From'] = self.sender_email
            msg['To'] = recipient_email
            
            # Email body
            due_date = datetime.fromisoformat(task['due_date'].replace('Z', '+00:00')) if task.get('due_date') else None
            due_str = due_date.strftime('%B %d, %Y at %I:%M %p') if due_date else "No due date"
            
            # In send_task_reminder method, update the HTML:

            html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white;">
                <h2>{'🚨 OVERDUE' if 'OVERDUE' in task['title'] else '⏰'} Task Reminder</h2>
                </div>
                
                <div style="padding: 20px; background: #f7fafc; border-radius: 10px; margin-top: 20px;">
                <h3 style="color: #2d3748;">{task['title'].replace('OVERDUE: ', '')}</h3>
                <p style="color: #4a5568;">{task.get('description', 'No description')}</p>
                
                <div style="margin-top: 20px;">
                    <span style="background: {'#fef2f2' if task['priority'] == 'urgent' else '#fef3c7'}; 
                                color: {'#991b1b' if task['priority'] == 'urgent' else '#92400e'}; 
                                padding: 5px 15px; border-radius: 5px; font-weight: bold;">
                    {task['priority'].upper()} PRIORITY
                    </span>
                </div>
                
                <p style="margin-top: 20px; color: #718096;">
                    <strong>Due:</strong> {due_str}
                </p>
                
                {'<p style="color: #dc2626; font-weight: bold;">⚠️ This task is overdue!</p>' if 'OVERDUE' in task['title'] else ''}
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
                <a href="http://localhost:5173/dashboard" 
                    style="background: #667eea; color: white; padding: 12px 30px; 
                            text-decoration: none; border-radius: 5px; display: inline-block;">
                    View Task
                </a>
                </div>
                
                <p style="margin-top: 30px; color: #a0aec0; font-size: 12px; text-align: center;">
                This is an automated reminder from AI Task Manager<br>
                You received this because this task is due soon
                </p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html, 'html'))
            
            # Send email
            logger.info(f"Connecting to {self.smtp_host}:{self.smtp_port}")
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                logger.info(f"Logging in as {self.sender_email}")
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)
            
            logger.info(f"✅ Sent reminder email for task: {task['title']} to {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send email: {str(e)}")
            return False

email_service = EmailService()