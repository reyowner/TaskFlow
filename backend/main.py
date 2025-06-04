from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, tasks, categories, tags
from database import engine
import models

# Drop and recreate all tables
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow API")

# Configure CORS
origins = [
    # Development URLs
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    # Production URLs
    "https://task-flow-xxm5.onrender.com", # Render Frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(categories.router)
app.include_router(tags.router)

@app.get("/")
async def root():
    return {"message": "Welcome to TaskFlow API"}
    