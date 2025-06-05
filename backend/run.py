import uvicorn
import os

if __name__ == "__main__":
    # Get host and port from environment variables or use defaults
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "3000"))
    
    uvicorn.run("main:app", host=host, port=port, reload=True) 