from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import random

import models
import schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/tags",
    tags=["tags"]
)

def generate_random_color():
    colors = [
        "#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0",
        "#00BCD4", "#FFEB3B", "#795548", "#607D8B", "#E91E63"
    ]
    return random.choice(colors)

@router.post("/", response_model=schemas.Tag)
def create_tag(
    tag: schemas.TagCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Ensure tag name starts with #
    tag_name = tag.name if tag.name.startswith('#') else f"#{tag.name}"
    
    db_tag = models.Tag(
        name=tag_name,
        color=tag.color or generate_random_color(),
        owner_id=current_user.id
    )
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.get("/", response_model=List[schemas.Tag])
def get_tags(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tags = db.query(models.Tag).filter(
        models.Tag.owner_id == current_user.id
    ).all()
    return tags

@router.get("/{tag_id}", response_model=schemas.Tag)
def get_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tag = db.query(models.Tag).filter(
        models.Tag.id == tag_id,
        models.Tag.owner_id == current_user.id
    ).first()
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.put("/{tag_id}", response_model=schemas.Tag)
def update_tag(
    tag_id: int,
    tag: schemas.TagCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_tag = db.query(models.Tag).filter(
        models.Tag.id == tag_id,
        models.Tag.owner_id == current_user.id
    ).first()
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Ensure tag name starts with #
    tag_name = tag.name if tag.name.startswith('#') else f"#{tag.name}"
    
    db_tag.name = tag_name
    db_tag.color = tag.color or db_tag.color
    
    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.delete("/{tag_id}")
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_tag = db.query(models.Tag).filter(
        models.Tag.id == tag_id,
        models.Tag.owner_id == current_user.id
    ).first()
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    db.delete(db_tag)
    db.commit()
    return {"message": "Tag deleted successfully"} 