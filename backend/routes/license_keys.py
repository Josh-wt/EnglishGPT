"""
License Key Management API Routes
Handles license key validation, activation, and management
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
import uuid
import json

from config.settings import get_supabase_client, is_admin_email
from utils.admin_auth import require_admin_access, get_admin_user_info

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/license", tags=["license-keys"])

# Pydantic models for request/response
class LicenseKeyValidationRequest(BaseModel):
    license_key: str = Field(..., description="The license key to validate")
    user_id: Optional[str] = Field(None, description="User ID for validation context")

class LicenseKeyActivationRequest(BaseModel):
    license_key: str = Field(..., description="The license key to activate")
    user_id: str = Field(..., description="User ID to activate the license for")
    device_info: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Device information")
    ip_address: Optional[str] = Field(None, description="IP address of the user")
    user_agent: Optional[str] = Field(None, description="User agent string")

class LicenseKeyCreateRequest(BaseModel):
    license_type: str = Field(..., description="Type of license (trial, basic, premium, enterprise, lifetime)")
    max_users: int = Field(default=1, description="Maximum number of users")
    max_evaluations: Optional[int] = Field(None, description="Maximum evaluations (None for unlimited)")
    expires_at: Optional[datetime] = Field(None, description="Expiration date (None for never expires)")
    max_uses: int = Field(default=1, description="Maximum number of times this key can be used")
    description: Optional[str] = Field(None, description="Description of the license")
    notes: Optional[str] = Field(None, description="Additional notes")
    source: str = Field(default="manual", description="Source of the license (manual, payment, promo, admin)")

class LicenseKeyResponse(BaseModel):
    id: str
    license_key: str
    license_type: str
    status: str
    max_users: int
    max_evaluations: Optional[int]
    expires_at: Optional[datetime]
    times_used: int
    max_uses: int
    assigned_to: Optional[str]
    description: Optional[str]
    notes: Optional[str]
    source: str
    created_at: datetime
    updated_at: datetime
    last_used_at: Optional[datetime]

class LicenseValidationResponse(BaseModel):
    valid: bool
    error: Optional[str] = None
    code: Optional[str] = None
    license_key: Optional[str] = None
    license_type: Optional[str] = None
    max_users: Optional[int] = None
    max_evaluations: Optional[int] = None
    expires_at: Optional[datetime] = None
    times_used: Optional[int] = None
    max_uses: Optional[int] = None
    assigned_to: Optional[str] = None

class LicenseActivationResponse(BaseModel):
    success: bool
    activation_id: Optional[str] = None
    license_type: Optional[str] = None
    expires_at: Optional[datetime] = None
    max_evaluations: Optional[int] = None
    message: Optional[str] = None
    error: Optional[str] = None

class UserLicenseResponse(BaseModel):
    has_license: bool
    reason: Optional[str] = None
    license_key: Optional[str] = None
    license_type: Optional[str] = None
    expires_at: Optional[datetime] = None
    max_evaluations: Optional[int] = None
    activated_at: Optional[datetime] = None
    status: Optional[str] = None

# Helper function to get Supabase client
def get_supabase():
    return get_supabase_client()

# Helper function to extract user info from request
def get_user_from_request(request: Request) -> Dict[str, Any]:
    """Extract user information from the request headers"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = auth_header.split(' ')[1]
    try:
        import jwt
        # Decode JWT token (without verification for now - in production you'd verify)
        decoded = jwt.decode(token, options={"verify_signature": False})
        return {
            'user_id': decoded.get('sub'),
            'email': decoded.get('email'),
            'name': decoded.get('name', '')
        }
    except Exception as e:
        logger.error(f"Error decoding JWT token: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/validate", response_model=LicenseValidationResponse)
async def validate_license_key(request: LicenseKeyValidationRequest):
    """Validate a license key"""
    try:
        supabase = get_supabase()
        
        # Call the database function to validate the license key
        result = supabase.rpc('validate_license_key', {
            'key': request.license_key,
            'user_id': request.user_id
        }).execute()
        
        if result.data:
            validation_result = result.data
            return LicenseValidationResponse(**validation_result)
        else:
            raise HTTPException(status_code=500, detail="Failed to validate license key")
            
    except Exception as e:
        logger.error(f"Error validating license key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")

