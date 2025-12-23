from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.models.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.services.database import DatabaseService
from app.services.mqtt_service import mqtt_service

db_service = DatabaseService()
from app.middleware.auth import get_current_user
from app.utils.logger import logger, log_database

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=TaskListResponse)
async def get_tasks(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    category: Optional[str] = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(get_current_user)
):
    """Get all tasks for current user"""
    try:
        user_id = current_user["user_id"]
        
        filters = {"auth_users_id": user_id}
        
        if status_filter:
            filters["status"] = status_filter
        
        if priority:
            filters["priority"] = priority
        
        if category:
            filters["category"] = category
        
        total = await db_service.count(table="tasks", filters=filters)
        
        offset = (page - 1) * page_size
        tasks = await db_service.query(
            table="tasks",
            filters=filters,
            order_by="created_at.desc",
            limit=page_size,
            offset=offset
        )
        
        logger.info(f"Retrieved {len(tasks)} tasks for user {user_id}")
        
        task_responses = [TaskResponse(**task) for task in tasks]
        
        return TaskListResponse(
            tasks=task_responses,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(offset + len(tasks)) < total
        )
        
    except Exception as e:
        logger.error(f"Get tasks failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve tasks"
        )

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new task"""
    try:
        user_id = current_user["user_id"]
        
        new_task_data = {
            "auth_users_id": str(user_id),
            "title": task_data.title,
            "description": task_data.description,
            "status": task_data.status,
            "priority": task_data.priority,
        }
        
        if task_data.category:
            new_task_data["category"] = task_data.category
        
        if task_data.tags:
            new_task_data["tags"] = task_data.tags
        
        if task_data.due_date:
            new_task_data["due_date"] = task_data.due_date.isoformat()
        
        new_task = await db_service.insert(
            table="tasks",
            data=new_task_data
        )
        
        log_database("INSERT", "tasks", f"Created task: {new_task['id']}")
        
        # Publish MQTT event
        mqtt_service.publish_task_event(user_id, "created", new_task)
        
        return TaskResponse(**new_task)
        
    except Exception as e:
        logger.error(f"Create task failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )
        
    except Exception as e:
        logger.error(f"Create task failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific task"""
    try:
        user_id = current_user["user_id"]
        
        tasks = await db_service.query(
            table="tasks",
            filters={"id": task_id, "auth_users_id": user_id}
        )
        
        if not tasks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return TaskResponse(**tasks[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get task failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve task"
        )

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update task"""
    try:
        user_id = current_user["user_id"]
        
        # Check if task exists
        existing_tasks = await db_service.query(
            table="tasks",
            filters={"id": task_id, "auth_users_id": user_id}
        )
        
        if not existing_tasks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        # Get update data
        update_data = task_data.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Convert datetime if present
        if update_data.get("due_date"):
            update_data["due_date"] = update_data["due_date"].isoformat()
        
        # Perform update
        updated_tasks = await db_service.update(
            table="tasks",
            filters={"id": task_id, "auth_users_id": user_id},
            data=update_data
        )
        
        if not updated_tasks:
            logger.error(f"Update returned empty result for task: {task_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update task - empty response from database"
            )
        
        log_database("UPDATE", "tasks", f"Updated task: {task_id}")
        
        mqtt_service.publish_task_event(user_id, "updated", updated_tasks)

        return TaskResponse(**updated_tasks)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update task failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete task"""
    try:
        user_id = current_user["user_id"]
        
        existing_tasks = await db_service.query(
            table="tasks",
            filters={"id": task_id, "auth_users_id": user_id}
        )
        
        if not existing_tasks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        await db_service.delete(
            table="tasks",
            filters={"id": task_id, "auth_users_id": user_id}
        )
        
        log_database("DELETE", "tasks", f"Deleted task: {task_id}")
        
        mqtt_service.publish_task_event(user_id, "deleted", {"id": task_id})

        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete task failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete task"
        )