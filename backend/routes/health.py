"""
Health check and test routes.
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "English Marking AI API"}

@router.get("/test")
async def test():
    return {"message": "Test endpoint working"}

@router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}
