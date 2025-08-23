"""
Subscription Service Layer
Handles business logic for subscription management with FIXED webhook processing
"""

import uuid
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import HTTPException
import logging
import traceback

from dodo_payments_client import DodoPaymentsClient
from supabase import Client

logger = logging.getLogger(__name__)

class SubscriptionStatus(BaseModel):
    has_active_subscription: bool
    subscription: Optional[Dict[str, Any]] = None
    trial_days_remaining: Optional[int] = None
    next_billing_date: Optional[str] = None

class BillingHistoryItem(BaseModel):
    id: str
    amount_cents: int
    currency: str
    status: str
    payment_method_type: Optional[str]
    created_at: str
    failure_reason: Optional[str] = None

class SubscriptionService:
    """Service for managing subscriptions and payments with FIXED webhooks"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def get_or_create_dodo_customer(self, user_id: str, email: str, name: Optional[str] = None) -> str:
        """Get existing Dodo customer ID or create a new customer"""
        try:
            logger.info(f"Getting/creating Dodo customer for user {user_id}")
            
            # Check if user already has a Dodo customer ID
            user_response = self.supabase.table('assessment_users').select('dodo_customer_id').eq('uid', user_id).execute()
            
            if user_response.data and user_response.data[0].get('dodo_customer_id'):
                customer_id = user_response.data[0]['dodo_customer_id']
                logger.info(f"Found existing Dodo customer ID for user {user_id}: {customer_id}")
                
                # Quick verification that customer exists
                try:
                    dodo_client = DodoPaymentsClient()
                    await dodo_client.get_customer(customer_id)
                    return customer_id
                except Exception as e:
                    logger.warning(f"Stored customer ID {customer_id} verification failed, creating new: {e}")
                    # Clear invalid customer ID
                    self.supabase.table('assessment_users').update({
                        'dodo_customer_id': None
                    }).eq('uid', user_id).execute()
            
            # Create new Dodo customer - FIXED: matching your current signature
            dodo_client = DodoPaymentsClient()
            logger.info(f"Creating new Dodo customer for email: {email}")
            
            customer_data = await dodo_client.create_customer(
                email=email,
                name=name or "User"
            )
            
            # Extract customer ID with fallbacks
            if 'customer_id' in customer_data:
            dodo_customer_id = customer_data['customer_id']
            elif 'id' in customer_data:
                dodo_customer_id = customer_data['id']
            else:
                logger.error(f"No customer ID found in response: {customer_data}")
                raise HTTPException(status_code=500, detail="Invalid customer creation response")
            
            # Update user with Dodo customer ID
            self.supabase.table('assessment_users').update({
                'dodo_customer_id': dodo_customer_id,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('uid', user_id).execute()
            
            logger.info(f"Created and stored Dodo customer {dodo_customer_id} for user {user_id}")
            return dodo_customer_id
                
        except Exception as e:
            logger.error(f"Failed to get/create Dodo customer for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize customer account: {str(e)}")
    
    async def create_checkout_session(self, user_id: str, plan_type: str, metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """Create a checkout session for subscription - SAME signature as before"""
        try:
            logger.debug("create_checkout_session.start", extra={
                "component": "subscription_service",
                "user_id": user_id,
                "plan_type": plan_type,
                "has_metadata": bool(metadata)
            })
            logger.info(f"Creating checkout session for user {user_id}, plan: {plan_type}")
            
            # Get user data
            user_response = self.supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
            if not user_response.data:
                raise HTTPException(status_code=404, detail="User not found")
            
            user_data = user_response.data[0]
            email = user_data['email']
            name = user_data.get('display_name') or user_data.get('name') or "User"
            
            # Get or create Dodo customer
            dodo_customer_id = await self.get_or_create_dodo_customer(user_id, email, name)
            
            # Determine product ID
            import os
            if plan_type == 'monthly':
                product_id = os.getenv('DODO_MONTHLY_PRODUCT_ID')
            elif plan_type == 'yearly':
                product_id = os.getenv('DODO_YEARLY_PRODUCT_ID')
            else:
                raise HTTPException(status_code=400, detail="Invalid plan type")
            
            if not product_id:
                logger.warning(f"Product ID not configured for {plan_type}, using fallback")
                _fallback_url = f"https://checkout.dodopayments.com/buy/{plan_type}"
                _fallback_sub_id = f"fallback_{int(datetime.now().timestamp())}"
                logger.debug("create_checkout_session.fallback", extra={
                    "component": "subscription_service",
                    "user_id": user_id,
                    "plan_type": plan_type,
                    "url": _fallback_url
                })
                return {
                    "checkout_url": _fallback_url,
                    "checkoutUrl": _fallback_url,
                    "subscription_id": _fallback_sub_id,
                    "subscriptionId": _fallback_sub_id
                }
            
            # Create checkout session
            dodo_client = DodoPaymentsClient()
            
            # Prepare metadata for checkout
            checkout_metadata = {
                "user_id": user_id,
                "plan_type": plan_type,
                "userEmail": email,
                "userId": user_id,
                "planType": plan_type,
                "source": "englishgpt_subscription",
                "timestamp": datetime.utcnow().isoformat()
            }
            if metadata:
                checkout_metadata.update(metadata)
            
            session_data = await dodo_client.create_checkout_session(
                product_id=product_id,
                customer_id=dodo_customer_id,
                return_url='https://englishgpt.everythingenglish.xyz/dashboard/payment-success',
                metadata=checkout_metadata
            )
            
            logger.info(f"Created checkout session for user {user_id}: {session_data.get('subscription_id', 'N/A')}")
            logger.debug("create_checkout_session.success", extra={
                "component": "subscription_service",
                "user_id": user_id,
                "has_link": bool(session_data.get('payment_link'))
            })
            
            _link = session_data.get('payment_link')
            _sub_id = session_data.get('subscription_id') or session_data.get('id', f"temp_{int(datetime.now().timestamp())}")
            return {
                "checkout_url": _link,
                "checkoutUrl": _link,
                "subscription_id": _sub_id,
                "subscriptionId": _sub_id
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to create checkout session for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Checkout creation failed: {str(e)}")
    
    async def get_subscription_status(self, user_id: str) -> SubscriptionStatus:
        """Get the subscription status for a user - SAME return format"""
        try:
            # Check for active subscriptions
            sub_response = self.supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).in_('status', ['active', 'trialing']).order('created_at', desc=True).limit(1).execute()
            
            if sub_response.data:
                subscription = sub_response.data[0]
                return SubscriptionStatus(
                    has_active_subscription=True,
                    subscription=subscription,
                    next_billing_date=subscription.get('next_billing_date')
                )
            
            # Fallback: Check user subscription status
            user_response = self.supabase.table('assessment_users').select('subscription_status, subscription_tier').eq('uid', user_id).execute()
            
            if user_response.data:
                user_data = user_response.data[0]
                subscription_status = user_data.get('subscription_status')
                
                if subscription_status == 'premium':
            return SubscriptionStatus(
                has_active_subscription=True,
                subscription={
                            "status": "active",
                            "plan_type": (user_data.get('subscription_tier') if user_data.get('subscription_tier') in ['monthly', 'yearly'] else 'monthly')
                        }
                    )
            
            return SubscriptionStatus(has_active_subscription=False)
            
        except Exception as e:
            logger.error(f"Failed to get subscription status for user {user_id}: {e}")
            return SubscriptionStatus(has_active_subscription=False)
    
    async def handle_subscription_webhook(self, webhook_data: Dict[str, Any]) -> bool:
        """
        FIXED webhook handler - handles all the issues we found
        """
        try:
            event_type = webhook_data.get('type')
            event_data = webhook_data.get('data', {})
            event_id = webhook_data.get('id', f"evt_{int(datetime.now().timestamp())}")
            
            logger.info(f"Processing webhook event: {event_type}")
            logger.info(f"Event data keys: {list(event_data.keys())}")
            
            if event_type not in ['subscription.created', 'subscription.active', 'subscription.updated', 'subscription.cancelled', 'subscription.renewed', 'payment.succeeded']:
                logger.info(f"Ignoring webhook event type: {event_type}")
                return True
            
            # Store webhook event for debugging
            await self._store_webhook_event(event_id, event_type, webhook_data)
            
            # Route to specific handlers
            if event_type == 'payment.succeeded':
                return await self._handle_payment_succeeded(event_data, event_id)
            elif event_type in ['subscription.active', 'subscription.created', 'subscription.renewed']:
                return await self._handle_subscription_active(event_data, event_id)
            elif event_type == 'subscription.cancelled':
                return await self._handle_subscription_cancelled(event_data, event_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to process webhook {event_type}: {e}")
            logger.error(f"Stack trace: {traceback.format_exc()}")
            return False
    
    async def _handle_payment_succeeded(self, payment_data: Dict[str, Any], event_id: str) -> bool:
        """Handle successful payment"""
        try:
            logger.info(f"Processing payment webhook: payment.succeeded")
            
            # Extract payment info with FIXED parsing
            payment_id = payment_data.get('payment_id') or payment_data.get('id')
            subscription_id = payment_data.get('subscription_id')
            
            # FIXED customer ID extraction - this was the main bug
            customer_info = payment_data.get('customer', {})
            if isinstance(customer_info, dict):
                customer_id = customer_info.get('customer_id')
            else:
                customer_id = payment_data.get('customer_id')
            
            if not customer_id:
                logger.error("No customer ID found in payment webhook")
                return False
            
            # Find user with multiple strategies
            user_id = await self._find_user_for_webhook(customer_id, payment_data.get('metadata', {}))
            if not user_id:
                logger.error(f"No user found for customer_id: {customer_id}")
                return False
            
            logger.info(f"Processing payment {payment_id} for user {user_id}")
            
            # Store payment record
            await self._store_payment_record(payment_id, user_id, payment_data)
            
            # CRITICAL: Update user to unlimited immediately after payment
            user_update = {
                'current_plan': 'unlimited',  # THIS IS THE KEY FIELD
                'subscription_status': 'premium',
                'updated_at': datetime.utcnow().isoformat()
            }
            
            self.supabase.table('assessment_users').update(user_update).eq('uid', user_id).execute()
            logger.info(f"Payment succeeded - Updated user {user_id} to premium (current_plan='premium')")
            
            logger.info(f"Processed payment {payment_id} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to handle payment webhook: {e}")
            return False
    
    async def _handle_subscription_active(self, subscription_data: Dict[str, Any], event_id: str) -> bool:
        """Handle active subscription - FIXED the customer_id bug"""
        try:
            logger.info(f"Processing subscription webhook: subscription.active")
            
            subscription_id = subscription_data.get('subscription_id') or subscription_data.get('id')
            
            # FIXED customer ID extraction - this was causing the 'customer_id' KeyError
            customer_info = subscription_data.get('customer', {})
            if isinstance(customer_info, dict):
                customer_id = customer_info.get('customer_id')
            else:
                customer_id = subscription_data.get('customer_id')
            
            status = subscription_data.get('status', 'active')
            
            if not customer_id:
                logger.error("No customer ID found in subscription webhook")
                return False
            
            # Find user with fallback strategies
            user_id = await self._find_user_for_webhook(customer_id, subscription_data.get('metadata', {}))
            if not user_id:
                logger.error(f"No user found for customer_id: {customer_id}")
                return False
            
            logger.info(f"Processing subscription webhook for user {user_id}")
            
            # Extract subscription details
            next_billing_date = subscription_data.get('next_billing_date')
            payment_frequency = subscription_data.get('payment_frequency_interval', 'Month')
            plan_type = 'monthly' if payment_frequency == 'Month' else 'yearly'
            
            # Create or update subscription record
            subscription_record = {
                'user_id': user_id,
                'dodo_subscription_id': subscription_id,
                'dodo_customer_id': customer_id,
                'status': status,
                'plan_type': plan_type,
                'next_billing_date': next_billing_date,
                'created_at': subscription_data.get('created_at', datetime.utcnow().isoformat()),
                'updated_at': datetime.utcnow().isoformat(),
                'raw_data': subscription_data
            }
            
            # Upsert subscription
            try:
                self.supabase.table('dodo_subscriptions').upsert(subscription_record, on_conflict='dodo_subscription_id').execute()
            except Exception as db_error:
                logger.warning(f"Could not upsert subscription, trying insert: {db_error}")
                try:
                    self.supabase.table('dodo_subscriptions').insert(subscription_record).execute()
                except Exception as insert_error:
                    logger.warning(f"Could not insert subscription: {insert_error}")
            
            # Update user subscription status - MUST update current_plan!
            user_update = {
                'current_plan': 'unlimited',  # THIS IS CRITICAL - the frontend checks current_plan
                'subscription_status': 'premium',
                'subscription_tier': plan_type,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            self.supabase.table('assessment_users').update(user_update).eq('uid', user_id).execute()
            logger.info(f"Updated user {user_id} to premium plan (current_plan='premium')")
            
            logger.info(f"Successfully processed subscription.active for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to handle subscription webhook: {e}")
            logger.error(f"Stack trace: {traceback.format_exc()}")
            return False
    
    async def _handle_subscription_cancelled(self, subscription_data: Dict[str, Any], event_id: str) -> bool:
        """Handle cancelled subscription"""
        try:
            logger.info("Processing subscription webhook: subscription.cancelled")
            
            subscription_id = subscription_data.get('subscription_id') or subscription_data.get('id')
            
            # FIXED customer ID extraction
            customer_info = subscription_data.get('customer', {})
            if isinstance(customer_info, dict):
                customer_id = customer_info.get('customer_id')
            else:
                customer_id = subscription_data.get('customer_id')
            
            if not customer_id:
                logger.error("No customer ID found in cancellation webhook")
                return False
            
            user_id = await self._find_user_for_webhook(customer_id, subscription_data.get('metadata', {}))
            if not user_id:
                logger.error(f"No user found for customer_id: {customer_id}")
                return False
            
            # Update subscription to cancelled
            try:
            self.supabase.table('dodo_subscriptions').update({
                'status': 'cancelled',
                'cancelled_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('dodo_subscription_id', subscription_id).execute()
            except Exception as e:
                logger.warning(f"Could not update subscription record: {e}")
            
            # Update user subscription status to free - MUST update current_plan!
            self.supabase.table('assessment_users').update({
                'current_plan': 'free',  # THIS IS CRITICAL - revert to free plan
                'subscription_status': 'none',
                'subscription_tier': 'free',
                'updated_at': datetime.utcnow().isoformat()
            }).eq('uid', user_id).execute()
            logger.info(f"Updated user {user_id} back to free plan (current_plan='free')")
            
            logger.info(f"Cancelled subscription {subscription_id} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to handle subscription cancellation: {e}")
            return False
    
    async def _find_user_for_webhook(self, customer_id: str, metadata: Dict[str, Any]) -> Optional[str]:
        """FIXED user lookup with multiple fallback strategies"""
        try:
            # Strategy 1: Direct customer ID lookup
            user_response = self.supabase.table('assessment_users').select('uid').eq('dodo_customer_id', customer_id).execute()
            
            if user_response.data:
                user_id = user_response.data[0]['uid']
                logger.info(f"Found user {user_id} via direct customer ID lookup")
                return user_id
            
            # Strategy 2: Metadata userId lookup
            metadata_user_id = metadata.get('userId') or metadata.get('user_id')
            if metadata_user_id:
                user_response = self.supabase.table('assessment_users').select('uid').eq('uid', metadata_user_id).execute()
                if user_response.data:
                    logger.info(f"Found user {metadata_user_id} via metadata lookup")
                    return metadata_user_id
            
            # Strategy 3: Email lookup from metadata
            metadata_email = metadata.get('userEmail') or metadata.get('email')
            if metadata_email:
                user_response = self.supabase.table('assessment_users').select('uid').eq('email', metadata_email).execute()
                if user_response.data:
                    user_id = user_response.data[0]['uid']
                    logger.info(f"Found user {user_id} via email lookup")
                    return user_id
            
            logger.error(f"Could not find user with customer_id: {customer_id}, metadata: {metadata}")
            return None
            
        except Exception as e:
            logger.error(f"Error finding user: {e}")
            return None
    
    async def _store_webhook_event(self, event_id: str, event_type: str, webhook_data: Dict[str, Any]) -> None:
        """Store webhook event for debugging"""
        try:
            webhook_record = {
                'dodo_event_id': event_id,
                'event_type': event_type,
                'processed': False,
                'payload': webhook_data,
                'created_at': datetime.utcnow().isoformat()
            }
            
            self.supabase.table('dodo_webhook_events').insert(webhook_record).execute()
            logger.debug(f"Stored webhook event {event_id}")
            
        except Exception as e:
            logger.warning(f"Could not store webhook event: {e}")
            # Don't fail webhook processing if we can't store the event
    
    async def _store_payment_record(self, payment_id: str, user_id: str, payment_data: Dict[str, Any]) -> None:
        """Store payment record"""
        try:
            # Check if payment already exists
            existing = self.supabase.table('dodo_payments').select('id').eq('dodo_payment_id', payment_id).execute()
            
            if existing.data:
                logger.info(f"Payment {payment_id} already exists")
                return
            
            payment_record = {
                'user_id': user_id,
                'dodo_payment_id': payment_id,
                'subscription_id': payment_data.get('subscription_id'),
                'amount': payment_data.get('total_amount', 0),
                'currency': payment_data.get('currency', 'USD'),
                'status': payment_data.get('status', 'succeeded'),
                'created_at': payment_data.get('created_at', datetime.utcnow().isoformat()),
                'raw_data': payment_data
            }
            
            self.supabase.table('dodo_payments').insert(payment_record).execute()
            logger.info(f"Stored payment record {payment_id} for user {user_id}")
            
        except Exception as e:
            logger.warning(f"Could not store payment record: {e}")
    
    async def get_billing_history(self, user_id: str) -> List[BillingHistoryItem]:
        """Get billing history for a user - SAME signature as before"""
        try:
            payments_response = self.supabase.table('dodo_payments').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            
            history = []
            for payment in payments_response.data:
                history.append(BillingHistoryItem(
                    id=payment['dodo_payment_id'],
                    amount_cents=payment.get('amount', 0),
                    currency=payment.get('currency', 'USD'),
                    status=payment.get('status', 'unknown'),
                    payment_method_type=payment.get('payment_method_type'),
                    created_at=payment['created_at'],
                    failure_reason=payment.get('failure_reason')
                ))
            
            return history
            
        except Exception as e:
            logger.error(f"Failed to get billing history for user {user_id}: {e}")
            return []