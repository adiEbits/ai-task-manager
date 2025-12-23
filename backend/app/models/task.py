from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    status: str = Field(default="todo", pattern="^(todo|in_progress|completed|archived)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(todo|in_progress|completed|archived)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|urgent)$")
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: UUID
    auth_users_id: UUID 
    completed_at: Optional[datetime] = None
    ai_generated: bool = False
    ai_metadata: dict = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    page: int
    page_size: int
    has_more: bool