@router.post("/activate", response_model=LicenseActivationResponse)
async def activate_license_key(request: LicenseKeyActivationRequest, http_request: Request):
    """Activate a license key for a user"""
    try:
        supabase = get_supabase()
        
        # Get device info and IP from request
        device_info = request.device_info or {}
        ip_address = request.ip_address or http_request.client.host
        user_agent = request.user_agent or http_request.headers.get('User-Agent', '')
        
        # Call the database function to activate the license key
        result = supabase.rpc('activate_license_key', {
            'key': request.license_key,
            'user_id': request.user_id,
            'device_info': json.dumps(device_info),
            'ip_address': ip_address,
            'user_agent': user_agent
        }).execute()
        
        if result.data:
            activation_result = result.data
            if activation_result.get('success'):
                logger.info(f"License key activated successfully for user {request.user_id}")
                return LicenseActivationResponse(**activation_result)
            else:
                return LicenseActivationResponse(
                    success=False,
                    error=activation_result.get('error', 'Activation failed')
                )
        else:
            raise HTTPException(status_code=500, detail="Failed to activate license key")
            
    except Exception as e:
        logger.error(f"Error activating license key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Activation error: {str(e)}")

@router.get("/user/{user_id}/status", response_model=UserLicenseResponse)
async def get_user_license_status(user_id: str):
    """Get the license status for a user"""
    try:
        supabase = get_supabase()
        
        # Call the database function to check user's license status
        result = supabase.rpc('user_has_active_license', {
            'user_id': user_id
        }).execute()
        
        if result.data:
            return UserLicenseResponse(**result.data)
        else:
            raise HTTPException(status_code=500, detail="Failed to get user license status")
            
    except Exception as e:
        logger.error(f"Error getting user license status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Status check error: {str(e)}")

@router.post("/create", response_model=LicenseKeyResponse)
async def create_license_key(request: LicenseKeyCreateRequest, http_request: Request):
    """Create a new license key (admin only)"""
    try:
        # Check if user has admin access
        require_admin_access(http_request)
        admin_info = get_admin_user_info(http_request)
        
        supabase = get_supabase()
        
        # Generate a new license key
        key_result = supabase.rpc('generate_license_key', {
            'prefix': 'EGPT'
        }).execute()
        
        if not key_result.data:
            raise HTTPException(status_code=500, detail="Failed to generate license key")
        
        license_key = key_result.data
        
        # Create the license key record
        license_data = {
            'license_key': license_key,
            'license_type': request.license_type,
            'status': 'active',
            'max_users': request.max_users,
            'max_evaluations': request.max_evaluations,
            'expires_at': request.expires_at.isoformat() if request.expires_at else None,
            'max_uses': request.max_uses,
            'description': request.description,
            'notes': request.notes,
            'source': request.source,
            'created_by': admin_info.get('session_token', 'admin')
        }
        
        result = supabase.table('license_keys').insert(license_data).execute()
        
        if result.data:
            license_record = result.data[0]
            logger.info(f"License key created: {license_key} by admin")
            return LicenseKeyResponse(**license_record)
        else:
            raise HTTPException(status_code=500, detail="Failed to create license key")
            
    except Exception as e:
        logger.error(f"Error creating license key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Creation error: {str(e)}")

@router.get("/list", response_model=List[LicenseKeyResponse])
async def list_license_keys(
    status: Optional[str] = None,
    license_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    http_request: Request = None
):
    """List license keys (admin only)"""
    try:
        # Check if user has admin access
        require_admin_access(http_request)
        
        supabase = get_supabase()
        
        query = supabase.table('license_keys').select('*')
        
        if status:
            query = query.eq('status', status)
        if license_type:
            query = query.eq('license_type', license_type)
        
        query = query.order('created_at', desc=True).range(offset, offset + limit - 1)
        
        result = query.execute()
        
        if result.data:
            return [LicenseKeyResponse(**record) for record in result.data]
        else:
            return []
            
    except Exception as e:
        logger.error(f"Error listing license keys: {str(e)}")
        raise HTTPException(status_code=500, detail=f"List error: {str(e)}")

