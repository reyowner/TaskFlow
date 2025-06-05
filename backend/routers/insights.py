from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from database import get_db
from models import Task, Activity, User
from schemas import InsightsResponse, HighPriorityTask, Activity as ActivitySchema, WeeklyInsights
from routers.auth import get_current_user

router = APIRouter(
    prefix="/insights",
    tags=["insights"]
)

@router.get("/", response_model=InsightsResponse)
async def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get high priority tasks
    high_priority_tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.priority == "High",
        Task.status != "Completed"
    ).all()

    # Calculate days remaining for each task
    high_priority_tasks_with_days = []
    for task in high_priority_tasks:
        days_remaining = None
        if task.due_date:
            days_remaining = (task.due_date - datetime.now()).days
        high_priority_tasks_with_days.append(
            HighPriorityTask(
                **task.__dict__,
                days_remaining=days_remaining
            )
        )

    # Get recent activities
    recent_activities = db.query(Activity).filter(
        Activity.user_id == current_user.id
    ).order_by(Activity.timestamp.desc()).limit(10).all()

    # Calculate weekly insights
    now = datetime.now()
    week_start = now - timedelta(days=now.weekday())
    last_week_start = week_start - timedelta(days=7)

    # This week's stats
    tasks_created_this_week = db.query(func.count(Task.id)).filter(
        Task.owner_id == current_user.id,
        Task.created_at >= week_start
    ).scalar()

    tasks_completed_this_week = db.query(func.count(Task.id)).filter(
        Task.owner_id == current_user.id,
        Task.status == "Completed",
        Task.updated_at >= week_start
    ).scalar()

    # Last week's stats for comparison
    tasks_completed_last_week = db.query(func.count(Task.id)).filter(
        Task.owner_id == current_user.id,
        Task.status == "Completed",
        Task.updated_at >= last_week_start,
        Task.updated_at < week_start
    ).scalar()

    # Calculate productivity trend
    productivity_trend = 0
    if tasks_completed_last_week > 0:
        productivity_trend = ((tasks_completed_this_week - tasks_completed_last_week) / tasks_completed_last_week) * 100

    weekly_insights = WeeklyInsights(
        tasks_created_this_week=tasks_created_this_week,
        tasks_completed_this_week=tasks_completed_this_week,
        productivity_trend=productivity_trend,
        high_priority_tasks=len(high_priority_tasks)
    )

    return InsightsResponse(
        high_priority_tasks=high_priority_tasks_with_days,
        recent_activities=recent_activities,
        weekly_insights=weekly_insights
    ) 