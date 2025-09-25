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
        # Use the correct API base URL - test.dodopayments.com is the correct domain
        self.base_url = DODO_PAYMENTS_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        logger.info(f"DodoPaymentsService initialized with base_url: {self.base_url}")

    async def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        """Make API request to Dodo Payments"""
        if not self.api_key:
            logger.error("[DODO_SERVICE] API key not configured!")
            raise ValueError("Dodo Payments API key not configured")
            
        url = f"{self.base_url}{endpoint}"
        
        # Extensive debugging
        logger.info(f"[DODO_SERVICE] 🚀 Making API request:")
        logger.info(f"[DODO_SERVICE] Method: {method}")
        logger.info(f"[DODO_SERVICE] Endpoint: {endpoint}")
        logger.info(f"[DODO_SERVICE] Full URL: {url}")
        logger.info(f"[DODO_SERVICE] Base URL: {self.base_url}")
        logger.info(f"[DODO_SERVICE] Headers: {self.headers}")
        logger.info(f"[DODO_SERVICE] Data: {data}")
        
        try:
            async with httpx.AsyncClient() as client:
                logger.info(f"[DODO_SERVICE] 📡 Sending request to {url}")
                response = await client.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    json=data,
                    timeout=30.0
                )
                
                logger.info(f"[DODO_SERVICE] 📥 Response received:")
                logger.info(f"[DODO_SERVICE] Status Code: {response.status_code}")
                logger.info(f"[DODO_SERVICE] Response Headers: {dict(response.headers)}")
                logger.info(f"[DODO_SERVICE] Response Text: {response.text[:1000]}...")
                
                response.raise_for_status()
                result = response.json()
                logger.info(f"[DODO_SERVICE] ✅ Success! Response: {result}")
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"[DODO_SERVICE] ❌ HTTP Status Error:")
            logger.error(f"[DODO_SERVICE] Status Code: {e.response.status_code}")
            logger.error(f"[DODO_SERVICE] Response Text: {e.response.text}")
            logger.error(f"[DODO_SERVICE] Request URL: {e.request.url}")
            logger.error(f"[DODO_SERVICE] Request Method: {e.request.method}")
            raise
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            logger.error(f"[DODO_SERVICE] ❌ Connection/Timeout Error: {e}")
            logger.error(f"[DODO_SERVICE] URL that failed: {url}")
            raise
        except Exception as e:
            logger.error(f"[DODO_SERVICE] ❌ General Error: {e}")
            logger.error(f"[DODO_SERVICE] Error Type: {type(e)}")
            logger.error(f"[DODO_SERVICE] URL that failed: {url}")
            raise

    async def create_payment(self, payment_data: Dict) -> Dict:
        # Use the new Checkout Session API instead of direct payments
        return await self._request("POST", "/checkouts", payment_data)

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
