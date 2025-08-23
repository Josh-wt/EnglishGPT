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
        self.base_url = os.getenv('DODO_PAYMENTS_BASE_URL', 'https://live.dodopayments.com')
        self.environment = os.getenv('DODO_PAYMENTS_ENVIRONMENT', 'live')
        
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
                existing_response = await self.client.get(f"/customers?email={email}")
                if existing_response.status_code == 200:
                    existing_data = existing_response.json()
                    if existing_data and len(existing_data) > 0:
                        customer_data = existing_data[0]
                        customer_id = customer_data.get('customer_id') or customer_data.get('id')
                        logger.info(f"Customer already exists: {customer_id}")
                        return customer_data
            except httpx.HTTPError:
                logger.info("Customer lookup failed, proceeding to create new customer")
            
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
            error_msg = f"HTTP error creating customer: {e.response.status_code}"
            if hasattr(e.response, 'text'):
                error_msg += f" - {e.response.text}"
            logger.error(error_msg)
            raise HTTPException(status_code=e.response.status_code, detail=f"Failed to create customer: {error_msg}")
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
            error_msg = f"HTTP error creating checkout session: {e.response.status_code}"
            if hasattr(e.response, 'text'):
                error_msg += f" - {e.response.text}"
            logger.error(error_msg)
            raise HTTPException(status_code=e.response.status_code, detail=f"Failed to create checkout session: {error_msg}")
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
            error_msg = f"HTTP error getting subscription: {e.response.status_code}"
            if hasattr(e.response, 'text'):
                error_msg += f" - {e.response.text}"
            logger.error(error_msg)
            raise HTTPException(status_code=e.response.status_code, detail=f"Failed to get subscription: {error_msg}")
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
            error_msg = f"HTTP error cancelling subscription: {e.response.status_code}"
            if hasattr(e.response, 'text'):
                error_msg += f" - {e.response.text}"
            logger.error(error_msg)
            raise HTTPException(status_code=e.response.status_code, detail=f"Failed to cancel subscription: {error_msg}")
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
            error_msg = f"HTTP error getting customer: {e.response.status_code}"
            if hasattr(e.response, 'text'):
                error_msg += f" - {e.response.text}"
            logger.error(error_msg)
            raise HTTPException(status_code=e.response.status_code, detail=f"Failed to get customer: {error_msg}")
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
        if not self.webhook_secret:
            logger.warning("DODO_PAYMENTS_WEBHOOK_KEY not set - webhook validation disabled")
    
    def validate_webhook(self, payload: bytes, signature: str, timestamp: str) -> bool:
        """
        Validate webhook signature using Dodo Payments webhook signing
        
        Args:
            payload: Raw webhook payload bytes
            signature: Webhook signature from header (format: v1,base64signature)
            timestamp: Webhook timestamp from header
            
        Returns:
            bool: True if signature is valid, False otherwise
        """
        if not self.webhook_secret:
            logger.warning("Webhook validation skipped - no webhook secret configured")
            return True
        
        if not signature or not timestamp:
            logger.error("Missing signature or timestamp in webhook")
            return False
        
        try:
            # Normalize signature header and verify timestamp
            normalized_sig = self.extract_signature_from_header(signature) or signature
            if not self.verify_timestamp(timestamp):
                logger.error("Webhook timestamp verification failed")
                return False

            # Build candidate messages for signing
            payload_str = payload.decode('utf-8')
            signed_standard = f"{timestamp}.{payload_str}".encode('utf-8')
            signed_payload_only = payload_str.encode('utf-8')

            # Compute HMAC-SHA256 digests for both candidate messages
            digest_std = hmac.new(self.webhook_secret.encode('utf-8'), signed_standard, hashlib.sha256).digest()
            digest_payload = hmac.new(self.webhook_secret.encode('utf-8'), signed_payload_only, hashlib.sha256).digest()

            # Create comparison variants (base64 and hex)
            candidates = [
                base64.b64encode(digest_std).decode('utf-8'),
                base64.b64encode(digest_payload).decode('utf-8'),
                hashlib.sha256(signed_standard).hexdigest(),
                hashlib.sha256(signed_payload_only).hexdigest(),
            ]

            # Compare against provided signature
            for idx, expected in enumerate(candidates):
                if hmac.compare_digest(normalized_sig, expected):
                    logger.info("Webhook signature validation successful", extra={
                        "variant": idx,
                        "uses_timestamp": idx in (0, 2)
                    })
                    return True

            logger.error("Webhook signature validation failed")
            # Log short prefixes only for safety
            logger.debug(f"Sig provided (prefix): {normalized_sig[:16]}")
            logger.debug(f"Expected (b64 std) prefix: {candidates[0][:16]}")
            logger.debug(f"Expected (b64 payload) prefix: {candidates[1][:16]}")
            logger.debug(f"Expected (hex std) prefix: {candidates[2][:16]}")
            logger.debug(f"Expected (hex payload) prefix: {candidates[3][:16]}")
            logger.debug(f"Timestamp: {timestamp}")
            logger.debug(f"Payload length: {len(payload)}")
            return False
            
        except Exception as e:
            logger.error(f"Error validating webhook signature: {e}")
            return False
    
    def extract_signature_from_header(self, signature_header: str) -> Optional[str]:
        """Extract signature from webhook header"""
        try:
            # Dodo Payments uses format: v1=signature or v1,signature
            if signature_header.startswith('v1='):
                return signature_header[3:]
            elif signature_header.startswith('v1,'):
                return signature_header[3:]
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