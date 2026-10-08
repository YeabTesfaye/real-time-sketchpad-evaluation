from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, websocket
from app.core.config import settings

app = FastAPI(
    title="Real-time Sketchpad API",
    description="Backend for real-time collaborative sketchpad application",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # Frontend URL from environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(websocket.router, prefix="/api/v1/ws", tags=["websocket"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Real-time Sketchpad API",
        "docs": "/docs",
        "health": "/health"
    }