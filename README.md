# TaskFlow - Task Management Application

A modern and efficient task management application built with Next.js and FastAPI. Organize your tasks with drag-and-drop functionality, track progress, manage categories, and gain insights into your productivity.

## Features

- 🔐 **User Authentication**
  - Login/Register with Remember Me
  - Secure JWT authentication
  - PWA support

- 📋 **Task Management**
  - Create, edit, and delete tasks
  - Drag-and-drop task organization
  - Task categories and progress tracking
  - Visual progress indicators
  - Priority levels and due dates
  - Task filtering and sorting

- 📊 **Analytics & Insights**
  - Task completion statistics
  - Productivity trends
  - Category-wise progress
  - Weekly reports

- 🎨 **User Experience**
  - Clean, responsive design
  - Loading states and error handling
  - Password visibility toggle
  - Mobile-first approach
  - Smooth animations and transitions

## Tech Stack

- **Frontend**: 
  - Next.js 14
  - Tailwind CSS
  - React DnD
  - TypeScript
  - PWA support

- **Backend**: 
  - FastAPI
  - SQLite
  - SQLAlchemy
  - Pydantic

- **Authentication**: 
  - JWT
  - OAuth2

- **Containerization**: 
  - Docker
  - Docker Compose

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker (optional)

### Local Development

1. **Clone and Setup**
```bash
git clone https://github.com/reyowner/TaskFlow.git
cd TaskFlow
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
Visit: http://localhost:3000

3. **Backend Setup**
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Unix/MacOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
API available at: http://localhost:8000

### Using Docker

```bash
# Start the application
docker-compose up --build

# Stop the application
docker-compose down
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure
```
taskflow_project/
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/            # Pages and routes
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   ├── styles/         # Global styles
│   │   └── config.ts       # App configuration
│   ├── public/             # Static assets
│   └── scripts/            # Build scripts
└── backend/                # FastAPI backend
    ├── routers/            # API endpoints
    ├── models.py           # Database models
    ├── schemas.py          # Pydantic schemas
    └── database.py         # Database configuration