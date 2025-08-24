"""
Webhook processor for handling verified Dodo Payments webhooks from Node.js service

This module processes webhook events that have already been verified by the Node.js
webhook service using the dodopayments-webhooks library.
"""

from fastapi import HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone, timedelta
import logging
import uuid
import asyncio
from enum import Enum

logger = logging.getLogger(__name__)

class WebhookEventType(str, Enum):
    """Enumeration of supported webhook event types"""
    # Subscription events
    SUBSCRIPTION_CREATED = "subscription.created"
    SUBSCRIPTION_UPDATED = "subscription.updated" 
    SUBSCRIPTION_CANCELLED = "subscription.cancelled"
    SUBSCRIPTION_REACTIVATED = "subscription.reactivated"
    SUBSCRIPTION_EXPIRED = "subscription.expired"
    SUBSCRIPTION_PAUSED = "subscription.paused"
    SUBSCRIPTION_RESUMED = "subscription.resumed"
    
    # Payment events
    PAYMENT_SUCCEEDED = "payment.succeeded"
    PAYMENT_FAILED = "payment.failed"
    PAYMENT_REFUNDED = "payment.refunded"
    
    # Customer events
    CUSTOMER_CREATED = "customer.created"
    CUSTOMER_UPDATED = "customer.updated"
    CUSTOMER_DELETED = "customer.deleted"
    
    # Invoice events
    INVOICE_CREATED = "invoice.created"
    INVOICE_PAID = "invoice.paid"
    INVOICE_PAYMENT_FAILED = "invoice.payment_failed"
    INVOICE_VOIDED = "invoice.voided"

class ProcessedWebhookData(BaseModel):
    """Schema for processed webhook data from Node.js service"""
    event_type: WebhookEventType
    event_id: str = Field(..., description="Unique event ID from Dodo Payments")
    data: Dict[str, Any] = Field(..., description="Event data payload")
    processed_at: str = Field(..., description="ISO timestamp when webhook was processed")
    original_headers: Dict[str, str] = Field(..., description="Original webhook headers")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")

class SubscriptionPlan(str, Enum):
    """Subscription plan types"""
    MONTHLY = "monthly"
    YEARLY = "yearly"

class SubscriptionStatus(str, Enum):
    """Subscription status types"""
    ACTIVE = "active"
    CANCELLED = "cancelled" 
    EXPIRED = "expired"
    PAUSED = "paused"
    PENDING = "pending"
    TRIALING = "trialing"

