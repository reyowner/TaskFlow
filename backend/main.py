from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, tasks, categories, tags, insights, users, reminders
from database import engine
import models

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow API")

# Configure CORS
origins = [
    # Development URLs
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    # Mobile device URL
    "http://192.168.100.13:3000",
    # Production URLs
    "https://task-flow-xxm5.onrender.com", # Render Frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(insights.router)
app.include_router(users.router)
app.include_router(reminders.router)

@app.get("/")
async def root():
    return {"message": "Welcome to TaskFlow API"}
    