from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, tasks
from database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://task-flow-xxm5.onrender.com",  # Deployed frontend URL
        "http://localhost:3000",  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])

@app.get("/")
async def root():
    return {"message": "Welcome to TaskFlow API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    