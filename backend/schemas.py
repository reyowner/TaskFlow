from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CategoryBase(BaseModel):
    name: str
    color: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    owner_id: int
    task_count: int = 0
    completed_tasks: int = 0
    in_progress_tasks: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class TagBase(BaseModel):
    name: str
    color: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str
    due_date: Optional[str] = None
    category_id: Optional[int] = None

class TaskCreate(TaskBase):
    due_date: Optional[str] = None
    category_id: Optional[int] = None
    priority: Optional[str] = "Medium"

class Task(TaskBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[Category] = None
    tags: List[Tag] = []

    class Config:
        from_attributes = True

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    category_id: Optional[int] = None
    priority: Optional[str] = None

class TaskStatusUpdate(BaseModel):
    status: str

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    user_id: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ActivityBase(BaseModel):
    type: str  # "task_completion", "task_creation", "category_addition"
    description: str
    timestamp: datetime

class Activity(ActivityBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class WeeklyInsights(BaseModel):
    tasks_created_this_week: int
    tasks_completed_this_week: int
    productivity_trend: float  # percentage change from last week
    high_priority_tasks: int

class HighPriorityTask(Task):
    days_remaining: Optional[int] = None

    class Config:
        from_attributes = True

class InsightsResponse(BaseModel):
    high_priority_tasks: List[HighPriorityTask]
    recent_activities: List[Activity]
    weekly_insights: WeeklyInsights