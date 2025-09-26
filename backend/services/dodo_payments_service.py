"""
Dodo Payments integration service for subscription and payment management.
"""

import os
import logging
import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import hmac
import hashlib
import json

logger = logging.getLogger(__name__)


class DodoPaymentsService:
    """Service for integrating with Dodo Payments API."""

    def __init__(self, api_key: str, environment: str = 'production', base_url: str = None):
        """
        Initialize Dodo Payments service.
        
        Args:
            api_key: Dodo Payments API key
            environment: Environment (production/sandbox)
            base_url: Base URL for Dodo Payments API
        """
        self.api_key = api_key
        self.environment = environment
        self.base_url = base_url or 'https://api.dodopayments.com'
        
        # HTTP client configuration
        self.client = httpx.AsyncClient(
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'User-Agent': 'EEnglishGPT/1.0'
            },
            timeout=30.0
        )
        
        logger.info(f"Dodo Payments service initialized for {environment} environment")

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    # Product Management
    async def create_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new product in Dodo Payments."""
        try:
            response = await self.client.post(f"{self.base_url}/products", json=product_data)
            response.raise_for_status()
            logger.info(f"Created product: {response.json().get('id')}")
            return response.json()
        except Exception as e:
            logger.error(f"Failed to create product: {e}")
            raise

    async def get_product(self, product_id: str) -> Dict[str, Any]:
        """Get product details by ID."""
        try:
            response = await self.client.get(f"{self.base_url}/products/{product_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get product {product_id}: {e}")
            raise

    async def list_products(self, page_size: int = 10, page_number: int = 0) -> Dict[str, Any]:
        """List all products."""
        try:
            params = {'page_size': page_size, 'page_number': page_number}
            response = await self.client.get(f"{self.base_url}/products", params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to list products: {e}")
            raise

    # Customer Management
    async def create_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new customer."""
        try:
            response = await self.client.post(f"{self.base_url}/customers", json=customer_data)
            response.raise_for_status()
            logger.info(f"Created customer: {response.json().get('customer_id')}")
            return response.json()
        except Exception as e:
            logger.error(f"Failed to create customer: {e}")
            raise

    async def get_customer(self, customer_id: str) -> Dict[str, Any]:
        """Get customer details by ID."""
        try:
            response = await self.client.get(f"{self.base_url}/customers/{customer_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get customer {customer_id}: {e}")
            raise

    async def update_customer(self, customer_id: str, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update customer information."""
        try:
            response = await self.client.patch(f"{self.base_url}/customers/{customer_id}", json=customer_data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to update customer {customer_id}: {e}")
            raise

    # Payment Management
    async def create_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new payment."""
        try:
            response = await self.client.post(f"{self.base_url}/payments", json=payment_data)
            response.raise_for_status()
            logger.info(f"Created payment: {response.json().get('payment_id')}")
            return response.json()
        except Exception as e:
            logger.error(f"Failed to create payment: {e}")
            raise

    async def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """Get payment details by ID."""
        try:
            response = await self.client.get(f"{self.base_url}/payments/{payment_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get payment {payment_id}: {e}")
            raise

    async def list_payments(self, customer_id: str = None, status: str = None, 
                          page_size: int = 10, page_number: int = 0) -> Dict[str, Any]:
        """List payments with optional filtering."""
        try:
            params = {'page_size': page_size, 'page_number': page_number}
            if customer_id:
                params['customer_id'] = customer_id
            if status:
                params['status'] = status
                
            response = await self.client.get(f"{self.base_url}/payments", params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to list payments: {e}")
            raise

    # Subscription Management
    async def create_subscription(self, subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new subscription."""
        try:
            response = await self.client.post(f"{self.base_url}/subscriptions", json=subscription_data)
            response.raise_for_status()
            logger.info(f"Created subscription: {response.json().get('subscription_id')}")
            return response.json()
        except Exception as e:
            logger.error(f"Failed to create subscription: {e}")
            raise

    async def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Get subscription details by ID."""
        try:
            response = await self.client.get(f"{self.base_url}/subscriptions/{subscription_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get subscription {subscription_id}: {e}")
            raise

    async def update_subscription(self, subscription_id: str, subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update subscription details."""
        try:
            response = await self.client.patch(f"{self.base_url}/subscriptions/{subscription_id}", json=subscription_data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to update subscription {subscription_id}: {e}")
            raise

    async def cancel_subscription(self, subscription_id: str, cancel_at_next_billing: bool = True) -> Dict[str, Any]:
        """Cancel a subscription."""
        try:
            data = {'cancel_at_next_billing_date': cancel_at_next_billing}
            response = await self.client.patch(f"{self.base_url}/subscriptions/{subscription_id}", json=data)
            response.raise_for_status()
            logger.info(f"Cancelled subscription: {subscription_id}")
            return response.json()
        except Exception as e:
            logger.error(f"Failed to cancel subscription {subscription_id}: {e}")
            raise

    async def change_subscription_plan(self, subscription_id: str, new_product_id: str, 
                                     quantity: int = 1, proration_mode: str = "prorated_immediately") -> Dict[str, Any]:
        """Change subscription plan."""
        try:
            data = {
                'product_id': new_product_id,
                'quantity': quantity,
                'proration_billing_mode': proration_mode
            }
            response = await self.client.post(f"{self.base_url}/subscriptions/{subscription_id}/change-plan", json=data)
            response.raise_for_status()
            logger.info(f"Changed plan for subscription: {subscription_id}")
            return response.json()
        except Exception as e:
            logger.error(f"Failed to change plan for subscription {subscription_id}: {e}")
            raise

    # Discount Management
    async def create_discount(self, discount_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new discount code."""
        try:
            response = await self.client.post(f"{self.base_url}/discounts", json=discount_data)
            response.raise_for_status()
            logger.info(f"Created discount: {response.json().get('code')}")
            return response.json()
        except Exception as e:
            logger.error(f"Failed to create discount: {e}")
            raise

    async def get_discount(self, discount_id: str) -> Dict[str, Any]:
        """Get discount details by ID."""
        try:
            response = await self.client.get(f"{self.base_url}/discounts/{discount_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get discount {discount_id}: {e}")
            raise

    async def list_discounts(self, page_size: int = 10, page_number: int = 0) -> Dict[str, Any]:
        """List all discount codes."""
        try:
            params = {'page_size': page_size, 'page_number': page_number}
            response = await self.client.get(f"{self.base_url}/discounts", params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to list discounts: {e}")
            raise

    # License Management
    async def get_license_key(self, license_key_id: str) -> Dict[str, Any]:
        """Get license key details."""
        try:
            response = await self.client.get(f"{self.base_url}/license-keys/{license_key_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get license key {license_key_id}: {e}")
            raise

    async def activate_license(self, license_key: str, name: str) -> Dict[str, Any]:
        """Activate a license key."""
        try:
            data = {'license_key': license_key, 'name': name}
            response = await self.client.post(f"{self.base_url}/licenses/activate", json=data)
            response.raise_for_status()
            logger.info(f"Activated license: {license_key}")
            return response.json()
        except Exception as e:
            logger.error(f"Failed to activate license {license_key}: {e}")
            raise

    async def validate_license(self, license_key: str, instance_id: str = None) -> Dict[str, Any]:
        """Validate a license key."""
        try:
            params = {'license_key': license_key}
            if instance_id:
                params['license_key_instance_id'] = instance_id
                
            response = await self.client.get(f"{self.base_url}/licenses/validate", params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to validate license {license_key}: {e}")
            raise

    # Webhook Management
    async def create_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new webhook endpoint."""
        try:
            response = await self.client.post(f"{self.base_url}/webhooks", json=webhook_data)
            response.raise_for_status()
            logger.info(f"Created webhook: {response.json().get('id')}")
            return response.json()
        except Exception as e:
            logger.error(f"Failed to create webhook: {e}")
            raise

    async def list_webhooks(self, limit: int = 10) -> Dict[str, Any]:
        """List all webhook endpoints."""
        try:
            params = {'limit': limit}
            response = await self.client.get(f"{self.base_url}/webhooks", params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to list webhooks: {e}")
            raise

    # Utility Methods
    def verify_webhook_signature(self, payload: str, signature: str, webhook_secret: str) -> bool:
        """Verify webhook signature for security."""
        try:
            expected_signature = hmac.new(
                webhook_secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures safely
            return hmac.compare_digest(signature, expected_signature)
        except Exception as e:
            logger.error(f"Failed to verify webhook signature: {e}")
            return False

    def create_checkout_url(self, payment_id: str) -> str:
        """Create checkout URL for a payment."""
        return f"{self.base_url}/checkout/{payment_id}"

    async def handle_webhook_event(self, event_type: str, event_data: Dict[str, Any]) -> bool:
        """Handle incoming webhook events."""
        try:
            logger.info(f"Processing webhook event: {event_type}")
            
            # Process different event types
            if event_type == 'payment.succeeded':
                await self._handle_payment_succeeded(event_data)
            elif event_type == 'payment.failed':
                await self._handle_payment_failed(event_data)
            elif event_type == 'subscription.active':
                await self._handle_subscription_active(event_data)
            elif event_type == 'subscription.cancelled':
                await self._handle_subscription_cancelled(event_data)
            elif event_type == 'subscription.renewed':
                await self._handle_subscription_renewed(event_data)
            elif event_type == 'license_key.created':
                await self._handle_license_created(event_data)
            else:
                logger.warning(f"Unhandled webhook event type: {event_type}")
                
            return True
        except Exception as e:
            logger.error(f"Failed to handle webhook event {event_type}: {e}")
            return False

    async def _handle_payment_succeeded(self, event_data: Dict[str, Any]):
        """Handle successful payment event."""
        payment = event_data.get('data', {})
        customer = payment.get('customer', {})
        
        logger.info(f"Payment succeeded for customer {customer.get('customer_id')}: {payment.get('payment_id')}")
        # Add your business logic here

    async def _handle_payment_failed(self, event_data: Dict[str, Any]):
        """Handle failed payment event."""
        payment = event_data.get('data', {})
        customer = payment.get('customer', {})
        
        logger.warning(f"Payment failed for customer {customer.get('customer_id')}: {payment.get('payment_id')}")
        # Add your business logic here

    async def _handle_subscription_active(self, event_data: Dict[str, Any]):
        """Handle active subscription event."""
        subscription = event_data.get('data', {})
        customer = subscription.get('customer', {})
        
        logger.info(f"Subscription activated for customer {customer.get('customer_id')}: {subscription.get('subscription_id')}")
        # Add your business logic here

    async def _handle_subscription_cancelled(self, event_data: Dict[str, Any]):
        """Handle cancelled subscription event."""
        subscription = event_data.get('data', {})
        customer = subscription.get('customer', {})
        
        logger.info(f"Subscription cancelled for customer {customer.get('customer_id')}: {subscription.get('subscription_id')}")
        # Add your business logic here

    async def _handle_subscription_renewed(self, event_data: Dict[str, Any]):
        """Handle subscription renewal event."""
        subscription = event_data.get('data', {})
        customer = subscription.get('customer', {})
        
        logger.info(f"Subscription renewed for customer {customer.get('customer_id')}: {subscription.get('subscription_id')}")
        # Add your business logic here

    async def _handle_license_created(self, event_data: Dict[str, Any]):
        """Handle license key creation event."""
        license_data = event_data.get('data', {})
        
        logger.info(f"License key created: {license_data.get('id')}")
        # Add your business logic here


# Factory function for creating the service
def create_dodo_payments_service(api_key: str = None, environment: str = None, base_url: str = None) -> DodoPaymentsService:
    """
    Factory function to create a DodoPaymentsService instance.
    
    Args:
        api_key: Dodo Payments API key (defaults to environment variable)
        environment: Environment (defaults to environment variable)
        base_url: Base URL (defaults to environment variable)
    
    Returns:
        DodoPaymentsService instance
    """
    from config.settings import DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_ENVIRONMENT, DODO_PAYMENTS_BASE_URL
    
    return DodoPaymentsService(
        api_key=api_key or DODO_PAYMENTS_API_KEY,
        environment=environment or DODO_PAYMENTS_ENVIRONMENT,
        base_url=base_url or DODO_PAYMENTS_BASE_URL
    )
