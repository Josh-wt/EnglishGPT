"""
Dodo Payments Client and Service Layer
Handles all interactions with Dodo Payments API
"""

import os
import httpx
import json
import hmac
import hashlib
import base64
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from fastapi import HTTPException
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DodoPaymentsConfig:
    """Configuration for Dodo Payments"""
    
    def __init__(self):
        self.api_key = os.environ.get('DODO_PAYMENTS_API_KEY')
        self.webhook_key = os.environ.get('DODO_PAYMENTS_WEBHOOK_KEY')
        self.environment = os.environ.get('DODO_PAYMENTS_ENVIRONMENT', 'live')
        self.base_url = os.environ.get('DODO_PAYMENTS_BASE_URL', 'https://api.dodopayments.com')
        self.monthly_product_id = os.environ.get('DODO_MONTHLY_PRODUCT_ID')
        self.yearly_product_id = os.environ.get('DODO_YEARLY_PRODUCT_ID')
        self.success_redirect_url = os.environ.get('SUCCESS_REDIRECT_URL')
        self.cancel_redirect_url = os.environ.get('CANCEL_REDIRECT_URL')
        self.webhook_endpoint_url = os.environ.get('WEBHOOK_ENDPOINT_URL')
        
        if not self.api_key:
            raise ValueError("DODO_PAYMENTS_API_KEY environment variable is required")
        if not self.webhook_key:
            raise ValueError("DODO_PAYMENTS_WEBHOOK_KEY environment variable is required")

# Pydantic models for API requests/responses
class SubscriptionPlan(BaseModel):
    plan_type: str = Field(..., description="'monthly' or 'yearly'")
    product_id: str
    name: str
    price_cents: int
    currency: str = "USD"

class CustomerCreateRequest(BaseModel):
    email: str
    name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CheckoutSessionRequest(BaseModel):
    customer_id: str
    product_id: str
    success_url: str
    cancel_url: str
    metadata: Optional[Dict[str, Any]] = None

class SubscriptionResponse(BaseModel):
    id: str
    customer_id: str
    product_id: str
    status: str
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class PaymentResponse(BaseModel):
    id: str
    subscription_id: Optional[str] = None
    amount_cents: int
    currency: str
    status: str
    payment_method_type: Optional[str] = None
    failure_reason: Optional[str] = None
    created_at: datetime

