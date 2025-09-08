"""
Dodo Payments Service for EnglishGPT
"""

import httpx
import logging
from typing import Dict, Optional
from config.settings import DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_BASE_URL

logger = logging.getLogger(__name__)

class DodoPaymentsService:
    def __init__(self):
        self.api_key = DODO_PAYMENTS_API_KEY
        # Use the base URL with /api path for Dodo Payments API
        self.base_url = f"{DODO_PAYMENTS_BASE_URL}/api"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        logger.info(f"DodoPaymentsService initialized with base_url: {self.base_url}")

    async def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        """Make API request to Dodo Payments"""
        if not self.api_key:
            raise ValueError("Dodo Payments API key not configured")
            
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    json=data,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Dodo API error: {e}")
            raise

    async def create_payment(self, payment_data: Dict) -> Dict:
        return await self._request("POST", "/payments", payment_data)

    async def create_subscription(self, subscription_data: Dict) -> Dict:
        return await self._request("POST", "/subscriptions", subscription_data)

    async def create_customer(self, customer_data: Dict) -> Dict:
        return await self._request("POST", "/customers", customer_data)

    async def list_payments(self, params: Dict = None) -> Dict:
        return await self._request("GET", "/payments")

    async def list_subscriptions(self, params: Dict = None) -> Dict:
        return await self._request("GET", "/subscriptions")

    async def get_subscription(self, subscription_id: str) -> Dict:
        return await self._request("GET", f"/subscriptions/{subscription_id}")

    async def update_subscription(self, subscription_id: str, update_data: Dict) -> Dict:
        return await self._request("PATCH", f"/subscriptions/{subscription_id}", update_data)

    async def list_products(self, params: Dict = None) -> Dict:
        return await self._request("GET", "/products")

    async def create_discount(self, discount_data: Dict) -> Dict:
        return await self._request("POST", "/discounts", discount_data)

    async def list_discounts(self, params: Dict = None) -> Dict:
        return await self._request("GET", "/discounts")

    async def create_webhook(self, webhook_data: Dict) -> Dict:
        return await self._request("POST", "/webhooks", webhook_data)

    async def list_webhooks(self, params: Dict = None) -> Dict:
        return await self._request("GET", "/webhooks")

dodo_service = DodoPaymentsService()
