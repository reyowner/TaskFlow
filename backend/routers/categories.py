from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import random

import models
import schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/categories",
    tags=["categories"]
)

def generate_random_color():
    colors = [
        "#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0",
        "#00BCD4", "#FFEB3B", "#795548", "#607D8B", "#E91E63"
    ]
    return random.choice(colors)

@router.post("/", response_model=schemas.Category)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_category = models.Category(
        name=category.name,
        color=category.color or generate_random_color(),
        owner_id=current_user.id
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/", response_model=List[schemas.Category])
def get_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    categories = db.query(models.Category).filter(
        models.Category.owner_id == current_user.id
    ).all()
    
    # Add task count and completed tasks count to each category
    for category in categories:
        tasks = db.query(models.Task).filter(
            models.Task.category_id == category.id,
            models.Task.owner_id == current_user.id
        ).all()
        
        category.task_count = len(tasks)
        category.completed_tasks = len([task for task in tasks if task.status == "Completed"])
        category.in_progress_tasks = len([task for task in tasks if task.status == "In Progress"])
    
    return categories

@router.get("/{category_id}", response_model=schemas.Category)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.owner_id == current_user.id
    ).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.owner_id == current_user.id
    ).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db_category.name = category.name
    db_category.color = category.color or db_category.color
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        db_category = db.query(models.Category).filter(
            models.Category.id == category_id,
            models.Category.owner_id == current_user.id
        ).first()
        
        if db_category is None:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # First, update all tasks in this category to have no category
        tasks = db.query(models.Task).filter(
            models.Task.category_id == category_id,
            models.Task.owner_id == current_user.id
        ).all()
        
        for task in tasks:
            task.category_id = None
        
        # Then delete the category
        db.delete(db_category)
        db.commit()
        
        return {"message": "Category deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while deleting the category: {str(e)}"
        ) 