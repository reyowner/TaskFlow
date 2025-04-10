# TaskFlow - Task Management Application  

TaskFlow is a full-stack task management application that allows users to register, log in, and manage their tasks efficiently. It features a **drag-and-drop** task board with different task statuses. The project is built with **Next.js (React) for the frontend**, **FastAPI (Python) for the backend**, and **SQLite** as the database.

## Features  

✅ **User Authentication** (Register, Login, Logout)  
✅ **Task Management** (Create, View, Update, Delete)  
✅ **Drag & Drop** functionality for task organization  
✅ **Responsive Design** with a clean army green color theme  
✅ **Secure JWT-Based Authentication**  
✅ **Containerized with Docker** for easy setup and deployment

---

## Tech Stack  

### Frontend:  
- **Framework**: Next.js (React)  
- **Styling**: Tailwind CSS  
- **State Management**: React Context API  
- **Drag & Drop**: React DnD  

### Backend:  
- **Framework**: FastAPI (Python)  
- **Database**: SQLite  
- **Authentication**: OAuth2 + JWT  
- **ORM**: SQLAlchemy  

### Containerization & Deployment:  
- **Docker** (for easy setup)  
- **Docker Compose** (to manage frontend, backend, and database)

---

## Project Structure 
```bash
taskflow_project/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── public/
│   │   └── task.png
│   └── src/
│       ├── app/
│       │   ├── layout.js
│       │   ├── page.js
│       │   ├── register/
│       │   │   └── page.js
│       │   ├── login/
│       │   │   └── page.js
│       │   └── dashboard/
│       │       └── page.js
│       ├── components/
│       │   ├── ClientLayout.js
│       │   ├── Navbar.js
│       ├── contexts/
│       │   └── AuthContext.js
│       ├── styles/
│       │   └── globals.css
│       └── utils/
│           └── api.js
└── backend/
    ├── Dockerfile
    ├── requirements.txt
    ├── main.py
    ├── models.py
    ├── schemas.py
    ├── database.py
    ├── auth.py
    └── routers/
        ├── users.py
        └── tasks.py
```

---

## Setup & Installation
Make sure Python is already installed in your computer. If not, download it here: [https://www.python.org/downloads/](https://www.python.org/downloads/) and make sure to check the "Add Python into environment variables" during installation.
Make sure Rust is also installed in your computer. If not, download it here: [https://rustup.rs/](https://rustup.rs/).
Then, open your Command Prompt and start the steps below. 

# 1. Clone the repository
```bash
git clone https://github.com/reyowner/TaskFlow.git
cd TaskFlow
```

# 2. Frontend Setup (Next.js)
Install dependencies:
```bash
cd frontend
npm install
```
Run the frontend server:
```bash
npm run dev
```

# The frontend should now be running at [http://localhost:3000](http://localhost:3000)

# 3. Backend Setup (FastAPI)
Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```
Run the backend server:
```bash
uvicorn main:app --reload
```

# Now, open [http://localhost:8000](http://localhost:8000) in your browser.
- ✅ If successful, you should see: **{"message":"Welcome to TaskFlow API"}**

# 4. View Registered Users
To see a list of all registered users, visit:
# 📌 http://localhost:8000/api/users/all
🔍 Example Response:
```bash
[
  {
    "id": 1,
    "username": "reyowner",
    "email": "domasigreoner@gmail.com"
  }
]
```

# 5. Explore API Endpoints
FastAPI provides interactive API documentation:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

# Now, the web application is now fully functional with the frontend and backend running locally.

---

## Using Docker for Easy Deployment
You can run both frontend and backend using Docker Compose.

# 1. Clone the repository
```bash
git clone https://github.com/reyowner/TaskFlow.git
cd TaskFlow
```

# 2. Build and start the containers:
```bash
docker-compose up --build
```

# 3. Stop the containers:
```bash
docker-compose down
```

---
