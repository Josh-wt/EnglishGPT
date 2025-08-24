"""
Comprehensive Billing API Module for Dodo Payments Integration
Handles all billing-related operations including addons, brands, customers, 
subscriptions, payments, refunds, and more.
"""

from fastapi import APIRouter, HTTPException, Query, Body, File, UploadFile, Form
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import httpx
import os
import logging
from enum import Enum

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/api/billing", tags=["billing"])

# Configuration
DODO_API_KEY = os.getenv("DODO_PAYMENTS_API_KEY")
DODO_API_URL = "https://api.dodopayments.com"

# Enums for various billing types
class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"
    PAUSED = "paused"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    REFUNDED = "refunded"

class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

# Pydantic Models for Request/Response

# Addon Models
class CreateAddonRequest(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    currency: str = "USD"
    recurring: bool = False
    features: Optional[List[str]] = []
    metadata: Optional[Dict[str, Any]] = {}

class UpdateAddonRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    features: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

# Brand Models
class CreateBrandRequest(BaseModel):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    support_email: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

class UpdateBrandRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    support_email: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# Customer Models
class CreateCustomerRequest(BaseModel):
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[Dict[str, str]] = None
    metadata: Optional[Dict[str, Any]] = {}

class UpdateCustomerRequest(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[Dict[str, str]] = None
    metadata: Optional[Dict[str, Any]] = None

# Checkout Session Models
class CreateCheckoutRequest(BaseModel):
    customer_id: Optional[str] = None
    customer_email: Optional[str] = None
    product_id: Optional[str] = None
    price_id: Optional[str] = None
    quantity: int = 1
    success_url: str
    cancel_url: str
    mode: str = "subscription"  # subscription, payment, setup
    allow_promotion_codes: bool = False
    metadata: Optional[Dict[str, Any]] = {}
    line_items: Optional[List[Dict[str, Any]]] = None
    addon_ids: Optional[List[str]] = []

# Discount Models
class CreateDiscountRequest(BaseModel):
    code: str
    type: DiscountType
    value: float
    description: Optional[str] = None
    max_uses: Optional[int] = None
    expires_at: Optional[datetime] = None
    applicable_products: Optional[List[str]] = []
    metadata: Optional[Dict[str, Any]] = {}

# License Models
class CreateLicenseRequest(BaseModel):
    customer_id: str
    product_id: str
    max_activations: int = 1
    expires_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = {}

class ActivateLicenseRequest(BaseModel):
    license_key: str
    machine_id: str
    metadata: Optional[Dict[str, Any]] = {}

# Payment Models
class CreateOneTimePaymentRequest(BaseModel):
    customer_id: str
    amount: float
    currency: str = "USD"
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

# Refund Models
class CreateRefundRequest(BaseModel):
    payment_id: str
    amount: Optional[float] = None  # None for full refund
    reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

# Subscription Models
class CreateSubscriptionRequest(BaseModel):
    customer_id: str
    price_id: str
    quantity: int = 1
    trial_days: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = {}
    addon_ids: Optional[List[str]] = []

class UpdateSubscriptionRequest(BaseModel):
    price_id: Optional[str] = None
    quantity: Optional[int] = None
    cancel_at_period_end: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None
    addon_ids: Optional[List[str]] = None

class ChangePlanRequest(BaseModel):
    subscription_id: str
    new_price_id: str
    prorate: bool = True

# Product Models
class CreateProductRequest(BaseModel):
    name: str
    description: Optional[str] = None
    features: Optional[List[str]] = []
    metadata: Optional[Dict[str, Any]] = {}
    prices: Optional[List[Dict[str, Any]]] = []

class UpdateProductRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    active: Optional[bool] = None

# Webhook Models
class CreateWebhookRequest(BaseModel):
    url: str
    events: List[str]
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

class UpdateWebhookRequest(BaseModel):
    url: Optional[str] = None
    events: Optional[List[str]] = None
    enabled: Optional[bool] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# Helper function for API calls
async def make_dodo_api_call(
    method: str,
    endpoint: str,
    data: Optional[Dict] = None,
    params: Optional[Dict] = None,
    files: Optional[Dict] = None
) -> Dict:
    """Make API call to Dodo Payments"""
    headers = {
        "Authorization": f"Bearer {DODO_API_KEY}",
        "Content-Type": "application/json" if not files else None
    }
    
    url = f"{DODO_API_URL}{endpoint}"
    
    async with httpx.AsyncClient() as client:
        try:
            if method == "GET":
                response = await client.get(url, headers=headers, params=params)
            elif method == "POST":
                if files:
                    # Remove Content-Type for multipart
                    headers.pop("Content-Type", None)
                    response = await client.post(url, headers=headers, data=data, files=files)
                else:
                    response = await client.post(url, headers=headers, json=data)
            elif method == "PATCH":
                response = await client.patch(url, headers=headers, json=data)
            elif method == "PUT":
                if files:
                    headers.pop("Content-Type", None)
                    response = await client.put(url, headers=headers, data=data, files=files)
                else:
                    response = await client.put(url, headers=headers, json=data)
            elif method == "DELETE":
                response = await client.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json() if response.text else {}
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Dodo API error: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except Exception as e:
            logger.error(f"Error calling Dodo API: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

# ============== ADDON ENDPOINTS ==============

@router.post("/addons")
async def create_addon(request: CreateAddonRequest):
    """Create a new addon product"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/addons", data=data)

@router.get("/addons/{addon_id}")
async def get_addon(addon_id: str):
    """Get addon details"""
    return await make_dodo_api_call("GET", f"/addons/{addon_id}")

@router.get("/addons")
async def list_addons(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List all addons"""
    params = {"limit": limit, "offset": offset}
    return await make_dodo_api_call("GET", "/addons", params=params)

@router.patch("/addons/{addon_id}")
async def update_addon(addon_id: str, request: UpdateAddonRequest):
    """Update addon details"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("PATCH", f"/addons/{addon_id}", data=data)

@router.put("/addons/{addon_id}/images")
async def update_addon_images(
    addon_id: str,
    images: List[UploadFile] = File(...)
):
    """Update addon images"""
    files = [("images", (img.filename, await img.read(), img.content_type)) for img in images]
    return await make_dodo_api_call("PUT", f"/addons/{addon_id}/images", files=files)

# ============== BRAND ENDPOINTS ==============

@router.post("/brands")
async def create_brand(request: CreateBrandRequest):
    """Create a new brand"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/brands", data=data)

@router.get("/brands/{brand_id}")
async def get_brand(brand_id: str):
    """Get brand details"""
    return await make_dodo_api_call("GET", f"/brands/{brand_id}")

@router.get("/brands")
async def list_brands(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List all brands"""
    params = {"limit": limit, "offset": offset}
    return await make_dodo_api_call("GET", "/brands", params=params)

@router.patch("/brands/{brand_id}")
async def update_brand(brand_id: str, request: UpdateBrandRequest):
    """Update brand details"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("PATCH", f"/brands/{brand_id}", data=data)

@router.put("/brands/{brand_id}/images")
async def update_brand_images(
    brand_id: str,
    logo: Optional[UploadFile] = File(None),
    favicon: Optional[UploadFile] = File(None)
):
    """Update brand images"""
    files = {}
    if logo:
        files["logo"] = (logo.filename, await logo.read(), logo.content_type)
    if favicon:
        files["favicon"] = (favicon.filename, await favicon.read(), favicon.content_type)
    return await make_dodo_api_call("PUT", f"/brands/{brand_id}/images", files=files)

# ============== CHECKOUT ENDPOINTS ==============

@router.post("/checkout-sessions")
async def create_checkout_session(request: CreateCheckoutRequest):
    """Create a checkout session"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/checkouts", data=data)

# ============== CUSTOMER ENDPOINTS ==============

@router.post("/customers")
async def create_customer(request: CreateCustomerRequest):
    """Create a new customer"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/customers", data=data)

@router.get("/customers")
async def list_customers(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    email: Optional[str] = Query(None)
):
    """List all customers"""
    params = {"limit": limit, "offset": offset}
    if email:
        params["email"] = email
    return await make_dodo_api_call("GET", "/customers", params=params)

@router.get("/customers/{customer_id}")
async def get_customer(customer_id: str):
    """Get customer details"""
    return await make_dodo_api_call("GET", f"/customers/{customer_id}")

@router.patch("/customers/{customer_id}")
async def update_customer(customer_id: str, request: UpdateCustomerRequest):
    """Update customer details"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("PATCH", f"/customers/{customer_id}", data=data)

@router.post("/customers/{customer_id}/portal-session")
async def create_customer_portal_session(
    customer_id: str,
    return_url: str = Query(...)
):
    """Create customer portal session"""
    data = {"return_url": return_url}
    return await make_dodo_api_call("POST", f"/customers/{customer_id}/customer-portal/session", data=data)

# ============== DISCOUNT ENDPOINTS ==============

@router.post("/discounts")
async def create_discount(request: CreateDiscountRequest):
    """Create a new discount"""
    data = request.dict(exclude_none=True)
    if data.get("expires_at"):
        data["expires_at"] = data["expires_at"].isoformat()
    return await make_dodo_api_call("POST", "/discounts", data=data)

@router.get("/discounts")
async def list_discounts(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    active_only: bool = Query(False)
):
    """List all discounts"""
    params = {"limit": limit, "offset": offset, "active_only": active_only}
    return await make_dodo_api_call("GET", "/discounts", params=params)

@router.get("/discounts/{discount_id}")
async def get_discount(discount_id: str):
    """Get discount details"""
    return await make_dodo_api_call("GET", f"/discounts/{discount_id}")

@router.patch("/discounts/{discount_id}")
async def update_discount(discount_id: str, request: Dict[str, Any]):
    """Update discount"""
    return await make_dodo_api_call("PATCH", f"/discounts/{discount_id}", data=request)

@router.delete("/discounts/{discount_id}")
async def delete_discount(discount_id: str):
    """Delete a discount"""
    return await make_dodo_api_call("DELETE", f"/discounts/{discount_id}")

@router.post("/discounts/validate")
async def validate_discount(code: str = Body(...), product_id: Optional[str] = Body(None)):
    """Validate a discount code"""
    data = {"code": code}
    if product_id:
        data["product_id"] = product_id
    return await make_dodo_api_call("POST", "/discounts/validate", data=data)

# ============== DISPUTE ENDPOINTS ==============

@router.get("/disputes")
async def list_disputes(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None)
):
    """List all disputes"""
    params = {"limit": limit, "offset": offset}
    if status:
        params["status"] = status
    return await make_dodo_api_call("GET", "/disputes", params=params)

@router.get("/disputes/{dispute_id}")
async def get_dispute(dispute_id: str):
    """Get dispute details"""
    return await make_dodo_api_call("GET", f"/disputes/{dispute_id}")

# ============== LICENSE ENDPOINTS ==============

@router.post("/licenses")
async def create_license(request: CreateLicenseRequest):
    """Create a new license"""
    data = request.dict(exclude_none=True)
    if data.get("expires_at"):
        data["expires_at"] = data["expires_at"].isoformat()
    return await make_dodo_api_call("POST", "/licenses", data=data)

@router.post("/licenses/activate")
async def activate_license(request: ActivateLicenseRequest):
    """Activate a license"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/licenses/activate", data=data)

@router.post("/licenses/{license_key}/deactivate")
async def deactivate_license(license_key: str, machine_id: str = Body(...)):
    """Deactivate a license"""
    data = {"machine_id": machine_id}
    return await make_dodo_api_call("POST", f"/licenses/{license_key}/deactivate", data=data)

@router.get("/licenses/{license_key}")
async def get_license(license_key: str):
    """Get license details"""
    return await make_dodo_api_call("GET", f"/licenses/{license_key}")

@router.get("/licenses")
async def list_licenses(
    customer_id: Optional[str] = Query(None),
    product_id: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List licenses"""
    params = {"limit": limit, "offset": offset}
    if customer_id:
        params["customer_id"] = customer_id
    if product_id:
        params["product_id"] = product_id
    return await make_dodo_api_call("GET", "/licenses", params=params)

@router.patch("/licenses/{license_key}")
async def update_license(license_key: str, request: Dict[str, Any]):
    """Update license"""
    return await make_dodo_api_call("PATCH", f"/licenses/{license_key}", data=request)

@router.post("/licenses/validate")
async def validate_license(
    license_key: str = Body(...),
    machine_id: Optional[str] = Body(None)
):
    """Validate a license"""
    data = {"license_key": license_key}
    if machine_id:
        data["machine_id"] = machine_id
    return await make_dodo_api_call("POST", "/licenses/validate", data=data)

# ============== PAYMENT ENDPOINTS ==============

@router.get("/payments")
async def list_payments(
    customer_id: Optional[str] = Query(None),
    subscription_id: Optional[str] = Query(None),
    status: Optional[PaymentStatus] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List payments"""
    params = {"limit": limit, "offset": offset}
    if customer_id:
        params["customer_id"] = customer_id
    if subscription_id:
        params["subscription_id"] = subscription_id
    if status:
        params["status"] = status
    return await make_dodo_api_call("GET", "/payments", params=params)

@router.get("/payments/{payment_id}")
async def get_payment(payment_id: str):
    """Get payment details"""
    return await make_dodo_api_call("GET", f"/payments/{payment_id}")

@router.get("/payments/{payment_id}/invoice")
async def get_invoice(payment_id: str):
    """Get invoice for payment"""
    return await make_dodo_api_call("GET", f"/payments/{payment_id}/invoice")

@router.post("/payments/one-time")
async def create_one_time_payment(request: CreateOneTimePaymentRequest):
    """Create one-time payment"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/payments/one-time", data=data)

@router.get("/payments/{payment_id}/line-items")
async def get_line_items(payment_id: str):
    """Get payment line items"""
    return await make_dodo_api_call("GET", f"/payments/{payment_id}/line-items")

# ============== PAYOUT ENDPOINTS ==============

@router.get("/payouts")
async def list_payouts(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None)
):
    """List payouts"""
    params = {"limit": limit, "offset": offset}
    if status:
        params["status"] = status
    return await make_dodo_api_call("GET", "/payouts", params=params)

# ============== PRODUCT ENDPOINTS ==============

@router.post("/products")
async def create_product(request: CreateProductRequest):
    """Create a new product"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/products", data=data)

@router.get("/products")
async def list_products(
    active: Optional[bool] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List products"""
    params = {"limit": limit, "offset": offset}
    if active is not None:
        params["active"] = active
    return await make_dodo_api_call("GET", "/products", params=params)

@router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get product details"""
    return await make_dodo_api_call("GET", f"/products/{product_id}")

@router.patch("/products/{product_id}")
async def update_product(product_id: str, request: UpdateProductRequest):
    """Update product"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("PATCH", f"/products/{product_id}", data=data)

@router.post("/products/{product_id}/archive")
async def archive_product(product_id: str):
    """Archive a product"""
    return await make_dodo_api_call("POST", f"/products/{product_id}/archive")

@router.post("/products/{product_id}/unarchive")
async def unarchive_product(product_id: str):
    """Unarchive a product"""
    return await make_dodo_api_call("POST", f"/products/{product_id}/unarchive")

@router.put("/products/{product_id}/images")
async def update_product_images(
    product_id: str,
    images: List[UploadFile] = File(...)
):
    """Update product images"""
    files = [("images", (img.filename, await img.read(), img.content_type)) for img in images]
    return await make_dodo_api_call("PUT", f"/products/{product_id}/images", files=files)

@router.put("/products/{product_id}/files")
async def update_product_files(
    product_id: str,
    files: List[UploadFile] = File(...)
):
    """Update product files"""
    file_data = [("files", (f.filename, await f.read(), f.content_type)) for f in files]
    return await make_dodo_api_call("PUT", f"/products/{product_id}/files", files=file_data)

# ============== REFUND ENDPOINTS ==============

@router.post("/refunds")
async def create_refund(request: CreateRefundRequest):
    """Create a refund"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/refunds", data=data)

@router.get("/refunds")
async def list_refunds(
    payment_id: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List refunds"""
    params = {"limit": limit, "offset": offset}
    if payment_id:
        params["payment_id"] = payment_id
    return await make_dodo_api_call("GET", "/refunds", params=params)

@router.get("/refunds/{refund_id}")
async def get_refund(refund_id: str):
    """Get refund details"""
    return await make_dodo_api_call("GET", f"/refunds/{refund_id}")

# ============== SUBSCRIPTION ENDPOINTS ==============

@router.post("/subscriptions")
async def create_subscription(request: CreateSubscriptionRequest):
    """Create a subscription"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/subscriptions", data=data)

@router.get("/subscriptions")
async def list_subscriptions(
    customer_id: Optional[str] = Query(None),
    status: Optional[SubscriptionStatus] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List subscriptions"""
    params = {"limit": limit, "offset": offset}
    if customer_id:
        params["customer_id"] = customer_id
    if status:
        params["status"] = status
    return await make_dodo_api_call("GET", "/subscriptions", params=params)

@router.get("/subscriptions/{subscription_id}")
async def get_subscription(subscription_id: str):
    """Get subscription details"""
    return await make_dodo_api_call("GET", f"/subscriptions/{subscription_id}")

@router.patch("/subscriptions/{subscription_id}")
async def update_subscription(subscription_id: str, request: UpdateSubscriptionRequest):
    """Update subscription"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("PATCH", f"/subscriptions/{subscription_id}", data=data)

@router.post("/subscriptions/change-plan")
async def change_subscription_plan(request: ChangePlanRequest):
    """Change subscription plan"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/subscriptions/change-plan", data=data)

@router.post("/subscriptions/{subscription_id}/charge")
async def create_subscription_charge(
    subscription_id: str,
    amount: float = Body(...),
    description: str = Body(...)
):
    """Create on-demand charge for subscription"""
    data = {"amount": amount, "description": description}
    return await make_dodo_api_call("POST", f"/subscriptions/{subscription_id}/charge", data=data)

# ============== WEBHOOK ENDPOINTS ==============

@router.post("/webhooks")
async def create_webhook(request: CreateWebhookRequest):
    """Create a webhook"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("POST", "/webhooks", data=data)

@router.get("/webhooks")
async def list_webhooks(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List webhooks"""
    params = {"limit": limit, "offset": offset}
    return await make_dodo_api_call("GET", "/webhooks", params=params)

@router.get("/webhooks/{webhook_id}")
async def get_webhook(webhook_id: str):
    """Get webhook details"""
    return await make_dodo_api_call("GET", f"/webhooks/{webhook_id}")

@router.patch("/webhooks/{webhook_id}")
async def update_webhook(webhook_id: str, request: UpdateWebhookRequest):
    """Update webhook"""
    data = request.dict(exclude_none=True)
    return await make_dodo_api_call("PATCH", f"/webhooks/{webhook_id}", data=data)

@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(webhook_id: str):
    """Delete webhook"""
    return await make_dodo_api_call("DELETE", f"/webhooks/{webhook_id}")

@router.get("/webhooks/{webhook_id}/headers")
async def get_webhook_headers(webhook_id: str):
    """Get webhook headers"""
    return await make_dodo_api_call("GET", f"/webhooks/{webhook_id}/headers")

@router.put("/webhooks/{webhook_id}/headers")
async def update_webhook_headers(webhook_id: str, headers: Dict[str, str] = Body(...)):
    """Update webhook headers"""
    return await make_dodo_api_call("PUT", f"/webhooks/{webhook_id}/headers", data=headers)

@router.get("/webhooks/{webhook_id}/signing-key")
async def get_webhook_signing_key(webhook_id: str):
    """Get webhook signing key"""
    return await make_dodo_api_call("GET", f"/webhooks/{webhook_id}/signing-key")

# ============== MISCELLANEOUS ENDPOINTS ==============

@router.post("/subscriptions/{subscription_id}/charge-now")
async def charge_subscription(subscription_id: str):
    """Charge subscription immediately"""
    return await make_dodo_api_call("POST", f"/subscriptions/{subscription_id}/charge-now")

@router.get("/supported-countries")
async def get_supported_countries():
    """Get list of supported countries"""
    return await make_dodo_api_call("GET", "/supported-countries")