class DodoPaymentsClient:
    """Main client for interacting with Dodo Payments API"""
    
    def __init__(self, config: DodoPaymentsConfig):
        self.config = config
        self.client = httpx.AsyncClient(
            base_url=config.base_url,
            headers={
                "Authorization": f"Bearer {config.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "EEnglishGPT/1.0"
            },
            timeout=30.0
        )
        
        # Define subscription plans
        self.plans = {
            'monthly': SubscriptionPlan(
                plan_type='monthly',
                product_id=config.monthly_product_id,
                name='Unlimited Monthly',
                price_cents=499,  # $4.99
                currency='USD'
            ),
            'yearly': SubscriptionPlan(
                plan_type='yearly',
                product_id=config.yearly_product_id,
                name='Unlimited Yearly',
                price_cents=4900,  # $49.00
                currency='USD'
            )
        }
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def get_plan(self, plan_type: str) -> SubscriptionPlan:
        """Get subscription plan details"""
        if plan_type not in self.plans:
            raise ValueError(f"Invalid plan type: {plan_type}")
        return self.plans[plan_type]
    
    async def create_customer(self, email: str, name: Optional[str] = None, 
                            metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a new customer in Dodo Payments"""
        try:
            payload = {
                "email": email,
                "name": name or email.split('@')[0],
                "metadata": metadata or {}
            }
            
            response = await self.client.post("/customers", json=payload)
            response.raise_for_status()
            
            customer_data = response.json()
            logger.info(f"Created Dodo customer: {customer_data.get('id')} for {email}")
            return customer_data
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to create customer: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create customer: {str(e)}")
    
    async def get_customer(self, customer_id: str) -> Dict[str, Any]:
        """Get customer details from Dodo Payments"""
        try:
            response = await self.client.get(f"/customers/{customer_id}")
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to get customer {customer_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get customer: {str(e)}")
    
    async def create_checkout_session(self, customer_id: str, plan_type: str, 
                                    metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a checkout session for subscription"""
        try:
            plan = self.get_plan(plan_type)
            
            payload = {
                "customer_id": customer_id,
                "product_id": plan.product_id,
                "success_url": self.config.success_redirect_url,
                "cancel_url": self.config.cancel_redirect_url,
                "metadata": {
                    "plan_type": plan_type,
                    "user_source": "englishgpt",
                    **(metadata or {})
                }
            }
            
            response = await self.client.post("/checkout/sessions", json=payload)
            response.raise_for_status()
            
            session_data = response.json()
            logger.info(f"Created checkout session: {session_data.get('id')} for customer {customer_id}")
            return session_data
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to create checkout session: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")
    
    async def get_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """Get subscription details"""
        try:
            response = await self.client.get(f"/subscriptions/{subscription_id}")
            response.raise_for_status()
            
            data = response.json()
            return SubscriptionResponse(**data)
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to get subscription {subscription_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get subscription: {str(e)}")
    
    async def cancel_subscription(self, subscription_id: str, 
                                cancel_at_period_end: bool = True) -> Dict[str, Any]:
        """Cancel a subscription"""
        try:
            payload = {
                "cancel_at_period_end": cancel_at_period_end
            }
            
            response = await self.client.post(f"/subscriptions/{subscription_id}/cancel", json=payload)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Cancelled subscription {subscription_id}, at_period_end: {cancel_at_period_end}")
            return result
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to cancel subscription {subscription_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to cancel subscription: {str(e)}")
    
    async def reactivate_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Reactivate a cancelled subscription"""
        try:
            response = await self.client.post(f"/subscriptions/{subscription_id}/reactivate")
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Reactivated subscription {subscription_id}")
            return result
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to reactivate subscription {subscription_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to reactivate subscription: {str(e)}")
    
    async def create_customer_portal_session(self, customer_id: str) -> Dict[str, Any]:
        """Create a customer portal session for managing payment methods"""
        try:
            payload = {
                "customer_id": customer_id,
                "return_url": self.config.success_redirect_url
            }
            
            response = await self.client.post("/customer-portal/sessions", json=payload)
            response.raise_for_status()
            
            session_data = response.json()
            logger.info(f"Created customer portal session for {customer_id}")
            return session_data
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to create customer portal session: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create customer portal session: {str(e)}")
    
    async def list_customer_subscriptions(self, customer_id: str) -> List[SubscriptionResponse]:
        """List all subscriptions for a customer"""
        try:
            response = await self.client.get(f"/customers/{customer_id}/subscriptions")
            response.raise_for_status()
            
            data = response.json()
            subscriptions = [SubscriptionResponse(**sub) for sub in data.get('data', [])]
            return subscriptions
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to list subscriptions for customer {customer_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to list subscriptions: {str(e)}")
    
    async def list_customer_payments(self, customer_id: str, limit: int = 50) -> List[PaymentResponse]:
        """List payments for a customer"""
        try:
            params = {"customer_id": customer_id, "limit": limit}
            response = await self.client.get("/payments", params=params)
            response.raise_for_status()
            
            data = response.json()
            payments = [PaymentResponse(**payment) for payment in data.get('data', [])]
            return payments
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to list payments for customer {customer_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to list payments: {str(e)}")

class WebhookValidator:
    """Validates Dodo Payments webhook signatures"""
    
    def __init__(self, webhook_key: str):
        self.webhook_key = webhook_key
    
    def verify_signature(self, payload: bytes, signature: str, timestamp: str) -> bool:
        """Verify webhook signature using HMAC-SHA256"""
        try:
            # Remove 'whsec_' prefix if present
            if signature.startswith('whsec_'):
                signature = signature[6:]
            
            # Create the signed payload
            signed_payload = f"{timestamp}.{payload.decode('utf-8')}"
            
            # Calculate expected signature
            expected_signature = hmac.new(
                self.webhook_key.encode('utf-8'),
                signed_payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures
            return hmac.compare_digest(expected_signature, signature)
            
        except Exception as e:
            logger.error(f"Webhook signature verification failed: {e}")
            return False
    
    def is_timestamp_valid(self, timestamp: str, tolerance_seconds: int = 300) -> bool:
        """Check if webhook timestamp is within tolerance (default 5 minutes)"""
        try:
            webhook_time = datetime.fromtimestamp(int(timestamp), tz=timezone.utc)
            current_time = datetime.now(timezone.utc)
            time_diff = abs((current_time - webhook_time).total_seconds())
            return time_diff <= tolerance_seconds
            
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid webhook timestamp: {e}")
            return False

# Factory function to create configured client
async def create_dodo_client() -> DodoPaymentsClient:
    """Create a configured Dodo Payments client"""
    config = DodoPaymentsConfig()
    return DodoPaymentsClient(config)

# Webhook validator factory
def create_webhook_validator() -> WebhookValidator:
    """Create a webhook validator with configured key"""
    webhook_key = os.environ.get('DODO_PAYMENTS_WEBHOOK_KEY')
    if not webhook_key:
        raise ValueError("DODO_PAYMENTS_WEBHOOK_KEY environment variable is required")
    return WebhookValidator(webhook_key)
