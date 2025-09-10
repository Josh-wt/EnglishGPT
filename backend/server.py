"""
Main FastAPI application - refactored and simplified.
"""
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging

# Import configuration
from config.logging_config import configure_logging
from config.settings import (
    get_supabase_client, 
    get_user_management_service, 
    get_auth_recovery_middleware
)

# Import middleware
from middleware.cors import setup_cors_middleware

# Import routes
from routes.health import router as health_router
from routes.users import router as users_router
from routes.evaluations import router as evaluations_router
from routes.analytics import router as analytics_router
from routes.files import router as files_router
from routes.payments import router as payments_router, webhook_router as payments_webhook_router

# Configure logging
logger = configure_logging()

# Initialize services
supabase_client = get_supabase_client()
user_management_service = get_user_management_service(supabase_client)
auth_recovery_middleware = get_auth_recovery_middleware(user_management_service)

# Create the main app
app = FastAPI(title="Universal Service API", version="1.0.0")

# Setup middleware
setup_cors_middleware(app)

# Add auth recovery middleware if available
if auth_recovery_middleware:
    app.add_middleware(type(auth_recovery_middleware), user_management_service=user_management_service)

# Create API router
api_router = APIRouter(prefix="/api")

# Include route modules
api_router.include_router(health_router)
api_router.include_router(users_router)
api_router.include_router(evaluations_router)
api_router.include_router(analytics_router)
api_router.include_router(files_router)
api_router.include_router(payments_router)
api_router.include_router(payments_webhook_router)

# Include the API router
app.include_router(api_router)

# Serve frontend build (SPA) with client-side routing fallback
frontend_build_path = Path(__file__).parent / ".." / "frontend" / "build"
if frontend_build_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_build_path), html=True), name="frontend")

# Shutdown handler
@app.on_event("shutdown")
async def shutdown_db_client():
    """Clean up resources on shutdown."""
    logger.info("Shutting down application...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
