import uvicorn
import os

if __name__ == "__main__":
    # Get host and port from environment variables or use defaults
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    
    uvicorn.run("main:app", host=host, port=port, reload=True) 