import os
import httpx
import hashlib
import hmac
import time
import json
import logging

logger = logging.getLogger(__name__)

class DodoPaymentsClient:
    def __init__(self):
        self.api_key = os.environ.get('DODO_PAYMENTS_API_KEY')
        self.base_url = os.environ.get('DODO_PAYMENTS_BASE_URL')
        self.environment = os.environ.get('DODO_PAYMENTS_ENVIRONMENT')

        if not self.api_key:
            raise ValueError("DODO_PAYMENTS_API_KEY environment variable not set.")
        if not self.base_url:
            raise ValueError("DODO_PAYMENTS_BASE_URL environment variable not set.")
        if not self.environment:
            raise ValueError("DODO_PAYMENTS_ENVIRONMENT environment variable not set.")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.client = httpx.AsyncClient(base_url=self.base_url, timeout=30.0)

    async def create_checkout_session(self, product_id: str, customer_id: str = None, customer_email: str = None, customer_name: str = None, return_url: str = None, metadata: dict = None):
        """Create a subscription checkout session according to Dodo Payments API"""
        try:
            # Build customer object - can be existing customer_id or new customer data
            if customer_id:
                customer_data = {"customer_id": customer_id}
            else:
                customer_data = {
                    "email": customer_email,
                    "name": customer_name or customer_email.split('@')[0]
                }
            
            # Default billing info (can be updated in the checkout)
            billing_data = {
                "city": "Default City",
                "country": "IN",
                "state": "Default State", 
                "street": "Default Street",
                "zipcode": 110001
            }
            
            payload = {
                "billing": billing_data,
                "customer": customer_data,
                "product_id": product_id,
                "quantity": 1,
                "payment_link": True,
                "return_url": return_url,
                "metadata": metadata or {}
            }
            
            logger.info(f"Creating Dodo subscription checkout with payload: {json.dumps(payload, indent=2)}")
            response = await self.client.post("/subscriptions", json=payload, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Checkout session created successfully: {result}")
            return result
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error creating checkout session: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error creating checkout session: {e}")
            raise

    async def get_subscription(self, subscription_id: str):
        """Get subscription details"""
        try:
            response = await self.client.get(f"/subscriptions/{subscription_id}", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error getting subscription {subscription_id}: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error getting subscription {subscription_id}: {e}")
            raise

    async def cancel_subscription(self, subscription_id: str, cancel_at_period_end: bool = True):
        """Cancel a subscription"""
        try:
            payload = {"cancel_at_period_end": cancel_at_period_end}
            response = await self.client.patch(f"/subscriptions/{subscription_id}", json=payload, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Subscription {subscription_id} cancelled successfully")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error cancelling subscription {subscription_id}: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error cancelling subscription {subscription_id}: {e}")
            raise

    async def reactivate_subscription(self, subscription_id: str):
        """Reactivate a cancelled subscription"""
        try:
            # Get current subscription details first
            subscription = await self.get_subscription(subscription_id)
            
            # Reactivate by setting cancel_at_period_end to False
            payload = {"cancel_at_period_end": False}
            response = await self.client.patch(f"/subscriptions/{subscription_id}", json=payload, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Subscription {subscription_id} reactivated successfully")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error reactivating subscription {subscription_id}: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error reactivating subscription {subscription_id}: {e}")
            raise

    async def create_customer_portal_session(self, customer_id: str):
        """Create a customer portal session"""
        try:
            payload = {"customer_id": customer_id}
            response = await self.client.post("/customers/customer-portal/session", json=payload, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Customer portal session created for customer {customer_id}")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error creating customer portal for {customer_id}: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error creating customer portal for {customer_id}: {e}")
            raise

    async def list_payments(self, customer_id: str, limit: int = 50):
        """List payments for a customer"""
        try:
            response = await self.client.get(f"/payments?customer_id={customer_id}&limit={limit}", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error listing payments for {customer_id}: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error listing payments for {customer_id}: {e}")
            raise

    async def list_subscriptions(self, customer_id: str, limit: int = 50):
        """List subscriptions for a customer"""
        try:
            response = await self.client.get(f"/subscriptions?customer_id={customer_id}&limit={limit}", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error listing subscriptions for {customer_id}: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error listing subscriptions for {customer_id}: {e}")
            raise

    async def get_customer(self, customer_id: str):
        """Get customer details"""
        try:
            response = await self.client.get(f"/customers/{customer_id}", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error getting customer {customer_id}: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error getting customer {customer_id}: {e}")
            raise

    async def create_customer(self, email: str, name: str, metadata: dict = None):
        """Create a new customer"""
        try:
            payload = {"email": email, "name": name}
            if metadata:
                payload["metadata"] = metadata
            
            logger.info(f"Creating customer with email: {email}, name: {name}")
            response = await self.client.post("/customers", json=payload, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Customer created successfully: {result}")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error creating customer {email}: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error creating customer {email}: {e}")
            raise

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

class WebhookValidator:
    def __init__(self):
        self.webhook_key = os.environ.get('DODO_PAYMENTS_WEBHOOK_KEY')
        if not self.webhook_key:
            raise ValueError("DODO_PAYMENTS_WEBHOOK_KEY environment variable not set.")

    def verify_signature(self, payload_body: bytes, signature: str, timestamp: str) -> bool:
        """
        Verify webhook signature using Standard Webhooks format
        Format: t=<timestamp>,v1=<signature>
        """
        try:
            logger.debug(f"Verifying webhook signature for timestamp {timestamp}")
            
            # Parse signature header
            parts = signature.split(',')
            ts_part = next((p for p in parts if p.startswith('t=')), None)
            v1_part = next((p for p in parts if p.startswith('v1=')), None)

            if not ts_part or not v1_part:
                logger.error(f"Invalid signature format: {signature}")
                return False

            received_ts = ts_part.split('=')[1]
            received_v1 = v1_part.split('=')[1]

            # Verify timestamp matches
            if received_ts != timestamp:
                logger.error(f"Timestamp mismatch: header={received_ts}, expected={timestamp}")
                return False

            # Reconstruct signed_content
            signed_content = f"{received_ts}.{payload_body.decode('utf-8')}"

            # Compute expected signature
            expected_signature = hmac.new(
                self.webhook_key.encode('utf-8'),
                signed_content.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            # Compare signatures
            is_valid = hmac.compare_digest(expected_signature, received_v1)
            
            if is_valid:
                logger.debug("Webhook signature verification successful")
            else:
                logger.error(f"Signature verification failed. Expected: {expected_signature}, Received: {received_v1}")
            
            return is_valid
            
        except Exception as e:
            logger.error(f"Signature verification failed with error: {e}")
            return False

    def is_timestamp_valid(self, timestamp: str, tolerance_seconds: int = 300) -> bool:
        """
        Check if timestamp is within tolerance (default 5 minutes)
        This prevents replay attacks
        """
        try:
            received_time = int(timestamp)
            current_time = int(time.time())
            time_diff = abs(current_time - received_time)
            
            is_valid = time_diff <= tolerance_seconds
            
            if not is_valid:
                logger.error(f"Timestamp too old: {time_diff}s ago (tolerance: {tolerance_seconds}s)")
            
            return is_valid
            
        except ValueError as e:
            logger.error(f"Invalid timestamp format: {timestamp}")
            return False

def create_webhook_validator():
    """Factory function to create webhook validator"""
    return WebhookValidator()