@router.get("/{license_key_id}", response_model=LicenseKeyResponse)
async def get_license_key(license_key_id: str, http_request: Request):
    """Get a specific license key (admin only)"""
    try:
        # Check if user has admin access
        require_admin_access(http_request)
        
        supabase = get_supabase()
        
        result = supabase.table('license_keys').select('*').eq('id', license_key_id).execute()
        
        if result.data:
            return LicenseKeyResponse(**result.data[0])
        else:
            raise HTTPException(status_code=404, detail="License key not found")
            
    except Exception as e:
        logger.error(f"Error getting license key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Get error: {str(e)}")

@router.put("/{license_key_id}/revoke")
async def revoke_license_key(
    license_key_id: str, 
    reason: str = "Revoked by admin",
    http_request: Request = None
):
    """Revoke a license key (admin only)"""
    try:
        # Check if user is admin
        user_info = get_user_from_request(http_request)
        if not is_admin_email(user_info['email']):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        supabase = get_supabase()
        
        # Update the license key status
        result = supabase.table('license_keys').update({
            'status': 'revoked',
            'revoked_at': datetime.now().isoformat(),
            'revoked_by': user_info['user_id'],
            'revoke_reason': reason,
            'updated_at': datetime.now().isoformat()
        }).eq('id', license_key_id).execute()
        
        if result.data:
            logger.info(f"License key {license_key_id} revoked by user {user_info['user_id']}")
            return {"message": "License key revoked successfully"}
        else:
            raise HTTPException(status_code=404, detail="License key not found")
            
    except Exception as e:
        logger.error(f"Error revoking license key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Revoke error: {str(e)}")

@router.get("/user/{user_id}/usage")
async def get_user_license_usage(user_id: str, http_request: Request):
    """Get license usage history for a user"""
    try:
        # Check if user is requesting their own data or is admin
        user_info = get_user_from_request(http_request)
        if user_info['user_id'] != user_id:
            # Check if user is admin
            if not is_admin_email(user_info['email']):
                raise HTTPException(status_code=403, detail="Admin access required")
        
        supabase = get_supabase()
        
        # Get usage logs for the user
        result = supabase.table('license_usage_log').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        
        if result.data:
            return {"usage_logs": result.data}
        else:
            return {"usage_logs": []}
            
    except Exception as e:
        logger.error(f"Error getting user license usage: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Usage check error: {str(e)}")

@router.post("/check-access")
async def check_license_access(
    user_id: str,
    action: str = "evaluation",
    http_request: Request = None
):
    """Check if user has license access for a specific action"""
    try:
        supabase = get_supabase()
        
        # Get user's license status
        license_result = supabase.rpc('user_has_active_license', {
            'user_id': user_id
        }).execute()
        
        if not license_result.data:
            return {
                "has_access": False,
                "reason": "Failed to check license status"
            }
        
        license_info = license_result.data
        
        if not license_info.get('has_license'):
            return {
                "has_access": False,
                "reason": license_info.get('reason', 'No active license')
            }
        
        # Check specific action permissions
        if action == "evaluation":
            # Check if user has evaluation credits
            user_result = supabase.table('assessment_users').select('credits').eq('uid', user_id).execute()
            if user_result.data:
                user_credits = user_result.data[0].get('credits', 0)
                if user_credits <= 0:
                    return {
                        "has_access": False,
                        "reason": "No evaluation credits remaining"
                    }
        
        return {
            "has_access": True,
            "license_type": license_info.get('license_type'),
            "expires_at": license_info.get('expires_at'),
            "max_evaluations": license_info.get('max_evaluations')
        }
        
    except Exception as e:
        logger.error(f"Error checking license access: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Access check error: {str(e)}")
