"""
Admin Authentication API Routes
Handles secure admin authentication with secret keys
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from services.admin_auth_service import admin_auth_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin-auth"])

# Pydantic models
class AdminAuthRequest(BaseModel):
    admin_key: str = Field(..., description="The admin secret key")

class AdminAuthResponse(BaseModel):
    success: bool
    message: str
    session_token: Optional[str] = None
    expires_at: Optional[str] = None

class AdminStatusResponse(BaseModel):
    authenticated: bool
    expires_at: Optional[str] = None

@router.post("/authenticate", response_model=AdminAuthResponse)
async def authenticate_admin(request: AdminAuthRequest):
    """Authenticate admin with secret key"""
    try:
        result = admin_auth_service.authenticate_admin(request.admin_key)
        
        if result['success']:
            return AdminAuthResponse(
                success=True,
                message=result['message'],
                session_token=result['session_token'],
                expires_at=result['expires_at']
            )
        else:
            return AdminAuthResponse(
                success=False,
                message=result['message']
            )
            
    except Exception as e:
        logger.error(f"Error in admin authentication: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication error")

@router.get("/status", response_model=AdminStatusResponse)
async def get_admin_status(request: Request):
    """Check if current session has admin access"""
    try:
        session_token = request.headers.get('X-Admin-Session')
        
        if admin_auth_service.verify_session(session_token):
            # Get session details
            session = admin_auth_service.admin_sessions.get(session_token, {})
            return AdminStatusResponse(
                authenticated=True,
                expires_at=session.get('expires_at', '').isoformat() if session.get('expires_at') else None
            )
        else:
            return AdminStatusResponse(authenticated=False)
            
    except Exception as e:
        logger.error(f"Error checking admin status: {str(e)}")
        return AdminStatusResponse(authenticated=False)

@router.post("/logout")
async def logout_admin(request: Request):
    """Logout admin and revoke session"""
    try:
        session_token = request.headers.get('X-Admin-Session')
        
        if session_token:
            admin_auth_service.revoke_session(session_token)
            return {"success": True, "message": "Logged out successfully"}
        else:
            return {"success": False, "message": "No session to logout"}
            
    except Exception as e:
        logger.error(f"Error in admin logout: {str(e)}")
        raise HTTPException(status_code=500, detail="Logout error")

@router.get("/key-info")
async def get_key_info():
    """Get admin key information (for setup)"""
    try:
        # Only return key info if no sessions exist (initial setup)
        if not admin_auth_service.admin_sessions:
            return {
                "admin_key": admin_auth_service.get_admin_key(),
                "message": "Save this key securely! Set ADMIN_SECRET_KEY environment variable."
            }
        else:
            return {
                "message": "Admin key is already configured and in use"
            }
            
    except Exception as e:
        logger.error(f"Error getting key info: {str(e)}")
        raise HTTPException(status_code=500, detail="Key info error")
