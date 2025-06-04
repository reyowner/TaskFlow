from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

import models
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/tasks",
    tags=["tasks"]
)

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "Pending"

class TaskCreate(TaskBase):
    due_date: Optional[str] = None
    category_id: Optional[int] = None
    priority: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    category_id: Optional[int] = None
    priority: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    owner_id: int
    priority: str
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    category_id: Optional[int] = None

    class Config:
        from_attributes = True

@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Validate category if provided
        if task.category_id is not None:
            category = db.query(models.Category).filter(
                models.Category.id == task.category_id,
                models.Category.owner_id == current_user.id
            ).first()
            if not category:
                raise HTTPException(
                    status_code=404,
                    detail="Category not found or you don't have access to it"
                )

        db_task = models.Task(
            title=task.title,
            description=task.description,
            status=task.status,
            due_date=task.due_date,
            priority=task.priority,
            owner_id=current_user.id,
            category_id=task.category_id
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the task: {str(e)}"
        )

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    category_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    try:
        query = db.query(models.Task).filter(models.Task.owner_id == current_user.id)
        
        if category_id is not None:
            query = query.filter(models.Task.category_id == category_id)
        
        tasks = query.offset(skip).limit(limit).all()
        return tasks
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching tasks: {str(e)}"
        )

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in task.dict(exclude_unset=True).items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in status_update.dict(exclude_unset=True).items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)
    return db_task

@router.post("/{task_id}/tags/{tag_id}")
def add_tag_to_task(
    task_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify task ownership
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Verify tag ownership
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id, models.Tag.owner_id == current_user.id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Add tag to task
    task.tags.append(tag)
    db.commit()
    return {"message": "Tag added to task successfully"}

@router.delete("/{task_id}/tags/{tag_id}")
def remove_tag_from_task(
    task_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify task ownership
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Verify tag ownership
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id, models.Tag.owner_id == current_user.id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Remove tag from task
    task.tags.remove(tag)
    db.commit()
    return {"message": "Tag removed from task successfully"}