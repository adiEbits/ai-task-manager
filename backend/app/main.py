from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
from app.config import settings
from app.routes import auth, tasks
from app.utils.logger import logger, log_request
from app.services.mqtt_service import mqtt_service
from app.routes import auth, tasks, ai
from app.routes import auth, tasks, ai, notifications
from app.services.scheduler import task_scheduler
from app.routes import auth, tasks, ai, notifications, admin

import time

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("=" * 50)
    logger.info("Starting AI Task Manager")
    logger.info("=" * 50)
    
    # Test Supabase connection
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/rest/v1/",
                headers={
                    "apikey": settings.SUPABASE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_KEY}"
                },
                timeout=5.0
            )
            logger.info("Supabase connection successful")
            logger.info(f"Database URL: {settings.SUPABASE_URL}")
            logger.info(f"DATABASE | CONNECT | Table: supabase | Connection established")
    except Exception as e:
        logger.error(f"Supabase connection failed: {str(e)}")
    
    # Connect MQTT
    mqtt_service.connect()
    time.sleep(1)  # Give MQTT time to connect
    
    logger.info("=" * 50)
    logger.info("Application started successfully")
    logger.info(f"Environment: development")
    logger.info(f"Docs: http://localhost:8000/docs")
    logger.info("=" * 50)
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    mqtt_service.disconnect()
    task_scheduler.stop()  

app = FastAPI(
    title="AI Task Manager API",
    description="Task management system with AI features",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url.path}")
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    log_request(
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration=duration
    )
    
    return response

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(ai.router)
app.include_router(notifications.router)
app.include_router(admin.router) 
@app.get("/")
async def root():
    return {
        "message": "AI Task Manager API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/rest/v1/",
                headers={
                    "apikey": settings.SUPABASE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_KEY}"
                },
                timeout=5.0
            )
            db_status = "healthy" if response.status_code == 200 else "unhealthy"
    except:
        db_status = "unhealthy"
    
    mqtt_status = "connected" if mqtt_service.connected else "disconnected"
    
    return {
        "status": "healthy",
        "database": db_status,
        "mqtt": mqtt_status
    }