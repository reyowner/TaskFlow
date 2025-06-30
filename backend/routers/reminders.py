from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models import Reminder as ReminderModel
from schemas import Reminder, ReminderCreate, ReminderUpdate
from database import get_db
from routers.auth import get_current_user
from models import User

router = APIRouter(
    prefix="/reminders",
    tags=["reminders"]
)

@router.get("/", response_model=List[Reminder])
def get_reminders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ReminderModel).filter(ReminderModel.user_id == current_user.id).all()

@router.post("/", response_model=Reminder, status_code=status.HTTP_201_CREATED)
def create_reminder(reminder: ReminderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_reminder = ReminderModel(content=reminder.content, user_id=current_user.id)
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

@router.put("/{reminder_id}", response_model=Reminder)
def update_reminder(reminder_id: int, reminder: ReminderUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_reminder = db.query(ReminderModel).filter(ReminderModel.id == reminder_id, ReminderModel.user_id == current_user.id).first()
    if not db_reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db_reminder.content = reminder.content
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(reminder_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_reminder = db.query(ReminderModel).filter(ReminderModel.id == reminder_id, ReminderModel.user_id == current_user.id).first()
    if not db_reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db.delete(db_reminder)
    db.commit()
    return None 