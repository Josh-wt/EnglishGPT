"""
Payment Routes for Dodo Payments Integration
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, List, Optional
import logging
import json
import traceback
from datetime import datetime

# Import services for Dodo Payments integration
from services.dodo_service import dodo_service
from services.mcp_dodo_service import MCPDodoPaymentsService

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = APIRouter(prefix="/api/payments", tags=["payments"])

# Initialize MCP Dodo Payments service
mcp_dodo_service = MCPDodoPaymentsService()

# Payment endpoints
@router.post("/payments")
async def create_payment(payment_data: Dict):
    """Create a new payment"""
    logger.debug(f"[PAYMENT_DEBUG] Received payment creation request")
    logger.debug(f"[PAYMENT_DEBUG] Payment data: {json.dumps(payment_data, indent=2, default=str)}")
    
    try:
        logger.debug(f"[PAYMENT_DEBUG] Calling dodo_service.create_payment")
        result = await dodo_service.create_payment(payment_data)
        logger.debug(f"[PAYMENT_DEBUG] Payment creation successful")
        logger.debug(f"[PAYMENT_DEBUG] Result: {json.dumps(result, indent=2, default=str)}")
        return result
    except Exception as e:
        logger.error(f"[PAYMENT_ERROR] Payment creation failed: {e}")
        logger.error(f"[PAYMENT_ERROR] Error type: {type(e)}")
        logger.error(f"[PAYMENT_ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/payments")
async def list_payments(
    page_number: int = 0,
    page_size: int = 10,
    status: Optional[str] = None,
    customer_id: Optional[str] = None
):
    """List payments with filters"""
    try:
        params = {
            "page_number": page_number,
            "page_size": page_size
        }
        if status:
            params["status"] = status
        if customer_id:
            params["customer_id"] = customer_id
            
        result = await dodo_service.list_payments(params)
        return result
    except Exception as e:
        logger.error(f"Failed to list payments: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/payments/{payment_id}")
async def get_payment(payment_id: str):
    """Retrieve specific payment"""
    try:
        # Simulate MCP call: mcp_dodopayments_api_retrieve_payments
        result = await dodo_service._request("GET", f"/payments/{payment_id}")
        return result
    except Exception as e:
        logger.error(f"Failed to retrieve payment: {e}")
        raise HTTPException(status_code=404, detail="Payment not found")

# Subscription endpoints
@router.post("/subscriptions")
async def create_subscription(subscription_data: Dict):
    """Create a new subscription with real Dodo Payments integration"""
    logger.debug(f"[SUBSCRIPTION_DEBUG] Received subscription creation request")
    logger.debug(f"[SUBSCRIPTION_DEBUG] Subscription data: {json.dumps(subscription_data, indent=2, default=str)}")
    
    try:
        from config.settings import (
            DODO_MONTHLY_PRODUCT_ID, 
            DODO_YEARLY_PRODUCT_ID,
            SUCCESS_REDIRECT_URL,
            CANCEL_REDIRECT_URL,
            WEBHOOK_ENDPOINT_URL
        )
        
        # Extract subscription details
        plan_type = subscription_data.get('plan_type', 'monthly')
        customer_info = subscription_data.get('customer', {})
        billing_info = subscription_data.get('billing', {})
        discount_code = subscription_data.get('discount_code')
        
        # Determine product ID based on plan
        if plan_type == 'yearly':
            product_id = DODO_YEARLY_PRODUCT_ID
        else:
            product_id = DODO_MONTHLY_PRODUCT_ID
            
        logger.debug(f"[SUBSCRIPTION_DEBUG] Using product_id: {product_id} for plan: {plan_type}")
        
        # Prepare subscription creation payload
        subscription_payload = {
            "product_id": product_id,
            "quantity": 1,
            "customer": customer_info,
            "billing": billing_info,
            "billing_currency": "USD",
            "payment_link": True,
            "return_url": SUCCESS_REDIRECT_URL,
            "show_saved_payment_methods": True
        }
        
        # Add discount code if provided
        if discount_code:
            logger.debug(f"[SUBSCRIPTION_DEBUG] Applying discount code: {discount_code}")
            subscription_payload["discount_code"] = discount_code
        
        logger.debug(f"[SUBSCRIPTION_DEBUG] Final subscription payload: {json.dumps(subscription_payload, indent=2, default=str)}")
        
        # Use Dodo service to create subscription
        result = await dodo_service.create_subscription(subscription_payload)
        
        logger.debug(f"[SUBSCRIPTION_DEBUG] Real subscription creation successful")
        logger.debug(f"[SUBSCRIPTION_DEBUG] Result: {json.dumps(result, indent=2, default=str)}")
        
        return result
        
    except Exception as e:
        logger.error(f"[SUBSCRIPTION_ERROR] Subscription creation failed: {e}")
        logger.error(f"[SUBSCRIPTION_ERROR] Error type: {type(e)}")
        logger.error(f"[SUBSCRIPTION_ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscriptions")
async def list_subscriptions(
    page_number: int = 0,
    page_size: int = 10,
    status: Optional[str] = None,
    customer_id: Optional[str] = None
):
    """List subscriptions with filters"""
    try:
        params = {
            "page_number": page_number,
            "page_size": page_size
        }
        if status:
            params["status"] = status
        if customer_id:
            params["customer_id"] = customer_id
            
        result = await dodo_service.list_subscriptions(params)
        return result
    except Exception as e:
        logger.error(f"Failed to list subscriptions: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscriptions/{subscription_id}")
async def get_subscription(subscription_id: str):
    """Retrieve specific subscription using real MCP"""
    logger.debug(f"[SUBSCRIPTION_DEBUG] Retrieving subscription: {subscription_id}")
    try:
        # Use real MCP tool to retrieve subscription
        result = await dodo_service.get_subscription(subscription_id)
        logger.debug(f"[SUBSCRIPTION_DEBUG] Subscription retrieval successful")
        return result
    except Exception as e:
        logger.error(f"[SUBSCRIPTION_ERROR] Failed to retrieve subscription: {e}")
        logger.error(f"[SUBSCRIPTION_ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=404, detail="Subscription not found")

@router.patch("/subscriptions/{subscription_id}")
async def update_subscription(subscription_id: str, update_data: Dict):
    """Update subscription (cancel, reactivate, etc.) using real MCP"""
    logger.debug(f"[SUBSCRIPTION_DEBUG] Updating subscription: {subscription_id}")
    logger.debug(f"[SUBSCRIPTION_DEBUG] Update data: {json.dumps(update_data, indent=2, default=str)}")
    
    try:
        # Use real MCP tool to update subscription
        result = await dodo_service.update_subscription(subscription_id, update_data)
        
        logger.debug(f"[SUBSCRIPTION_DEBUG] Subscription update successful")
        logger.debug(f"[SUBSCRIPTION_DEBUG] Result: {json.dumps(result, indent=2, default=str)}")
        
        return result
        
    except Exception as e:
        logger.error(f"[SUBSCRIPTION_ERROR] Subscription update failed: {e}")
        logger.error(f"[SUBSCRIPTION_ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

# Customer endpoints
@router.post("/customers")
async def create_customer(customer_data: Dict):
    """Create a new customer"""
    logger.debug(f"[CUSTOMER_DEBUG] Received customer creation request")
    logger.debug(f"[CUSTOMER_DEBUG] Customer data: {json.dumps(customer_data, indent=2, default=str)}")
    
    try:
        logger.debug(f"[CUSTOMER_DEBUG] Calling dodo_service.create_customer")
        result = await dodo_service.create_customer(customer_data)
        logger.debug(f"[CUSTOMER_DEBUG] Customer creation successful")
        logger.debug(f"[CUSTOMER_DEBUG] Result: {json.dumps(result, indent=2, default=str)}")
        return result
    except Exception as e:
        logger.error(f"[CUSTOMER_ERROR] Customer creation failed: {e}")
        logger.error(f"[CUSTOMER_ERROR] Error type: {type(e)}")
        logger.error(f"[CUSTOMER_ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/customers/{customer_id}")
async def get_customer(customer_id: str):
    """Get customer details"""
    logger.debug(f"[CUSTOMER_DEBUG] Retrieving customer: {customer_id}")
    try:
        result = await dodo_service.get_customer(customer_id)
        logger.debug(f"[CUSTOMER_DEBUG] Customer retrieval successful: {json.dumps(result, indent=2, default=str)}")
        return result
    except Exception as e:
        logger.error(f"[CUSTOMER_ERROR] Customer retrieval failed: {e}")
        logger.error(f"[CUSTOMER_ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=404, detail="Customer not found")

@router.patch("/customers/{customer_id}")
async def update_customer(customer_id: str, customer_data: Dict):
    """Update customer details"""
    logger.debug(f"[CUSTOMER_DEBUG] Updating customer: {customer_id}")
    logger.debug(f"[CUSTOMER_DEBUG] Update data: {json.dumps(customer_data, indent=2, default=str)}")
    try:
        result = await dodo_service.update_customer(customer_id, customer_data)
        logger.debug(f"[CUSTOMER_DEBUG] Customer update successful: {json.dumps(result, indent=2, default=str)}")
        return result
    except Exception as e:
        logger.error(f"[CUSTOMER_ERROR] Customer update failed: {e}")
        logger.error(f"[CUSTOMER_ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/customers")
async def list_customers(
    page_number: int = 0,
    page_size: int = 10,
    email: Optional[str] = None
):
    """List customers"""
    try:
        params = {
            "page_number": page_number,
            "page_size": page_size
        }
        if email:
            params["email"] = email
            
        result = await dodo_service._request("GET", "/customers", params)
        return result
    except Exception as e:
        logger.error(f"Failed to list customers: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Product endpoints
@router.get("/products")
async def list_products(
    page_number: int = 0,
    page_size: int = 10,
    recurring: Optional[bool] = None
):
    """List products"""
    try:
        params = {
            "page_number": page_number,
            "page_size": page_size
        }
        if recurring is not None:
            params["recurring"] = recurring
            
        result = await dodo_service.list_products(params)
        return result
    except Exception as e:
        logger.error(f"Failed to list products: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Discount endpoints
@router.post("/discounts")
async def create_discount(discount_data: Dict):
    """Create a discount code"""
    try:
        result = await dodo_service.create_discount(discount_data)
        return result
    except Exception as e:
        logger.error(f"Discount creation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/discounts")
async def list_discounts(
    page_number: int = 0,
    page_size: int = 10
):
    """List discount codes"""
    try:
        params = {
            "page_number": page_number,
            "page_size": page_size
        }
        result = await dodo_service.list_discounts(params)
        return result
    except Exception as e:
        logger.error(f"Failed to list discounts: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/discounts/{discount_id}")
async def delete_discount(discount_id: str):
    """Delete a discount code"""
    try:
        await dodo_service._request("DELETE", f"/discounts/{discount_id}")
        return {"message": "Discount deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete discount: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/discounts/validate")
async def validate_discount_code(validation_data: Dict):
    """Validate a discount code for real-time application"""
    logger.debug(f"[DISCOUNT_DEBUG] Validating discount code")
    logger.debug(f"[DISCOUNT_DEBUG] Validation data: {json.dumps(validation_data, indent=2, default=str)}")
    
    try:
        discount_code = validation_data.get('code', '').upper().strip()
        plan_type = validation_data.get('plan_type', 'monthly')
        
        if not discount_code:
            raise HTTPException(status_code=400, detail="Discount code is required")
        
        logger.debug(f"[DISCOUNT_DEBUG] Looking up discount code: {discount_code}")
        
        # Get all discounts and find the matching code
        discounts_response = await dodo_service.list_discounts({"page_size": 100})
        
        logger.debug(f"[DISCOUNT_DEBUG] Retrieved {len(discounts_response.get('items', []))} discounts")
        
        # Find matching discount
        matching_discount = None
        for discount in discounts_response.get('items', []):
            if discount.get('code', '').upper() == discount_code:
                matching_discount = discount
                break
        
        if not matching_discount:
            logger.warning(f"[DISCOUNT_WARN] Discount code not found: {discount_code}")
            raise HTTPException(status_code=404, detail="Invalid discount code")
        
        # Check if discount is expired
        expires_at = matching_discount.get('expires_at')
        if expires_at:
            from datetime import datetime
            import dateutil.parser
            
            expiry_date = dateutil.parser.parse(expires_at)
            if datetime.now(expiry_date.tzinfo) > expiry_date:
                logger.warning(f"[DISCOUNT_WARN] Discount code expired: {discount_code}")
                raise HTTPException(status_code=400, detail="Discount code has expired")
        
        # Check usage limit
        usage_limit = matching_discount.get('usage_limit')
        times_used = matching_discount.get('times_used', 0)
        if usage_limit and times_used >= usage_limit:
            logger.warning(f"[DISCOUNT_WARN] Discount code usage limit reached: {discount_code}")
            raise HTTPException(status_code=400, detail="Discount code usage limit reached")
        
        logger.info(f"[DISCOUNT_INFO] Valid discount code found: {discount_code}")
        logger.debug(f"[DISCOUNT_DEBUG] Discount details: {json.dumps(matching_discount, indent=2, default=str)}")
        
        return {
            "code": matching_discount.get('code'),
            "amount": matching_discount.get('amount'),
            "type": matching_discount.get('type'),
            "discount_id": matching_discount.get('discount_id'),
            "expires_at": matching_discount.get('expires_at'),
            "usage_limit": matching_discount.get('usage_limit'),
            "times_used": matching_discount.get('times_used'),
            "valid": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[DISCOUNT_ERROR] Discount validation failed: {e}")
        logger.error(f"[DISCOUNT_ERROR] Error type: {type(e)}")
        logger.error(f"[DISCOUNT_ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to validate discount code")

# Webhook endpoints
@router.post("/webhooks")
async def create_webhook(webhook_data: Dict):
    """Create a webhook"""
    try:
        result = await dodo_service.create_webhook(webhook_data)
        return result
    except Exception as e:
        logger.error(f"Webhook creation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/webhooks")
async def list_webhooks(
    limit: Optional[int] = 10,
    iterator: Optional[str] = None
):
    """List webhooks"""
    try:
        params = {}
        if limit:
            params["limit"] = limit
        if iterator:
            params["iterator"] = iterator
            
        result = await dodo_service.list_webhooks(params)
        return result
    except Exception as e:
        logger.error(f"Failed to list webhooks: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(webhook_id: str):
    """Delete a webhook"""
    try:
        await dodo_service._request("DELETE", f"/webhooks/{webhook_id}")
        return {"message": "Webhook deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete webhook: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhooks/dodo")
async def handle_dodo_webhook(request: Request):
    """Handle incoming webhook events from Dodo Payments with real processing"""
    logger.debug(f"[WEBHOOK_DEBUG] Received Dodo Payments webhook event")
    
    try:
        # Get raw body and headers for signature verification
        body = await request.body()
        signature = request.headers.get("Dodo-Signature", "")
        
        logger.debug(f"[WEBHOOK_DEBUG] Webhook signature: {signature[:20]}...")
        logger.debug(f"[WEBHOOK_DEBUG] Body length: {len(body)}")
        
        # Verify webhook signature (important for security)
        from config.settings import DODO_WEBHOOK_SECRET
        if DODO_WEBHOOK_SECRET:
            # TODO: Implement proper signature verification
            # For now, we'll process the webhook but log that verification should be implemented
            logger.warning(f"[WEBHOOK_WARN] Webhook signature verification not yet implemented")
        
        # Parse event data
        event_data = json.loads(body)
        logger.debug(f"[WEBHOOK_DEBUG] Webhook event data: {json.dumps(event_data, indent=2, default=str)}")

        # Extract event details
        event_type = event_data.get("type")
        event_id = event_data.get("webhook-id")
        timestamp = event_data.get("timestamp")
        data = event_data.get("data", {})
        
        logger.info(f"[WEBHOOK_INFO] Processing event type: {event_type}, ID: {event_id}")
        
        # Process different event types
        if event_type == "payment.succeeded":
            await process_payment_succeeded(data)
        elif event_type == "payment.failed":
            await process_payment_failed(data)
        elif event_type == "subscription.active":
            await process_subscription_active(data)
        elif event_type == "subscription.cancelled":
            await process_subscription_cancelled(data)
        elif event_type == "subscription.renewed":
            await process_subscription_renewed(data)
        elif event_type == "license_key.created":
            await process_license_key_created(data)
        else:
            logger.warning(f"[WEBHOOK_WARN] Unhandled webhook event type: {event_type}")

        return {"status": "success", "message": f"Webhook {event_type} processed successfully"}
        
    except json.JSONDecodeError as e:
        logger.error(f"[WEBHOOK_ERROR] Invalid JSON in webhook body: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        logger.error(f"[WEBHOOK_ERROR] Failed to process webhook: {e}")
        logger.error(f"[WEBHOOK_ERROR] Error type: {type(e)}")
        logger.error(f"[WEBHOOK_ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

async def process_payment_succeeded(payment_data: Dict):
    """Process successful payment webhook"""
    logger.info(f"[WEBHOOK_PROCESS] Processing successful payment")
    
    try:
        payment_id = payment_data.get("payment_id")
        customer = payment_data.get("customer", {})
        customer_email = customer.get("email")
        total_amount = payment_data.get("total_amount")
        
        logger.info(f"[WEBHOOK_PROCESS] Payment {payment_id} succeeded for {customer_email}, amount: {total_amount}")
        
        # TODO: Implement database updates
        # - Update user's payment status
        # - Send confirmation email
        # - Provision access if applicable
        
    except Exception as e:
        logger.error(f"[WEBHOOK_ERROR] Failed to process payment succeeded: {e}")
        raise

async def process_subscription_active(subscription_data: Dict):
    """Process subscription activation webhook"""
    logger.info(f"[WEBHOOK_PROCESS] Processing subscription activation")
    
    try:
        subscription_id = subscription_data.get("subscription_id")
        customer = subscription_data.get("customer", {})
        customer_email = customer.get("email")
        product_id = subscription_data.get("product_id")
        
        logger.info(f"[WEBHOOK_PROCESS] Subscription {subscription_id} active for {customer_email}, product: {product_id}")
        
        # TODO: Implement database updates
        # - Update user's subscription status to active
        # - Grant premium access
        # - Send welcome email
        
    except Exception as e:
        logger.error(f"[WEBHOOK_ERROR] Failed to process subscription active: {e}")
        raise

async def process_subscription_cancelled(subscription_data: Dict):
    """Process subscription cancellation webhook"""
    logger.info(f"[WEBHOOK_PROCESS] Processing subscription cancellation")
    
    try:
        subscription_id = subscription_data.get("subscription_id")
        customer = subscription_data.get("customer", {})
        customer_email = customer.get("email")
        
        logger.info(f"[WEBHOOK_PROCESS] Subscription {subscription_id} cancelled for {customer_email}")
        
        # TODO: Implement database updates
        # - Update user's subscription status to cancelled
        # - Schedule access revocation for end of billing period
        # - Send cancellation confirmation email
        
    except Exception as e:
        logger.error(f"[WEBHOOK_ERROR] Failed to process subscription cancelled: {e}")
        raise

async def process_subscription_renewed(subscription_data: Dict):
    """Process subscription renewal webhook"""
    logger.info(f"[WEBHOOK_PROCESS] Processing subscription renewal")
    
    try:
        subscription_id = subscription_data.get("subscription_id")
        customer = subscription_data.get("customer", {})
        customer_email = customer.get("email")
        
        logger.info(f"[WEBHOOK_PROCESS] Subscription {subscription_id} renewed for {customer_email}")
        
        # TODO: Implement database updates
        # - Extend user's subscription period
        # - Send renewal confirmation email
        
    except Exception as e:
        logger.error(f"[WEBHOOK_ERROR] Failed to process subscription renewed: {e}")
        raise

async def process_payment_failed(payment_data: Dict):
    """Process failed payment webhook"""
    logger.info(f"[WEBHOOK_PROCESS] Processing failed payment")
    
    try:
        payment_id = payment_data.get("payment_id")
        customer = payment_data.get("customer", {})
        customer_email = customer.get("email")
        
        logger.info(f"[WEBHOOK_PROCESS] Payment {payment_id} failed for {customer_email}")
        
        # TODO: Implement database updates
        # - Update payment status to failed
        # - Send payment failure notification
        # - Potentially retry or request payment update
        
    except Exception as e:
        logger.error(f"[WEBHOOK_ERROR] Failed to process payment failed: {e}")
        raise

async def process_license_key_created(license_data: Dict):
    """Process license key creation webhook"""
    logger.info(f"[WEBHOOK_PROCESS] Processing license key creation")
    
    try:
        license_key = license_data.get("key")
        customer = license_data.get("customer", {})
        customer_email = customer.get("email")
        
        logger.info(f"[WEBHOOK_PROCESS] License key created for {customer_email}")
        
        # TODO: Implement database updates
        # - Store license key for user
        # - Send license key email
        
    except Exception as e:
        logger.error(f"[WEBHOOK_ERROR] Failed to process license key created: {e}")
        raise

# Analytics endpoint
@router.get("/analytics")
async def get_payment_analytics(days: int = 30, currency: Optional[str] = "USD"):
    """Get payment analytics"""
    logger.debug(f"[ANALYTICS_DEBUG] Generating analytics for {days} days, currency: {currency}")
    try:
        # Fetch real payment data for analytics
        from datetime import datetime, timedelta
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        logger.debug(f"[ANALYTICS_DEBUG] Date range: {start_date} to {end_date}")
        
        # Get payments in date range
        payments_data = await dodo_service.list_payments({
            "page_size": 1000,  # Get more data for analytics
            "created_at_gte": start_date.isoformat(),
            "created_at_lte": end_date.isoformat()
        })
        
        payments = payments_data.get("items", [])
        logger.debug(f"[ANALYTICS_DEBUG] Found {len(payments)} payments in range")
        
        # Calculate real analytics
        total_payments = len(payments)
        successful_payments = len([p for p in payments if p.get("status") == "succeeded"])
        failed_payments = total_payments - successful_payments
        
        # Calculate revenue (sum of successful payments)
        total_revenue = sum(p.get("total_amount", 0) for p in payments if p.get("status") == "succeeded")
        
        # Calculate success rate
        success_rate = successful_payments / total_payments if total_payments > 0 else 0
        
        # Calculate average order value
        average_order_value = total_revenue / successful_payments if successful_payments > 0 else 0
        
        analytics = {
            "total_revenue": total_revenue,
            "total_payments": total_payments,
            "successful_payments": successful_payments,
            "failed_payments": failed_payments,
            "success_rate": success_rate,
            "average_order_value": int(average_order_value),
            "period_days": days,
            "currency": currency,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            }
        }
        
        logger.debug(f"[ANALYTICS_DEBUG] Calculated analytics: {json.dumps(analytics, indent=2, default=str)}")
        return analytics
        
    except Exception as e:
        logger.error(f"[ANALYTICS_ERROR] Failed to get analytics: {e}")
        logger.error(f"[ANALYTICS_ERROR] Traceback: {traceback.format_exc()}")
        
        # Fallback to basic mock data if real analytics fail
        return {
            "total_revenue": 0,
            "total_payments": 0,
            "successful_payments": 0,
            "failed_payments": 0,
            "success_rate": 0,
            "average_order_value": 0,
            "period_days": days,
            "currency": currency,
            "error": "Analytics temporarily unavailable"
        }

# Health check
@router.get("/health")
async def health_check():
    """Health check for payment service"""
    try:
        # Check if Dodo service is configured
        is_configured = dodo_service.api_key is not None
        return {
            "status": "healthy" if is_configured else "warning",
            "configured": is_configured,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }