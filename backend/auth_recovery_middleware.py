"""
Auth Recovery Middleware for Assessment Platform
Automatically handles cases where users are authenticated but their database records are missing
"""

import logging
from typing import Dict, Any, Optional
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from user_management_service import UserManagementService

logger = logging.getLogger(__name__)

class AuthRecoveryMiddleware(BaseHTTPMiddleware):
    """Middleware to automatically recover users with auth/database mismatches"""
    
    def __init__(self, app, user_management_service: UserManagementService):
        super().__init__(app)
        self.user_management_service = user_management_service
        
        # Endpoints that should trigger auth recovery
        self.recovery_endpoints = {
            '/api/users/{user_id}': ['GET', 'PUT'],
            '/api/evaluations/user/{user_id}': ['GET'],
            '/api/analytics/{user_id}': ['GET'],
            '/api/badges/{user_id}': ['GET'],
            '/api/badges/check/{user_id}': ['POST'],
            '/api/debug/subscription-check/{user_id}': ['GET'],
            '/api/test-plan-update/{user_id}': ['POST']
        }
        
        # Endpoints that should attempt user creation/restoration
        self.creation_endpoints = {
            '/api/users': ['POST']
        }
    
    async def dispatch(self, request: Request, call_next):
        """Process the request and handle auth recovery if needed"""
        
        # Skip middleware for non-API requests
        if not request.url.path.startswith('/api/'):
            return await call_next(request)
        
        # Check if this endpoint should trigger auth recovery
        should_recover = self._should_trigger_recovery(request.url.path, request.method)
        should_create = self._should_trigger_creation(request.url.path, request.method)
        
        if not should_recover and not should_create:
            return await call_next(request)
        
        try:
            # Extract user ID from path parameters
            user_id = self._extract_user_id_from_path(request.url.path)
            
            if not user_id or user_id == "undefined":
                return await call_next(request)
            
            # Check if user exists in database
            user_exists = await self.user_management_service.get_user_by_id(user_id)
            
            if not user_exists and should_recover:
                # User doesn't exist but should - attempt recovery
                logger.warning(f"User not found, attempting auth recovery for: {user_id}")
                
                # Try to get user info from request headers or body
                user_info = await self._extract_user_info_from_request(request)
                
                if user_info and user_info.get('email'):
                    # Attempt to recover the user
                    recovery_result = await self.user_management_service.handle_auth_database_mismatch(
                        auth_user_id=user_id,
                        email=user_info['email'],
                        metadata=user_info.get('metadata', {})
                    )
                    
                    if recovery_result['success']:
                        logger.info(f"Successfully recovered user {user_id} via auth recovery middleware")
                        # Continue with the request - user should now exist
                    else:
                        logger.error(f"Failed to recover user {user_id}: {recovery_result.get('error')}")
                        # Return error response
                        return JSONResponse(
                            status_code=500,
                            content={
                                "error": "User recovery failed",
                                "details": recovery_result.get('error'),
                                "user_id": user_id,
                                "recovery_method": recovery_result.get('recovery_method')
                            }
                        )
                else:
                    logger.error(f"Cannot recover user {user_id} - no email information available")
                    return JSONResponse(
                        status_code=400,
                        content={
                            "error": "Cannot recover user - missing email information",
                            "user_id": user_id
                        }
                    )
            
            elif not user_exists and should_create:
                # User doesn't exist and this is a creation endpoint
                logger.info(f"User creation endpoint called for non-existent user: {user_id}")
                # Let the endpoint handle user creation normally
                pass
            
            # Continue with the request
            return await call_next(request)
            
        except Exception as e:
            logger.error(f"Error in auth recovery middleware: {str(e)}")
            # Continue with the request even if middleware fails
            return await call_next(request)
    
    def _should_trigger_recovery(self, path: str, method: str) -> bool:
        """Check if the endpoint should trigger auth recovery"""
        for endpoint_pattern, methods in self.recovery_endpoints.items():
            if method in methods and self._path_matches_pattern(path, endpoint_pattern):
                return True
        return False
    
    def _should_trigger_creation(self, path: str, method: str) -> bool:
        """Check if the endpoint should trigger user creation"""
        for endpoint_pattern, methods in self.creation_endpoints.items():
            if method in methods and self._path_matches_pattern(path, endpoint_pattern):
                return True
        return False
    
    def _path_matches_pattern(self, path: str, pattern: str) -> bool:
        """Check if a path matches a pattern with path parameters"""
        # Simple pattern matching for path parameters
        if '{user_id}' in pattern:
            # Convert pattern to regex-like matching
            pattern_parts = pattern.split('/')
            path_parts = path.split('/')
            
            if len(pattern_parts) != len(path_parts):
                return False
            
            for i, pattern_part in enumerate(pattern_parts):
                if pattern_part == '{user_id}':
                    # This part should be a valid user ID
                    if not path_parts[i] or path_parts[i] == "undefined":
                        return False
                elif pattern_part != path_parts[i]:
                    return False
            
            return True
        
        return path == pattern
    
    def _extract_user_id_from_path(self, path: str) -> Optional[str]:
        """Extract user ID from path parameters"""
        path_parts = path.split('/')
        
        # Look for user_id in common patterns
        for i, part in enumerate(path_parts):
            if part == 'user_id' and i + 1 < len(path_parts):
                return path_parts[i + 1]
            elif part == 'user' and i + 1 < len(path_parts):
                return path_parts[i + 1]
        
        # Fallback: look for UUID-like patterns
        import re
        uuid_pattern = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', re.IGNORECASE)
        match = uuid_pattern.search(path)
        if match:
            return match.group(0)
        
        return None
    
    async def _extract_user_info_from_request(self, request: Request) -> Optional[Dict[str, Any]]:
        """Extract user information from request headers or body"""
        try:
            # Try to get user info from request body
            if request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    body = await request.json()
                    if isinstance(body, dict):
                        return {
                            'email': body.get('email'),
                            'metadata': {
                                'name': body.get('name'),
                                'avatar_url': body.get('photo_url')
                            }
                        }
                except:
                    pass
            
            # Try to get user info from query parameters
            email = request.query_params.get('email')
            if email:
                return {
                    'email': email,
                    'metadata': {}
                }
            
            # Try to get user info from headers
            email = request.headers.get('x-user-email')
            if email:
                return {
                    'email': email,
                    'metadata': {}
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting user info from request: {str(e)}")
            return None

class AuthRecoveryDecorator:
    """Decorator for individual endpoints that need auth recovery"""
    
    def __init__(self, user_management_service: UserManagementService):
        self.user_management_service = user_management_service
    
    def __call__(self, func):
        """Decorator implementation"""
        async def wrapper(*args, **kwargs):
            try:
                # Extract user_id from function arguments or path
                user_id = self._extract_user_id_from_args(args, kwargs)
                
                if user_id and user_id != "undefined":
                    # Check if user exists
                    user_exists = await self.user_management_service.get_user_by_id(user_id)
                    
                    if not user_exists:
                        logger.warning(f"User not found in decorated function, attempting recovery: {user_id}")
                        
                        # Try to recover user (this would need email from context)
                        # For now, just log the issue
                        logger.error(f"Cannot auto-recover user {user_id} in decorated function - needs email context")
                
                # Call the original function
                return await func(*args, **kwargs)
                
            except Exception as e:
                logger.error(f"Error in auth recovery decorator: {str(e)}")
                # Re-raise the exception
                raise
        
        return wrapper
    
    def _extract_user_id_from_args(self, args, kwargs) -> Optional[str]:
        """Extract user_id from function arguments"""
        # Look for user_id in kwargs
        if 'user_id' in kwargs:
            return kwargs['user_id']
        
        # Look for user_id in args (assuming it's the first string argument)
        for arg in args:
            if isinstance(arg, str) and len(arg) > 10:  # Likely a UUID
                return arg
        
        return None

# Utility function to create the middleware
def create_auth_recovery_middleware(user_management_service: UserManagementService):
    """Factory function to create auth recovery middleware"""
    return AuthRecoveryMiddleware(None, user_management_service)

# Utility function to create the decorator
def auth_recovery_required(user_management_service: UserManagementService):
    """Factory function to create auth recovery decorator"""
    return AuthRecoveryDecorator(user_management_service)
