🚀 AI Task Manager
AI-Powered Real-Time Task Management System

A full-stack AI-enhanced task manager built with FastAPI, React, Supabase, Redis, MQTT, and Docker — designed with real-world production architecture.

⭐ **Why This Project?**

    This project showcases how a serious full-stack + AI system is built:
    Covers backend, frontend, AI, realtime & DevOps
    Uses modern scalable architecture
    Demonstrates real-time communication
    Implements AI-driven features
    Follows enterprise-grade folder structuring

🧠 **Core Features**

  ✅ Task Management
  
    Full CRUD operations
    Automatic task status updates
    User-based task permissions
    Clean REST API

  🤖 AI Features
  
    Smart task auto-categorization
    AI-based task suggestions
    Semantic smart search
    Assistant-generated recommendations

⚡ Real-Time Capabilities

    MQTT (Mosquitto broker)
    Supabase Realtime listeners
    WebSockets for live dashboards
    Instant cross-device updates

🔐 Authentication & Security
    
    JWT Authentication
    Auth middleware
    Rate limiting
    Input validation & sanitization

🛠 DevOps & Tooling
    
    Docker + Docker Compose
    GitHub Actions (CI/CD)
    Environment management
    Modular service architecture

    
🧩 Tech Stack
     **Backend**
      
    FastAPI (Python 3.12)
    Supabase (PostgreSQL + Realtime)
    Redis (Caching)
    Mosquitto MQTT
    JWT Auth
    WebSockets
    AI (OpenAI / Claude)


   **Frontend**
   
    React 18 + TypeScript
    Vite
    TanStack Query
    Zustand
    MQTT / Socket.IO
    Tailwind CSS
    ShadCN/UI Components

  ** DevOps**
   
    Docker & Docker Compose
    GitHub Actions CI/CD
    Environment variable management

**⚙️ Installation**

      1️⃣ Clone Repo
      git clone https://github.com/<your-username>/ai-task-manager.git
      cd ai-task-manager

      🐍 2️⃣ Backend Setup
      cd backend
      pip install -r requirements.txt
      uvicorn app.main:app --reload

      Backend:
      ➡ http://localhost:8000
      
      ⚛️ 3️⃣ Frontend Setup
      cd frontend
      npm install
      npm run dev

      Frontend:
      ➡ http://localhost:5173
      
      🐳 4️⃣ Run Everything with Docker
      docker compose up --build
  
      Starts:
        Backend
        Frontend
        Redis
        MQTT broker
        (Optional) Supabase local containers
        
**🔐 Environment Variables**

    Backend example:
    SUPABASE_URL=
    SUPABASE_KEY=
    REDIS_URL=
    MQTT_BROKER=
    JWT_SECRET=
    OPENAI_API_KEY=

**Frontend example:**

    VITE_API_URL=
    VITE_SUPABASE_URL=
    VITE_SUPABASE_KEY=

**🧠 AI Integration**

    AI engine file:
    backend/app/services/ai_service.py


**Supports:**

    Task suggestions
    Priority predictions
    Auto-tagging
    Semantic search
    Models supported:
    OpenAI
    Anthropic Claude
    Any OpenAI-compatible LLM
