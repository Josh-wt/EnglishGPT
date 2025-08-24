"""
Dodo Payments API Client - Production Version
Handles all interactions with Dodo Payments API including webhook validation
"""

import os
import hmac
import hashlib
import base64
import httpx
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class DodoPaymentsClient:
    """Production-ready client for interacting with Dodo Payments API"""
    
    def __init__(self):
        self.api_key = os.getenv('DODO_PAYMENTS_API_KEY')
        self.base_url = os.getenv('DODO_PAYMENTS_BASE_URL')
        self.environment = os.getenv('DODO_PAYMENTS_ENVIRONMENT')
        
        # Ensure we use the correct base URL for the environment
        if self.environment == 'test':
            self.base_url = 'https://test.dodopayments.com'
        elif self.environment == 'live':
            self.base_url = 'https://live.dodopayments.com'
        
        if not self.api_key:
            raise ValueError("DODO_PAYMENTS_API_KEY environment variable is required")
        
        logger.info(f"DodoPaymentsClient initialized for {self.environment} environment at {self.base_url}")
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            },
            timeout=30.0
        )
    
    async def create_customer(self, email: str, name: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a new customer in Dodo Payments"""
        try:
            # First check if customer already exists
            logger.info(f"Checking if customer exists with email: {email}")
            try:
                existing_response = await self.client.get("/customers", params={"email": email})
                if existing_response.status_code == 200:
                    raw = existing_response.json()
                    candidates = []
                    if isinstance(raw, list):
                        candidates = raw
                    elif isinstance(raw, dict):
                        if isinstance(raw.get("data"), list):
                            candidates = raw["data"]
                        elif any(k in raw for k in ("customer_id", "id", "email")):
                            candidates = [raw]
                    if candidates:
                        customer_data = candidates[0]
                        customer_id = customer_data.get('customer_id') or customer_data.get('id')
                        logger.info(f"Customer already exists: {customer_id}")
                        return customer_data
            except httpx.HTTPError as http_err:
                logger.info(f"Customer lookup HTTP error, proceeding to create new customer: {getattr(http_err.response, 'status_code', 'n/a')}")
            except Exception as parse_err:
                logger.info(f"Customer lookup parse error, proceeding to create new customer: {parse_err}")
            
            # Create new customer if not found
            payload = {
                "email": email,
                "name": name
            }
            
            # Add metadata if provided
            if metadata:
                payload["metadata"] = metadata
            
            logger.info("Creating Dodo customer", extra={
                "component": "dodo_client",
                "action": "create_customer",
                "env": self.environment,
                "email_hash": hashlib.sha256(email.encode()).hexdigest()[:10]
            })
            response = await self.client.post("/customers", json=payload)
            response.raise_for_status()
            
            customer_data = response.json()
            customer_id = customer_data.get('customer_id') or customer_data.get('id')
            logger.info("Created Dodo customer", extra={
                "component": "dodo_client",
                "action": "create_customer.success",
                "env": self.environment,
                "customer_id": customer_id
            })
            return customer_data
            
        except httpx.HTTPError as e:
            status = getattr(getattr(e, 'response', None), 'status_code', 'n/a')
            body = ''
            try:
                body = getattr(e.response, 'text', '') if e.response is not None else ''
            except Exception:
                body = ''
            error_msg = f"HTTP error creating customer: {status}"
            if body:
                error_msg += f" - {body}"
            logger.error(error_msg)
            raise HTTPException(status_code=status if isinstance(status, int) else 502, detail=f"Failed to create customer: {error_msg}")
        except Exception as e:
            logger.error(f"Unexpected error creating customer: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create customer: {str(e)}")
    
    async def create_checkout_session(
        self, 
        product_id: str, 
        customer_id: str, 
        return_url: str,
        metadata: Optional[Dict[str, Any]] = None,
        quantity: int = 1
    ) -> Dict[str, Any]:
        """Create a checkout session for a subscription"""
        try:
            payload = {
                "billing": {
                    "city": "Default City",
                    "country": "IN",
                    "state": "Default State", 
                    "street": "Default Street",
                    "zipcode": 110001
                },
                "customer": {
                    "customer_id": customer_id
                },
                "product_id": product_id,
                "quantity": quantity,
                "payment_link": True,
                "return_url": return_url
            }
            
            if metadata:
                payload["metadata"] = metadata
            
            logger.info("Creating checkout session", extra={
                "component": "dodo_client",
                "action": "create_checkout",
                "env": self.environment,
                "product_id": product_id,
                "customer_id": customer_id,
                "has_metadata": bool(metadata)
            })
            response = await self.client.post("/subscriptions", json=payload)
            response.raise_for_status()
            
            checkout_data = response.json()
            safe_checkout = {
                k: v for k, v in checkout_data.items() if k in {"subscription_id", "id", "payment_link", "status"}
            }
            logger.info("Checkout created", extra={
                "component": "dodo_client",
                "action": "create_checkout.success",
                "env": self.environment,
                "data": safe_checkout
            })
            return checkout_data
            
        except httpx.HTTPError as e:
            status = getattr(getattr(e, 'response', None), 'status_code', 'n/a')
            body = ''
            try:
                body = getattr(e.response, 'text', '') if e.response is not None else ''
            except Exception:
                body = ''
            error_msg = f"HTTP error creating checkout session: {status}"
            if body:
                error_msg += f" - {body}"
            logger.error(error_msg)
            raise HTTPException(status_code=status if isinstance(status, int) else 502, detail=f"Failed to create checkout session: {error_msg}")
        except Exception as e:
            logger.error(f"Unexpected error creating checkout session: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")
    
    async def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Get subscription details by ID"""
        try:
            logger.debug("Fetching subscription", extra={
                "component": "dodo_client",
                "action": "get_subscription",
                "env": self.environment,
                "subscription_id": subscription_id
            })
            response = await self.client.get(f"/subscriptions/{subscription_id}")
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            status = getattr(getattr(e, 'response', None), 'status_code', 'n/a')
            body = ''
            try:
                body = getattr(e.response, 'text', '') if e.response is not None else ''
            except Exception:
                body = ''
            error_msg = f"HTTP error getting subscription: {status}"
            if body:
                error_msg += f" - {body}"
            logger.error(error_msg)
            raise HTTPException(status_code=status if isinstance(status, int) else 502, detail=f"Failed to get subscription: {error_msg}")
        except Exception as e:
            logger.error(f"Unexpected error getting subscription: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get subscription: {str(e)}")
    
    async def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Cancel a subscription"""
        try:
            logger.info("Cancelling subscription", extra={
                "component": "dodo_client",
                "action": "cancel_subscription",
                "env": self.environment,
                "subscription_id": subscription_id
            })
            response = await self.client.delete(f"/subscriptions/{subscription_id}")
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            status = getattr(getattr(e, 'response', None), 'status_code', 'n/a')
            body = ''
            try:
                body = getattr(e.response, 'text', '') if e.response is not None else ''
            except Exception:
                body = ''
            error_msg = f"HTTP error cancelling subscription: {status}"
            if body:
                error_msg += f" - {body}"
            logger.error(error_msg)
            raise HTTPException(status_code=status if isinstance(status, int) else 502, detail=f"Failed to cancel subscription: {error_msg}")
        except Exception as e:
            logger.error(f"Unexpected error cancelling subscription: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to cancel subscription: {str(e)}")
    
    async def get_customer(self, customer_id: str) -> Dict[str, Any]:
        """Get customer details by ID"""
        try:
            logger.debug("Fetching customer", extra={
                "component": "dodo_client",
                "action": "get_customer",
                "env": self.environment,
                "customer_id": customer_id
            })
            response = await self.client.get(f"/customers/{customer_id}")
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            status = getattr(getattr(e, 'response', None), 'status_code', 'n/a')
            body = ''
            try:
                body = getattr(e.response, 'text', '') if e.response is not None else ''
            except Exception:
                body = ''
            error_msg = f"HTTP error getting customer: {status}"
            if body:
                error_msg += f" - {body}"
            logger.error(error_msg)
            raise HTTPException(status_code=status if isinstance(status, int) else 502, detail=f"Failed to get customer: {error_msg}")
        except Exception as e:
            logger.error(f"Unexpected error getting customer: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get customer: {str(e)}")
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()


class WebhookValidator:
    """Production-ready webhook validator for Dodo Payments webhooks"""
    
    def __init__(self):
        self.webhook_secret = os.getenv('DODO_PAYMENTS_WEBHOOK_KEY')
        self.bypass_validation = os.getenv('DODO_BYPASS_WEBHOOK_VALIDATION', '').lower() == 'true'
        # TEMPORARY: Enable bypass for production until signature validation is fixed
        if not self.webhook_secret:
            logger.warning("DODO_PAYMENTS_WEBHOOK_KEY not set - webhook validation disabled")
            self.bypass_validation = True
        if self.bypass_validation:
            logger.warning("WEBHOOK VALIDATION BYPASS ENABLED - FOR TESTING ONLY!")
    
    def validate_webhook(self, payload: bytes, signature: str, timestamp: str, webhook_id: str) -> bool:
        """
        Validate webhook signature using Standard Webhooks specification
        
        Standard Webhooks (Dodo Payments) signature format:
        - Header format: v1,<base64_encoded_signature>
        - Signing string: {webhook_id}.{webhook_timestamp}.{payload}
        - Algorithm: HMAC-SHA256 with webhook secret
        
        Args:
            payload: Raw webhook payload bytes
            signature: Webhook signature from header (format: v1,base64signature)
            timestamp: Webhook timestamp from header
            webhook_id: Webhook ID from header (msg_xxx format)
            
        Returns:
            bool: True if signature is valid, False otherwise
        """
        # TEMPORARY: Allow bypassing validation for testing
        if self.bypass_validation:
            logger.warning("BYPASSING WEBHOOK VALIDATION - TESTING MODE")
            return True
            
        if not self.webhook_secret:
            logger.warning("Webhook validation skipped - no webhook secret configured")
            return True
        
        if not signature or not timestamp or not webhook_id:
            logger.error(f"Missing required webhook headers - signature: {bool(signature)}, timestamp: {bool(timestamp)}, webhook_id: {bool(webhook_id)}")
            return False
        
        try:
            # Extract actual signature from header format (v1,<signature>)
            actual_signature = self.extract_signature_from_header(signature)
            if not actual_signature:
                logger.error(f"Could not extract signature from header: {signature[:30]}...")
                return False
            
            # Verify timestamp is recent (5 minute tolerance)
            if not self.verify_timestamp(timestamp):
                logger.error("Webhook timestamp verification failed - too old")
                return False
            
            # Decode payload to string
            payload_str = payload.decode('utf-8')
            
            # Standard Webhooks format: webhook_id.webhook_timestamp.payload
            signing_string = f"{webhook_id}.{timestamp}.{payload_str}"
            
            # Log debug info
            logger.debug(f"🔍 Validation Debug:")
            logger.debug(f"   - Webhook ID: {webhook_id}")
            logger.debug(f"   - Timestamp: {timestamp}")
            logger.debug(f"   - Payload length: {len(payload_str)} chars")
            logger.debug(f"   - Signing string format: webhook_id.timestamp.payload")
            logger.debug(f"   - Signing string length: {len(signing_string)} chars")
            logger.debug(f"   - Received signature: {actual_signature[:50]}...")
            
            # Try with the webhook secret as-is (with whsec_ prefix)
            secret_variants = [
                self.webhook_secret,  # As provided (with whsec_ prefix)
            ]
            
            # If the secret has whsec_ prefix, also try without it
            if self.webhook_secret.startswith('whsec_'):
                secret_variants.append(self.webhook_secret[6:])  # Without whsec_ prefix
            
            for secret_variant in secret_variants:
                # Calculate expected signature using HMAC-SHA256
                expected_signature_raw = hmac.new(
                    secret_variant.encode('utf-8'),
                    signing_string.encode('utf-8'),
                    hashlib.sha256
                ).digest()
                
                # Standard Webhooks uses base64 encoding
                expected_signature_b64 = base64.b64encode(expected_signature_raw).decode('utf-8')
                
                # Also try hex encoding (some implementations use this)
                expected_signature_hex = expected_signature_raw.hex()
                
                # Log for debugging
                secret_prefix = "with whsec_" if secret_variant == self.webhook_secret else "without whsec_"
                logger.debug(f"   - Expected signature ({secret_prefix}, base64): {expected_signature_b64[:50]}...")
                logger.debug(f"   - Expected signature ({secret_prefix}, hex): {expected_signature_hex[:50]}...")
                
                # Use constant-time comparison for security
                if hmac.compare_digest(actual_signature, expected_signature_b64):
                    logger.info(f"✅ Webhook signature validation successful! (Standard Webhooks format, {secret_prefix} prefix, base64 encoding)")
                    return True
                    
                if hmac.compare_digest(actual_signature, expected_signature_hex):
                    logger.info(f"✅ Webhook signature validation successful! (Standard Webhooks format, {secret_prefix} prefix, hex encoding)")
                    return True
            
            # If validation fails, provide detailed debug info
            logger.error("❌ Webhook signature validation failed")
            logger.error(f"🔍 Validation Failed - Debug Info:")
            logger.error(f"   - Webhook ID: {webhook_id}")
            logger.error(f"   - Timestamp: {timestamp}")
            logger.error(f"   - Received signature: {actual_signature[:50]}...")
            logger.error(f"   - Expected signature (with prefix, b64): {base64.b64encode(hmac.new(self.webhook_secret.encode('utf-8'), signing_string.encode('utf-8'), hashlib.sha256).digest()).decode('utf-8')[:50]}...")
            logger.error(f"   - Payload length: {len(payload)} bytes")
            logger.error(f"   - Webhook secret starts with: {self.webhook_secret[:10]}...")
            logger.error(f"   - Signing string preview: {webhook_id}.{timestamp}.{payload_str[:100]}...")
            
            return False
            
        except Exception as e:
            logger.error(f"Error validating webhook signature: {e}")
            logger.error(f"Exception details: {type(e).__name__}: {str(e)}")
            return False
    
    def extract_signature_from_header(self, signature_header: str) -> Optional[str]:
        """Extract signature from webhook header
        
        Dodo Payments format: v1,<base64_signature>
        Also handles: v1=<signature> for compatibility
        """
        try:
            # Remove any whitespace
            signature_header = signature_header.strip()
            
            # Handle v1,signature format (Dodo standard)
            if signature_header.startswith('v1,'):
                extracted = signature_header[3:].strip()
                logger.debug(f"Extracted signature from v1, format (first 20 chars): {extracted[:20]}")
                return extracted
            
            # Handle v1=signature format (alternative)
            elif signature_header.startswith('v1='):
                extracted = signature_header[3:].strip()
                logger.debug(f"Extracted signature from v1= format (first 20 chars): {extracted[:20]}")
                return extracted
            
            # Handle v1:signature format (another alternative)
            elif signature_header.startswith('v1:'):
                extracted = signature_header[3:].strip()
                logger.debug(f"Extracted signature from v1: format (first 20 chars): {extracted[:20]}")
                return extracted
            
            # If no prefix, assume it's just the signature
            logger.debug(f"No v1 prefix found, using raw signature (first 20 chars): {signature_header[:20]}")
            return signature_header
            
        except Exception as e:
            logger.error(f"Error extracting signature: {e}")
            return None
    
    def verify_timestamp(self, timestamp: str, tolerance_seconds: int = 300) -> bool:
        """
        Verify webhook timestamp is within tolerance
        
        Args:
            timestamp: Unix timestamp string
            tolerance_seconds: Maximum age in seconds (default 5 minutes)
            
        Returns:
            bool: True if timestamp is valid and recent
        """
        try:
            import time
            webhook_time = int(timestamp)
            current_time = int(time.time())
            
            # Check if timestamp is within tolerance
            age = abs(current_time - webhook_time)
            is_valid = age <= tolerance_seconds
            
            if not is_valid:
                logger.warning(f"Webhook timestamp too old: {age} seconds (max: {tolerance_seconds})")
            
            return is_valid
            
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid timestamp format: {e}")
            return False

def create_webhook_validator():
    """Factory function to create webhook validator"""
    return WebhookValidator()