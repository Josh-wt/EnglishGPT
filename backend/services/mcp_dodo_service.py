"""
MCP Dodo Payments Service
This service uses MCP tools to interact with Dodo Payments API
"""

import json
import logging
import time
import traceback
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

# Set debug level for this module
logger.setLevel(logging.DEBUG)

class MCPDodoPaymentsService:
    """Service that simulates MCP tool calls for Dodo Payments"""
    
    def __init__(self):
        # In a real implementation, this would use actual MCP client
        self.mcp_client = None
        logger.info("MCP Dodo Payments Service initialized")

    async def _call_mcp_tool(self, tool_name: str, parameters: Dict) -> Dict:
        """Make actual MCP tool call with extensive debugging"""
        logger.debug(f"[MCP_DEBUG] Starting tool call: {tool_name}")
        logger.debug(f"[MCP_DEBUG] Parameters type: {type(parameters)}")
        logger.debug(f"[MCP_DEBUG] Parameters content: {json.dumps(parameters, indent=2, default=str)}")
        
        start_time = time.time()
        
        try:
            logger.debug(f"[MCP_DEBUG] Calling real MCP tool: {tool_name}")
            
            # NOTE: In the actual runtime environment, these MCP tools would be available
            # For now, we'll use the direct function calls that are available in this context
            
            if tool_name == "mcp_dodopayments_api_create_payments":
                logger.debug(f"[MCP_DEBUG] Creating payment via real MCP")
                # Use the actual MCP tool that's available in this environment
                result = await mcp_dodopayments_api_create_payments(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_create_subscriptions":
                logger.debug(f"[MCP_DEBUG] Creating subscription via real MCP")
                result = await mcp_dodopayments_api_create_subscriptions(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_list_payments":
                logger.debug(f"[MCP_DEBUG] Listing payments via real MCP")
                result = await mcp_dodopayments_api_list_payments(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_retrieve_payments":
                logger.debug(f"[MCP_DEBUG] Retrieving payment via real MCP")
                result = await mcp_dodopayments_api_retrieve_payments(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_create_customers":
                logger.debug(f"[MCP_DEBUG] Creating customer via real MCP")
                result = await mcp_dodopayments_api_create_customers(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_retrieve_customers":
                logger.debug(f"[MCP_DEBUG] Retrieving customer via real MCP")
                result = await mcp_dodopayments_api_retrieve_customers(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_update_customers":
                logger.debug(f"[MCP_DEBUG] Updating customer via real MCP")
                result = await mcp_dodopayments_api_update_customers(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_list_subscriptions":
                logger.debug(f"[MCP_DEBUG] Listing subscriptions via real MCP")
                result = await mcp_dodopayments_api_list_subscriptions(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_retrieve_subscriptions":
                logger.debug(f"[MCP_DEBUG] Retrieving subscription via real MCP")
                result = await mcp_dodopayments_api_retrieve_subscriptions(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_update_subscriptions":
                logger.debug(f"[MCP_DEBUG] Updating subscription via real MCP")
                result = await mcp_dodopayments_api_update_subscriptions(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_create_discounts":
                logger.debug(f"[MCP_DEBUG] Creating discount via real MCP")
                result = await mcp_dodopayments_api_create_discounts(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_retrieve_discounts":
                logger.debug(f"[MCP_DEBUG] Retrieving discount via real MCP")
                result = await mcp_dodopayments_api_retrieve_discounts(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_create_webhooks":
                logger.debug(f"[MCP_DEBUG] Creating webhook via real MCP")
                result = await mcp_dodopayments_api_create_webhooks(**parameters)
                
            elif tool_name == "mcp_dodopayments_api_list_webhooks":
                logger.debug(f"[MCP_DEBUG] Listing webhooks via real MCP")
                result = await mcp_dodopayments_api_list_webhooks(**parameters)
                
            else:
                logger.error(f"[MCP_ERROR] Unknown MCP tool requested: {tool_name}")
                logger.error(f"[MCP_ERROR] Available tools: create_payments, create_subscriptions, list_payments, etc.")
                raise ValueError(f"Unknown MCP tool: {tool_name}")
            
            execution_time = time.time() - start_time
            logger.debug(f"[MCP_DEBUG] Tool execution completed in {execution_time:.3f}s")
            logger.debug(f"[MCP_DEBUG] Result type: {type(result)}")
            logger.debug(f"[MCP_DEBUG] Result content: {json.dumps(result, indent=2, default=str)}")
            
            return result
            
        except NameError as e:
            execution_time = time.time() - start_time
            logger.error(f"[MCP_ERROR] MCP tool not available after {execution_time:.3f}s")
            logger.error(f"[MCP_ERROR] Tool {tool_name} not available in runtime: {e}")
            logger.error(f"[MCP_ERROR] This indicates MCP tools are not properly loaded")
            raise Exception(f"MCP tool {tool_name} not available in runtime environment")
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"[MCP_ERROR] Execution failed after {execution_time:.3f}s")
            logger.error(f"[MCP_ERROR] Tool {tool_name} execution error: {e}")
            logger.error(f"[MCP_ERROR] Error type: {type(e)}")
            logger.error(f"[MCP_ERROR] Error details: {str(e)}")
            logger.error(f"[MCP_ERROR] Parameters that caused error: {json.dumps(parameters, indent=2, default=str)}")
            raise

    # Payment Operations
    async def create_payment(self, payment_data: Dict) -> Dict:
        """Create a payment using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_create_payments", payment_data)

    async def retrieve_payment(self, payment_id: str) -> Dict:
        """Retrieve payment using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_retrieve_payments", {
            "payment_id": payment_id
        })

    async def list_payments(self, params: Dict = None) -> Dict:
        """List payments using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_list_payments", params or {})

    # Subscription Operations
    async def create_subscription(self, subscription_data: Dict) -> Dict:
        """Create subscription using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_create_subscriptions", subscription_data)

    async def retrieve_subscription(self, subscription_id: str) -> Dict:
        """Retrieve subscription using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_retrieve_subscriptions", {
            "subscription_id": subscription_id
        })

    async def list_subscriptions(self, params: Dict = None) -> Dict:
        """List subscriptions using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_list_subscriptions", params or {})

    # Customer Operations
    async def create_customer(self, customer_data: Dict) -> Dict:
        """Create customer using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_create_customers", customer_data)

    async def retrieve_customer(self, customer_id: str) -> Dict:
        """Retrieve customer using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_retrieve_customers", {
            "customer_id": customer_id
        })

    async def list_customers(self, params: Dict = None) -> Dict:
        """List customers using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_list_customers", params or {})

    # Product Operations
    async def list_products(self, params: Dict = None) -> Dict:
        """List products using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_list_products", params or {})

    async def retrieve_product(self, product_id: str) -> Dict:
        """Retrieve product using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_retrieve_products", {
            "id": product_id
        })

    # Discount Operations
    async def create_discount(self, discount_data: Dict) -> Dict:
        """Create discount using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_create_discounts", discount_data)

    async def list_discounts(self, params: Dict = None) -> Dict:
        """List discounts using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_list_discounts", params or {})

    async def delete_discount(self, discount_id: str) -> None:
        """Delete discount using MCP"""
        await self._call_mcp_tool("mcp_dodopayments_api_delete_discounts", {
            "discount_id": discount_id
        })

    # Webhook Operations
    async def create_webhook(self, webhook_data: Dict) -> Dict:
        """Create webhook using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_create_webhooks", webhook_data)

    async def list_webhooks(self, params: Dict = None) -> Dict:
        """List webhooks using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_list_webhooks", params or {})

    async def delete_webhook(self, webhook_id: str) -> None:
        """Delete webhook using MCP"""
        await self._call_mcp_tool("mcp_dodopayments_api_delete_webhooks", {
            "webhook_id": webhook_id
        })

    # License Operations
    async def activate_license(self, license_key: str, name: str) -> Dict:
        """Activate license using MCP"""
        return await self._call_mcp_tool("mcp_dodopayments_api_activate_licenses", {
            "license_key": license_key,
            "name": name
        })

    async def validate_license(self, license_key: str, instance_id: str = None) -> Dict:
        """Validate license using MCP"""
        params = {"license_key": license_key}
        if instance_id:
            params["license_key_instance_id"] = instance_id
        return await self._call_mcp_tool("mcp_dodopayments_api_validate_licenses", params)

# Create singleton instance
mcp_dodo_service = MCPDodoPaymentsService()
