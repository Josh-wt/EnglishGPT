"""
Admin Authentication Service
Handles secure admin access using secret keys
"""

import hashlib
import hmac
import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import secrets

logger = logging.getLogger(__name__)

class AdminAuthService:
    def __init__(self):
        # Generate a secure admin key if not set
        self.admin_key = os.environ.get('ADMIN_SECRET_KEY', self._generate_secure_key())
        self.key_hash = self._hash_key(self.admin_key)
        
        # Store active admin sessions
        self.admin_sessions = {}
        
        logger.info("AdminAuthService initialized with secure key system")
    
    def _generate_secure_key(self) -> str:
        """Generate a secure random admin key"""
        # Generate a 32-character random key
        key = secrets.token_urlsafe(32)
        logger.warning(f"Generated new admin key: {key}")
        logger.warning("IMPORTANT: Save this key securely! Set ADMIN_SECRET_KEY environment variable.")
        return key
    
    def _hash_key(self, key: str) -> str:
        """Hash the admin key for secure storage"""
        return hashlib.sha256(key.encode()).hexdigest()
    
    def _verify_key(self, provided_key: str) -> bool:
        """Verify if the provided key matches the admin key"""
        if not provided_key:
            return False
        provided_hash = self._hash_key(provided_key)
        return hmac.compare_digest(provided_hash, self.key_hash)
    
    def authenticate_admin(self, provided_key: str) -> Dict[str, Any]:
        """Authenticate admin with provided key"""
        if not self._verify_key(provided_key):
            logger.warning("Invalid admin key provided")
            return {
                'success': False,
                'message': 'Invalid admin key'
            }
        
        # Generate session token
        session_token = secrets.token_urlsafe(32)
        session_expiry = datetime.now() + timedelta(hours=24)  # 24 hour session
        
        # Store session
        self.admin_sessions[session_token] = {
            'authenticated': True,
            'expires_at': session_expiry,
            'authenticated_at': datetime.now()
        }
        
        logger.info("Admin authenticated successfully")
        return {
            'success': True,
            'session_token': session_token,
            'expires_at': session_expiry.isoformat(),
            'message': 'Admin access granted'
        }
    
    def verify_session(self, session_token: str) -> bool:
        """Verify if session token is valid"""
        if not session_token or session_token not in self.admin_sessions:
            return False
        
        session = self.admin_sessions[session_token]
        if datetime.now() > session['expires_at']:
            # Session expired, remove it
            del self.admin_sessions[session_token]
            return False
        
        return True
    
    def revoke_session(self, session_token: str) -> bool:
        """Revoke an admin session"""
        if session_token in self.admin_sessions:
            del self.admin_sessions[session_token]
            logger.info("Admin session revoked")
            return True
        return False
    
    def get_admin_key(self) -> str:
        """Get the current admin key (for setup purposes)"""
        return self.admin_key
    
    def is_admin_authenticated(self, session_token: Optional[str]) -> bool:
        """Check if user has valid admin session"""
        if not session_token:
            return False
        return self.verify_session(session_token)

# Global instance
admin_auth_service = AdminAuthService()
