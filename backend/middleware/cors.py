"""
CORS middleware configuration.
"""
from fastapi import Request
from starlette.middleware.cors import CORSMiddleware
from config.settings import CORS_ORIGINS

def setup_cors_middleware(app):
    """Setup CORS middleware for the FastAPI app."""
    
    # CORS middleware
    @app.middleware("http")
    async def cors_middleware(request: Request, call_next):
        response = await call_next(request)
        return response

    # Add CORS middleware for frontend - COMPREHENSIVE VERSION
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],  # Allow all methods
        allow_headers=["*"],  # Allow all headers
        expose_headers=["*"],
        max_age=3600,
    )
