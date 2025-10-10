"""
Admin Authentication Utilities
Helper functions for checking admin access
"""

import logging
from typing import Optional
from fastapi import HTTPException, Request
from services.admin_auth_service import admin_auth_service

logger = logging.getLogger(__name__)

def get_admin_session_token(request: Request) -> Optional[str]:
    """Extract admin session token from request headers"""
    return request.headers.get('X-Admin-Session')

def verify_admin_access(request: Request) -> bool:
    """Verify if the request has valid admin access"""
    session_token = get_admin_session_token(request)
    if not session_token:
        return False
    
    return admin_auth_service.verify_session(session_token)

def require_admin_access(request: Request):
    """Require admin access or raise HTTPException"""
    if not verify_admin_access(request):
        raise HTTPException(
            status_code=403, 
            detail="Admin access required. Please authenticate with your admin key."
        )

def get_admin_user_info(request: Request) -> dict:
    """Get admin user information from session"""
    session_token = get_admin_session_token(request)
    if not session_token or not admin_auth_service.verify_session(session_token):
        raise HTTPException(
            status_code=403, 
            detail="Admin access required"
        )
    
    # Return admin user info
    return {
        'is_admin': True,
        'session_token': session_token,
        'access_type': 'admin_key'
    }