class WebhookProcessor:
    """Processes verified webhooks from the Node.js service"""
    
    # Product ID to plan mapping
    PRODUCT_PLAN_MAPPING = {
        'pdt_1SNTZ2ED27HBPf8JOOWtI': SubscriptionPlan.MONTHLY,  # $4.99/month
        'pdt_R9BBFdK801119u9r3r6jy': SubscriptionPlan.YEARLY,   # $49/year
    }
    
    def __init__(self, supabase, subscription_service):
        self.supabase = supabase
        self.subscription_service = subscription_service
    
    async def process_webhook(self, webhook_data: ProcessedWebhookData) -> Dict[str, Any]:
        """
        Process a verified webhook from the Node.js service
        """
        request_id = webhook_data.metadata.get('request_id') if webhook_data.metadata else None
        logger.info(f"🔄 [{request_id}] Processing verified webhook: {webhook_data.event_type}")
        logger.info(f"📝 [{request_id}] Event ID: {webhook_data.event_id}")
        
        try:
            # Check if we've already processed this event (idempotency)
            if await self._is_event_already_processed(webhook_data.event_id):
                logger.info(f"✅ [{request_id}] Event {webhook_data.event_id} already processed, skipping")
                return {
                    "status": "already_processed", 
                    "event_id": webhook_data.event_id,
                    "message": "Event has already been processed successfully"
                }
            
            # Store the webhook event for audit trail
            await self._store_webhook_event(webhook_data)
            
            # Route to appropriate handler based on event type
            result = await self._route_webhook_event(webhook_data, request_id)
            
            # Mark as successfully processed
            await self._mark_event_processed(webhook_data.event_id, result)
            
            logger.info(f"✅ [{request_id}] Successfully processed webhook: {webhook_data.event_type}")
            return {
                "status": "processed", 
                "event_id": webhook_data.event_id, 
                "result": result,
                "processing_time": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Failed to process webhook: {e}")
            await self._mark_event_failed(webhook_data.event_id, str(e))
            raise HTTPException(
                status_code=500, 
                detail={
                    "error": "Webhook processing failed",
                    "message": str(e),
                    "event_id": webhook_data.event_id,
                    "request_id": request_id
                }
            )
    
    async def _is_event_already_processed(self, event_id: str) -> bool:
        """Check if event has already been processed (idempotency)"""
        try:
            result = self.supabase.table('dodo_webhook_events')\
                .select('processed, id')\
                .eq('dodo_event_id', event_id)\
                .execute()
            
            if result.data and len(result.data) > 0:
                is_processed = result.data[0].get('processed', False)
                logger.info(f"📋 Event {event_id} found in database, processed: {is_processed}")
                return is_processed
                
            return False
            
        except Exception as e:
            logger.error(f"❌ Error checking event processing status: {e}")
            return False
    
    async def _store_webhook_event(self, webhook_data: ProcessedWebhookData):
        """Store webhook event in database for audit trail"""
        try:
            webhook_record = {
                "id": str(uuid.uuid4()),
                "event_type": webhook_data.event_type,
                "dodo_event_id": webhook_data.event_id,
                "processed": False,
                "payload": webhook_data.data,
                "processed_at": webhook_data.processed_at,
                "original_headers": webhook_data.original_headers,
                "metadata": webhook_data.metadata or {},
                "created_at": datetime.utcnow().isoformat(),
                "retry_count": 0
            }
            
            result = self.supabase.table('dodo_webhook_events').insert(webhook_record).execute()
            logger.info(f"📝 Stored webhook event: {webhook_data.event_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to store webhook event: {e}")
    
    async def _route_webhook_event(self, webhook_data: ProcessedWebhookData, request_id: str) -> Dict[str, Any]:
        """Route webhook to appropriate handler based on event type"""
        event_type = webhook_data.event_type
        event_data = webhook_data.data
        
        logger.info(f"🎯 [{request_id}] Routing event type: {event_type}")
        
        # Route to specific event handlers
        if event_type.startswith('subscription.'):
            return await self._handle_subscription_event(event_type, event_data, request_id)
        elif event_type.startswith('payment.'):
            return await self._handle_payment_event(event_type, event_data, request_id)
        elif event_type.startswith('customer.'):
            return await self._handle_customer_event(event_type, event_data, request_id)
        elif event_type.startswith('invoice.'):
            return await self._handle_invoice_event(event_type, event_data, request_id)
        else:
            logger.warning(f"⚠️ [{request_id}] Unhandled event type: {event_type}")
            return {
                "status": "unhandled", 
                "event_type": event_type,
                "message": f"No handler available for event type: {event_type}"
            }
    
    # === SUBSCRIPTION EVENT HANDLERS ===
    
    async def _handle_subscription_event(self, event_type: str, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle subscription-related webhook events"""
        logger.info(f"🔄 [{request_id}] Handling subscription event: {event_type}")
        
        subscription_id = self._extract_subscription_id(event_data)
        if not subscription_id:
            raise ValueError("Missing subscription ID in event data")
        
        handlers = {
            WebhookEventType.SUBSCRIPTION_CREATED: self._handle_subscription_created,
            WebhookEventType.SUBSCRIPTION_UPDATED: self._handle_subscription_updated,
            WebhookEventType.SUBSCRIPTION_CANCELLED: self._handle_subscription_cancelled,
            WebhookEventType.SUBSCRIPTION_REACTIVATED: self._handle_subscription_reactivated,
            WebhookEventType.SUBSCRIPTION_EXPIRED: self._handle_subscription_expired,
            WebhookEventType.SUBSCRIPTION_PAUSED: self._handle_subscription_paused,
            WebhookEventType.SUBSCRIPTION_RESUMED: self._handle_subscription_resumed,
        }
        
        handler = handlers.get(event_type)
        if handler:
            return await handler(event_data, request_id)
        else:
            logger.warning(f"⚠️ [{request_id}] Unhandled subscription event: {event_type}")
            return {
                "status": "unhandled", 
                "subscription_id": subscription_id,
                "event_type": event_type
            }
    
    async def _handle_subscription_created(self, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle new subscription creation"""
        try:
            subscription_id = self._extract_subscription_id(event_data)
            customer_data = event_data.get('customer', {})
            customer_id = customer_data.get('id')
            customer_email = customer_data.get('email')
            
            logger.info(f"🎉 [{request_id}] New subscription created: {subscription_id} for {customer_email}")
            
            # Find the user in our system
            user = await self._find_user_by_customer_data(customer_id, customer_email, request_id)
            if not user:
                await self._store_orphaned_webhook(event_data, 'user_not_found', request_id)
                raise ValueError(f"Could not find user for customer {customer_email}")
            
            user_id = user['uid']
            plan_type = self._determine_plan_type(event_data)
            
            # Update user's subscription status
            await self.subscription_service.activate_subscription(
                user_id=user_id,
                subscription_id=subscription_id,
                plan_type=plan_type,
                customer_id=customer_id,
                subscription_data=event_data
            )
            
            # Update user record
            await self._update_user_subscription_info(user_id, {
                'subscription_id': subscription_id,
                'subscription_status': 'active',
                'plan_type': plan_type,
                'dodo_customer_id': customer_id,
                'subscription_start_date': event_data.get('created_at'),
                'current_period_end': event_data.get('current_period_end')
            })
            
            logger.info(f"✅ [{request_id}] Activated subscription for user {user_id}")
            return {
                "status": "activated", 
                "user_id": user_id, 
                "subscription_id": subscription_id,
                "plan_type": plan_type,
                "customer_id": customer_id
            }
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Failed to handle subscription creation: {e}")
            raise
    
    async def _handle_subscription_cancelled(self, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle subscription cancellation"""
        try:
            subscription_id = self._extract_subscription_id(event_data)
            cancelled_at = event_data.get('cancelled_at')
            ends_at = event_data.get('current_period_end')
            cancel_reason = event_data.get('cancellation_reason', 'user_requested')
            
            logger.info(f"❌ [{request_id}] Subscription cancelled: {subscription_id}, reason: {cancel_reason}")
            
            user = await self._find_user_by_subscription_id(subscription_id, request_id)
            if not user:
                raise ValueError(f"Could not find user for subscription {subscription_id}")
            
            await self.subscription_service.cancel_subscription(
                user_id=user['uid'],
                subscription_id=subscription_id,
                cancelled_at=cancelled_at,
                ends_at=ends_at,
                cancellation_reason=cancel_reason
            )
            
            await self._update_user_subscription_info(user['uid'], {
                'subscription_status': 'cancelled',
                'cancelled_at': cancelled_at,
                'subscription_ends_at': ends_at,
                'cancellation_reason': cancel_reason
            })
            
            return {
                "status": "cancelled", 
                "user_id": user['uid'], 
                "subscription_id": subscription_id,
                "ends_at": ends_at,
                "reason": cancel_reason
            }
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Failed to handle subscription cancellation: {e}")
            raise
    
    # === PAYMENT EVENT HANDLERS ===
    
    async def _handle_payment_event(self, event_type: str, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle payment-related events"""
        logger.info(f"💳 [{request_id}] Handling payment event: {event_type}")
        
        handlers = {
            WebhookEventType.PAYMENT_SUCCEEDED: self._handle_payment_succeeded,
            WebhookEventType.PAYMENT_FAILED: self._handle_payment_failed,
            WebhookEventType.PAYMENT_REFUNDED: self._handle_payment_refunded,
        }
        
        handler = handlers.get(event_type)
        if handler:
            return await handler(event_data, request_id)
        else:
            return {"status": "unhandled", "event_type": event_type}
    
    async def _handle_payment_succeeded(self, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle successful payment"""
        try:
            subscription_id = event_data.get('subscription_id')
            payment_id = event_data.get('id')
            amount = event_data.get('amount')
            currency = event_data.get('currency', 'USD')
            
            logger.info(f"✅ [{request_id}] Payment succeeded: {payment_id} for subscription {subscription_id}")
            
            result = {"status": "processed", "payment_id": payment_id}
            
            if subscription_id:
                user = await self._find_user_by_subscription_id(subscription_id, request_id)
                if user:
                    await self.subscription_service.renew_subscription(
                        user_id=user['uid'],
                        subscription_id=subscription_id,
                        payment_data=event_data
                    )
                    
                    await self._record_payment_history(user['uid'], {
                        'payment_id': payment_id,
                        'subscription_id': subscription_id,
                        'amount': amount,
                        'currency': currency,
                        'status': 'succeeded',
                        'payment_date': event_data.get('created_at'),
                        'payment_method': event_data.get('payment_method', {}).get('type')
                    })
                    
                    result['user_id'] = user['uid']
                    result['subscription_renewed'] = True
            
            return result
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Failed to handle payment success: {e}")
            raise
    
    async def _handle_payment_failed(self, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle failed payment"""
        try:
            subscription_id = event_data.get('subscription_id')
            payment_id = event_data.get('id')
            failure_reason = event_data.get('failure_reason')
            
            logger.warning(f"❌ [{request_id}] Payment failed: {payment_id}, reason: {failure_reason}")
            
            result = {"status": "processed", "payment_id": payment_id}
            
            if subscription_id:
                user = await self._find_user_by_subscription_id(subscription_id, request_id)
                if user:
                    await self.subscription_service.handle_failed_payment(
                        user_id=user['uid'],
                        subscription_id=subscription_id,
                        failure_data=event_data
                    )
                    
                    result['user_id'] = user['uid']
                    result['subscription_status'] = 'payment_failed'
            
            return result
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Failed to handle payment failure: {e}")
            raise
    
    # === CUSTOMER EVENT HANDLERS ===
    
    async def _handle_customer_event(self, event_type: str, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle customer-related events"""
        logger.info(f"👤 [{request_id}] Handling customer event: {event_type}")
        
        customer_id = event_data.get('id')
        customer_email = event_data.get('email')
        
        if event_type == WebhookEventType.CUSTOMER_CREATED:
            user = await self._find_user_by_email(customer_email, request_id)
            if user and not user.get('dodo_customer_id'):
                await self._update_user_subscription_info(user['uid'], {
                    'dodo_customer_id': customer_id
                })
                logger.info(f"🔗 [{request_id}] Linked customer {customer_id} to user {user['uid']}")
        
        return {"status": "processed", "event_type": event_type, "customer_id": customer_id}
    
    async def _handle_invoice_event(self, event_type: str, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle invoice-related events"""
        logger.info(f"🧾 [{request_id}] Handling invoice event: {event_type}")
        
        invoice_id = event_data.get('id')
        subscription_id = event_data.get('subscription_id')
        
        if subscription_id:
            user = await self._find_user_by_subscription_id(subscription_id, request_id)
            if user:
                await self._record_invoice_history(user['uid'], event_data)
        
        return {
            "status": "processed", 
            "event_type": event_type, 
            "invoice_id": invoice_id,
            "subscription_id": subscription_id
        }
    
    # === UTILITY METHODS ===
    
    async def _find_user_by_customer_data(self, customer_id: str, customer_email: str, request_id: str) -> Optional[Dict[str, Any]]:
        """Find user by Dodo customer ID or email"""
        try:
            logger.info(f"🔍 [{request_id}] Searching for user: customer_id={customer_id}, email={customer_email}")
            
            if customer_id:
                result = self.supabase.table('assessment_users')\
                    .select('*')\
                    .eq('dodo_customer_id', customer_id)\
                    .execute()
                
                if result.data and len(result.data) > 0:
                    logger.info(f"✅ [{request_id}] Found user by customer ID: {result.data[0]['uid']}")
                    return result.data[0]
            
            if customer_email:
                result = self.supabase.table('assessment_users')\
                    .select('*')\
                    .eq('email', customer_email.lower())\
                    .execute()
                
                if result.data and len(result.data) > 0:
                    user = result.data[0]
                    logger.info(f"✅ [{request_id}] Found user by email: {user['uid']}")
                    
                    if customer_id and not user.get('dodo_customer_id'):
                        await self._update_user_subscription_info(user['uid'], {
                            'dodo_customer_id': customer_id
                        })
                        logger.info(f"🔗 [{request_id}] Linked customer ID {customer_id} to user {user['uid']}")
                    
                    return user
            
            logger.warning(f"❌ [{request_id}] Could not find user for customer_id={customer_id}, email={customer_email}")
            return None
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Error finding user: {e}")
            return None
    
    async def _find_user_by_subscription_id(self, subscription_id: str, request_id: str) -> Optional[Dict[str, Any]]:
        """Find user by subscription ID"""
        try:
            logger.info(f"🔍 [{request_id}] Searching for user by subscription_id: {subscription_id}")
            
            result = self.supabase.table('assessment_users')\
                .select('*')\
                .eq('subscription_id', subscription_id)\
                .execute()
            
            if result.data and len(result.data) > 0:
                logger.info(f"✅ [{request_id}] Found user by subscription ID: {result.data[0]['uid']}")
                return result.data[0]
            
            logger.warning(f"❌ [{request_id}] Could not find user for subscription_id: {subscription_id}")
            return None
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Error finding user by subscription ID: {e}")
            return None
    
    async def _find_user_by_email(self, email: str, request_id: str) -> Optional[Dict[str, Any]]:
        """Find user by email address"""
        try:
            result = self.supabase.table('assessment_users')\
                .select('*')\
                .eq('email', email.lower())\
                .execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            
            return None
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Error finding user by email: {e}")
            return None
    
    def _extract_subscription_id(self, event_data: Dict[str, Any]) -> Optional[str]:
        """Extract subscription ID from event data"""
        return (
            event_data.get('id') or 
            event_data.get('subscription_id') or 
            event_data.get('subscription', {}).get('id')
        )
    
    def _determine_plan_type(self, event_data: Dict[str, Any]) -> str:
        """Determine subscription plan type from event data"""
        product_id = (
            event_data.get('product_id') or 
            event_data.get('plan', {}).get('product_id') or
            event_data.get('line_items', [{}])[0].get('product_id') if event_data.get('line_items') else None
        )
        
        if product_id and product_id in self.PRODUCT_PLAN_MAPPING:
            plan = self.PRODUCT_PLAN_MAPPING[product_id]
            logger.info(f"📦 Determined plan type: {plan} for product_id: {product_id}")
            return plan
        
        amount = event_data.get('amount') or event_data.get('plan', {}).get('amount')
        if amount:
            amount_dollars = amount / 100 if amount > 100 else amount
            
            if amount_dollars >= 45:
                logger.info(f"💰 Determined plan type: yearly based on amount: ${amount_dollars}")
                return SubscriptionPlan.YEARLY
            else:
                logger.info(f"💰 Determined plan type: monthly based on amount: ${amount_dollars}")
                return SubscriptionPlan.MONTHLY
        
        logger.warning("⚠️ Could not determine plan type, defaulting to monthly")
        return SubscriptionPlan.MONTHLY
    
    async def _update_user_subscription_info(self, user_id: str, update_data: Dict[str, Any]):
        """Update user subscription information"""
        try:
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            result = self.supabase.table('assessment_users')\
                .update(update_data)\
                .eq('uid', user_id)\
                .execute()
            
            logger.info(f"📝 Updated user {user_id} subscription info: {list(update_data.keys())}")
            
        except Exception as e:
            logger.error(f"❌ Failed to update user subscription info: {e}")
    
    async def _record_payment_history(self, user_id: str, payment_data: Dict[str, Any]):
        """Record payment in billing history"""
        try:
            history_record = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'payment_id': payment_data['payment_id'],
                'subscription_id': payment_data.get('subscription_id'),
                'amount_cents': payment_data['amount'],
                'currency': payment_data['currency'],
                'status': payment_data['status'],
                'payment_date': payment_data['payment_date'],
                'payment_method_type': payment_data.get('payment_method'),
                'failure_reason': payment_data.get('failure_reason'),
                'failure_code': payment_data.get('failure_code'),
                'created_at': datetime.utcnow().isoformat()
            }
            
            self.supabase.table('billing_history').insert(history_record).execute()
            logger.info(f"💳 Recorded payment history for user {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to record payment history: {e}")
    
    async def _record_invoice_history(self, user_id: str, invoice_data: Dict[str, Any]):
        """Record invoice in billing history"""
        try:
            invoice_record = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'invoice_id': invoice_data['id'],
                'subscription_id': invoice_data.get('subscription_id'),
                'amount_cents': invoice_data.get('amount_due', 0),
                'currency': invoice_data.get('currency', 'USD'),
                'status': invoice_data.get('status'),
                'invoice_date': invoice_data.get('created_at'),
                'due_date': invoice_data.get('due_date'),
                'created_at': datetime.utcnow().isoformat()
            }
            
            self.supabase.table('invoice_history').insert(invoice_record).execute()
            logger.info(f"🧾 Recorded invoice history for user {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to record invoice history: {e}")
    
    async def _store_orphaned_webhook(self, event_data: Dict[str, Any], reason: str, request_id: str):
        """Store webhook that couldn't be processed for later retry"""
        try:
            orphaned_record = {
                'id': str(uuid.uuid4()),
                'event_data': event_data,
                'reason': reason,
                'request_id': request_id,
                'created_at': datetime.utcnow().isoformat(),
                'retry_count': 0,
                'next_retry_at': (datetime.utcnow() + timedelta(minutes=5)).isoformat()
            }
            
            self.supabase.table('orphaned_webhooks').insert(orphaned_record).execute()
            logger.warning(f"🏥 [{request_id}] Stored orphaned webhook for later processing: {reason}")
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Failed to store orphaned webhook: {e}")
    
    async def _mark_event_processed(self, event_id: str, result: Dict[str, Any]):
        """Mark event as successfully processed"""
        try:
            self.supabase.table('dodo_webhook_events').update({
                "processed": True,
                "processed_at": datetime.utcnow().isoformat(),
                "processing_result": result,
                "error_message": None
            }).eq('dodo_event_id', event_id).execute()
            
            logger.info(f"✅ Marked event {event_id} as processed")
            
        except Exception as e:
            logger.error(f"❌ Failed to mark event as processed: {e}")
    
    async def _mark_event_failed(self, event_id: str, error_message: str):
        """Mark event as failed with error details"""
        try:
            self.supabase.table('dodo_webhook_events').update({
                "processed": False,
                "error_message": error_message,
                "retry_count": 1,
                "failed_at": datetime.utcnow().isoformat()
            }).eq('dodo_event_id', event_id).execute()
            
            logger.info(f"❌ Marked event {event_id} as failed: {error_message}")
            
        except Exception as e:
            logger.error(f"❌ Failed to mark event as failed: {e}")

    async def _handle_subscription_updated(self, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle subscription updates"""
        try:
            subscription_id = self._extract_subscription_id(event_data)
            status = event_data.get('status')
            
            logger.info(f"🔄 [{request_id}] Subscription updated: {subscription_id}, status: {status}")
            
            user = await self._find_user_by_subscription_id(subscription_id, request_id)
            if not user:
                raise ValueError(f"Could not find user for subscription {subscription_id}")
            
            await self.subscription_service.update_subscription_status(
                user_id=user['uid'],
                subscription_id=subscription_id,
                status=status,
                event_data=event_data
            )
            
            await self._update_user_subscription_info(user['uid'], {
                'subscription_status': status,
                'current_period_end': event_data.get('current_period_end'),
                'updated_at': datetime.utcnow().isoformat()
            })
            
            return {
                "status": "updated", 
                "user_id": user['uid'], 
                "subscription_id": subscription_id,
                "new_status": status
            }
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Failed to handle subscription update: {e}")
            raise
    
    async def _handle_subscription_reactivated(self, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle subscription reactivation"""
        try:
            subscription_id = self._extract_subscription_id(event_data)
            
            logger.info(f"🎉 [{request_id}] Subscription reactivated: {subscription_id}")
            
            user = await self._find_user_by_subscription_id(subscription_id, request_id)
            if not user:
                raise ValueError(f"Could not find user for subscription {subscription_id}")
            
            await self.subscription_service.reactivate_subscription(
                user_id=user['uid'],
                subscription_id=subscription_id,
                event_data=event_data
            )
            
            await self._update_user_subscription_info(user['uid'], {
                'subscription_status': 'active',
                'cancelled_at': None,
                'subscription_ends_at': None,
                'cancellation_reason': None,
                'reactivated_at': datetime.utcnow().isoformat()
            })
            
            return {
                "status": "reactivated", 
                "user_id": user['uid'], 
                "subscription_id": subscription_id
            }
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Failed to handle subscription reactivation: {e}")
            raise
    
    async def _handle_subscription_expired(self, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle subscription expiration"""
        try:
            subscription_id = self._extract_subscription_id(event_data)
            expired_at = event_data.get('expired_at')
            
            logger.info(f"⏰ [{request_id}] Subscription expired: {subscription_id}")
            
            user = await self._find_user_by_subscription_id(subscription_id, request_id)
            if not user:
                raise ValueError(f"Could not find user for subscription {subscription_id}")
            
            await self.subscription_service.expire_subscription(
                user_id=user['uid'],
                subscription_id=subscription_id,
                expired_at=expired_at
            )
            
            await self._update_user_subscription_info(user['uid'], {
                'subscription_status': 'expired',
                'expired_at': expired_at,
                'has_access': False
            })
            
            return {
                "status": "expired", 
                "user_id": user['uid'], 
                "subscription_id": subscription_id,
                "expired_at": expired_at
            }
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Failed to handle subscription expiration: {e}")
            raise
    
    async def _handle_subscription_paused(self, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle subscription pause"""
        subscription_id = self._extract_subscription_id(event_data)
        logger.info(f"⏸️ [{request_id}] Subscription paused: {subscription_id}")
        
        user = await self._find_user_by_subscription_id(subscription_id, request_id)
        if user:
            await self._update_user_subscription_info(user['uid'], {
                'subscription_status': 'paused',
                'paused_at': datetime.utcnow().isoformat()
            })
        
        return {"status": "paused", "subscription_id": subscription_id}
    
    async def _handle_subscription_resumed(self, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle subscription resume"""
        subscription_id = self._extract_subscription_id(event_data)
        logger.info(f"▶️ [{request_id}] Subscription resumed: {subscription_id}")
        
        user = await self._find_user_by_subscription_id(subscription_id, request_id)
        if user:
            await self._update_user_subscription_info(user['uid'], {
                'subscription_status': 'active',
                'paused_at': None,
                'resumed_at': datetime.utcnow().isoformat()
            })
        
        return {"status": "resumed", "subscription_id": subscription_id}
    
    async def _handle_payment_refunded(self, event_data: Dict[str, Any], request_id: str) -> Dict[str, Any]:
        """Handle payment refund"""
        try:
            payment_id = event_data.get('id')
            refund_amount = event_data.get('refund_amount')
            refund_reason = event_data.get('refund_reason')
            
            logger.info(f"💸 [{request_id}] Payment refunded: {payment_id}, amount: {refund_amount}")
            
            return {
                "status": "processed", 
                "payment_id": payment_id,
                "refund_amount": refund_amount,
                "refund_reason": refund_reason
            }
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Failed to handle payment refund: {e}")
            raise