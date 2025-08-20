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
        self.base_url = os.environ.get('DODO_PAYMENTS_BASE_URL', 'https://api.dodopayments.com')
        self.environment = os.environ.get('DODO_PAYMENTS_ENVIRONMENT', 'live')

        if not self.api_key:
            raise ValueError("DODO_PAYMENTS_API_KEY environment variable not set.")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.client = httpx.AsyncClient(base_url=self.base_url)

    async def create_checkout_session(self, product_id: str, customer_id: str = None, customer_email: str = None, customer_name: str = None, return_url: str = None, metadata: dict = None):
        """Create a subscription checkout session according to Dodo Payments API"""
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
        
        logger.info(f"Creating Dodo subscription checkout with payload: {payload}")
        response = await self.client.post("/subscriptions", json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

    async def get_subscription(self, subscription_id: str):
        response = await self.client.get(f"/subscriptions/{subscription_id}")
        response.raise_for_status()
        return response.json()

    async def cancel_subscription(self, subscription_id: str, cancel_at_period_end: bool = True):
        payload = {"cancel_at_period_end": cancel_at_period_end}
        response = await self.client.patch(f"/subscriptions/{subscription_id}", json=payload)
        response.raise_for_status()
        return response.json()

    async def reactivate_subscription(self, subscription_id: str):
        # DodoPayments API doesn't have a direct 'reactivate' endpoint.
        # This would typically involve changing the plan back or updating status.
        # For now, we'll assume a PATCH to set status to active if supported, or re-creating.
        # Based on docs, 'change-plan' is used for upgrades/downgrades.
        # For reactivation, we might need to update the subscription to a new active plan.
        # This is a placeholder, actual implementation depends on Dodo's API for reactivation.
        # For now, let's assume we change plan to the same product_id to reactivate.
        # This might require knowing the original product_id.
        # A more robust solution would involve fetching the subscription details first.
        logger.warning(f"Reactivation logic for subscription {subscription_id} is a placeholder. Check DodoPayments API for exact method.")
        # Example: Fetch subscription to get product_id, then call change-plan
        # sub_details = await self.get_subscription(subscription_id)
        # product_id = sub_details['product_id']
        # payload = {"product_id": product_id, "proration_mode": "full_immediately"}
        # response = await self.client.post(f"/subscriptions/{subscription_id}/change-plan", json=payload)
        # response.raise_for_status()
        # return response.json()
        return {"message": "Reactivation logic needs to be implemented based on DodoPayments API."}

    async def create_customer_portal_session(self, customer_id: str):
        payload = {"customer_id": customer_id}
        response = await self.client.post("/customers/customer-portal/session", json=payload)
        response.raise_for_status()
        return response.json()

    async def list_payments(self, customer_id: str, limit: int = 50):
        response = await self.client.get(f"/payments?customer_id={customer_id}&limit={limit}")
        response.raise_for_status()
        return response.json()

    async def list_subscriptions(self, customer_id: str, limit: int = 50):
        response = await self.client.get(f"/subscriptions?customer_id={customer_id}&limit={limit}")
        response.raise_for_status()
        return response.json()

    async def get_customer(self, customer_id: str):
        response = await self.client.get(f"/customers/{customer_id}")
        response.raise_for_status()
        return response.json()

    async def create_customer(self, email: str, name: str, metadata: dict = None):
        payload = {"email": email, "name": name}
        if metadata:
            payload["metadata"] = metadata
        
        # DEBUG CODE:
        print(f"🔧 DODO DEBUG: API Key being used: {self.api_key[:10]}...")
        print(f"🔧 DODO DEBUG: Base URL: {self.base_url}")
        print(f"🔧 DODO DEBUG: Headers: {self.headers}")
        print(f"🔧 DODO DEBUG: Payload: {payload}")
        
        response = await self.client.post("/customers", json=payload, headers=self.headers)
        
        # DEBUG CODE:
        print(f"🔧 DODO DEBUG: Response status: {response.status_code}")
        print(f"🔧 DODO DEBUG: Response headers: {dict(response.headers)}")
        print(f"🔧 DODO DEBUG: Response text: {response.text}")
        
        response.raise_for_status()
        return response.json()

    async def close(self):
        await self.client.aclose()

class WebhookValidator:
    def __init__(self):
        self.webhook_key = os.environ.get('DODO_PAYMENTS_WEBHOOK_KEY')
        if not self.webhook_key:
            raise ValueError("DODO_PAYMENTS_WEBHOOK_KEY environment variable not set.")

    def verify_signature(self, payload_body: bytes, signature: str, timestamp: str) -> bool:
        # Standard Webhooks signature verification
        # Format: t=<timestamp>,v1=<signature>
        try:
            parts = signature.split(',')
            ts_part = next((p for p in parts if p.startswith('t=')), None)
            v1_part = next((p for p in parts if p.startswith('v1=')), None)

            if not ts_part or not v1_part:
                return False

            received_ts = ts_part.split('=')[1]
            received_v1 = v1_part.split('=')[1]

            # Reconstruct signed_content
            signed_content = f"{received_ts}.{payload_body.decode('utf-8')}"

            # Compute expected signature
            expected_signature = hmac.new(
                self.webhook_key.encode('utf-8'),
                signed_content.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(expected_signature, received_v1)
        except Exception as e:
            logger.error(f"Signature verification failed: {e}")
            return False

    def is_timestamp_valid(self, timestamp: str, tolerance_seconds: int = 300) -> bool:
        # Check if timestamp is within tolerance (e.g., 5 minutes)
        try:
            received_time = int(timestamp)
            current_time = int(time.time())
            return abs(current_time - received_time) <= tolerance_seconds
        except ValueError:
            return False

def create_webhook_validator():
    return WebhookValidator()