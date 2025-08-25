"""
Enhanced Subscription Service Layer
Handles business logic for subscription management with FIXED webhook processing
"""

import uuid
import json
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from fastapi import HTTPException
import logging
import traceback
import os

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
    """Enhanced service for managing subscriptions and payments with robust webhook processing"""
    
    def __init__(self, supabase: Client = None):
        if supabase is None:
            from supabase import create_client
            import os
            SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://zwrwtqspeyajttnuzwkl.supabase.co')
            SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_KEY')
            self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        else:
            self.supabase = supabase
        logger.info("Initialized SubscriptionService")
    
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
            
            # Create new Dodo customer
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
    
    async def create_checkout_session(self, user_id: str, plan_type: str, metadata: Optional[Dict] = None, billing_address: Optional[Dict] = None, discount_code: Optional[str] = None) -> Dict[str, Any]:
        """Create a checkout session for subscription"""
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
            
            # Prepare metadata for checkout - CRITICAL: Include userId in multiple formats for webhook processing
            checkout_metadata = {
                "user_id": user_id,
                "userId": user_id,  # Primary fallback for webhook processing
                "plan_type": plan_type,
                "planType": plan_type,
                "userEmail": email,
                "email": email,
                "source": "englishgpt_subscription",
                "timestamp": datetime.utcnow().isoformat()
            }
            if metadata:
                checkout_metadata.update(metadata)
            
            logger.info(f"Creating checkout with metadata: {checkout_metadata}")
            
            session_data = await dodo_client.create_checkout_session(
                product_id=product_id,
                customer_id=dodo_customer_id,
                return_url='https://englishgpt.everythingenglish.xyz/dashboard/payment-success',
                metadata=checkout_metadata,
                billing_address=billing_address,
                discount_code=discount_code
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
        """Get the subscription status for a user with debugging"""
        try:
            logger.info(f"=== SUBSCRIPTION STATUS DEBUG START ===")
            logger.info(f"Getting subscription status for user: {user_id}")
            
            # First check user's current_plan - this is the primary source of truth
            user_response = self.supabase.table('assessment_users').select('subscription_status, subscription_type, current_plan, dodo_customer_id').eq('uid', user_id).execute()
            
            logger.info(f"User data response: {user_response.data}")
            
            if user_response.data:
                user_data = user_response.data[0]
                current_plan = user_data.get('current_plan')
                subscription_status = user_data.get('subscription_status')
                dodo_customer_id = user_data.get('dodo_customer_id')
                
                logger.info(f"User plan info - current_plan: {current_plan}, status: {subscription_status}, dodo_customer: {dodo_customer_id}")
                
                # Check if user has unlimited access
                if current_plan == 'unlimited' or subscription_status in ['premium', 'active']:
                    # Try to get subscription details from dodo_subscriptions table
                    sub_response = self.supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).in_('status', ['active', 'trialing']).order('created_at', desc=True).limit(1).execute()
                    
                    logger.info(f"Active subscription search result: {len(sub_response.data) if sub_response.data else 0} subscriptions")
                    if sub_response.data:
                        logger.info(f"Subscription details: {sub_response.data[0]}")
                    
                    if sub_response.data:
                        subscription = sub_response.data[0]
                        result = SubscriptionStatus(
                            has_active_subscription=True,
                            subscription=subscription,
                            next_billing_date=subscription.get('next_billing_date') or subscription.get('current_period_end')
                        )
                        logger.info(f"Returning active subscription status")
                        return result
                    else:
                        # User has unlimited plan but no subscription record (might be manual grant)
                        # Create a synthetic subscription object
                        logger.info(f"Creating synthetic subscription for unlimited user without subscription record")
                        result = SubscriptionStatus(
                            has_active_subscription=True,
                            subscription={
                                "id": f"unlimited_{user_id[:8]}",
                                "dodo_subscription_id": f"unlimited_{user_id[:8]}",
                                "status": "active",
                                "plan_type": user_data.get('subscription_type') or 'unlimited',
                                "current_plan": "unlimited",
                                "cancel_at_period_end": False,
                                "user_id": user_id
                            },
                            next_billing_date=None
                        )
                        return result
            
            # Check for active subscriptions in dodo_subscriptions table
            sub_response = self.supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).in_('status', ['active', 'trialing']).order('created_at', desc=True).limit(1).execute()
            
            if sub_response.data:
                subscription = sub_response.data[0]
                return SubscriptionStatus(
                    has_active_subscription=True,
                    subscription=subscription,
                    next_billing_date=subscription.get('next_billing_date') or subscription.get('current_period_end')
                )
            
            return SubscriptionStatus(has_active_subscription=False)
            
        except Exception as e:
            logger.error(f"Failed to get subscription status for user {user_id}: {e}")
            return SubscriptionStatus(has_active_subscription=False)
    
    async def _check_user_subscription_access(self, user_id: str) -> bool:
        """Check if user has active subscription access - used by evaluation system"""
        try:
            # First check current_plan field - this is the definitive access control field
            user_response = self.supabase.table('assessment_users').select('current_plan, subscription_status').eq('uid', user_id).execute()
            
            if user_response.data:
                user_data = user_response.data[0]
                current_plan = user_data.get('current_plan', 'free')
                
                # If current_plan is unlimited, user has access
                if current_plan == 'unlimited':
                    logger.info(f"User {user_id} has unlimited access via current_plan")
                    return True
                
                # Fallback: check subscription_status
                subscription_status = user_data.get('subscription_status')
                if subscription_status in ['premium', 'active']:
                    logger.info(f"User {user_id} has access via subscription_status: {subscription_status}")
                    return True
            
            # Final check: Look for active subscription records
            result = self.supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).in_('status', ['active', 'trialing']).order('created_at', desc=True).limit(1).execute()
            
            if result.data:
                subscription = result.data[0]
                current_period_end = subscription.get('current_period_end')
                
                # Check if subscription is still valid
                if current_period_end:
                    try:
                        end_date = datetime.fromisoformat(current_period_end.replace('Z', '+00:00'))
                        is_valid = end_date > datetime.now(timezone.utc)
                        logger.info(f"User {user_id} subscription validity: {is_valid}")
                        return is_valid
                    except Exception as e:
                        logger.warning(f"Could not parse subscription end date: {e}")
                        # If we can't parse the date, assume it's valid
                        return True
                
                # If no end date, assume active subscription is valid
                logger.info(f"User {user_id} has active subscription without end date")
                return True
            
            logger.info(f"User {user_id} has no active subscription access")
            return False
            
        except Exception as e:
            logger.error(f"Failed to check subscription access for user {user_id}: {e}")
            # Default to no access on error for security
            return False
    
    async def handle_subscription_webhook_event(self, event_type: str, subscription_data: Dict[str, Any]) -> None:
        """Enhanced subscription webhook handler with robust user lookup and processing"""
        try:
            logger.info(f"🔄 Processing subscription webhook: {event_type}")
            logger.info(f"📋 Subscription data keys: {list(subscription_data.keys())}")
            
            subscription_id = subscription_data.get('subscription_id') or subscription_data.get('id')
            user_id = None
            
            # ENHANCED USER LOOKUP - Try multiple methods
            user_id = await self._find_user_from_webhook_data(subscription_data)
            
            if not user_id:
                logger.error(f"❌ Cannot find user for subscription {subscription_id}")
                logger.error(f"📋 Available data: {json.dumps(subscription_data, indent=2)}")
                return
            
            logger.info(f"✅ Found user: {user_id}")
            
            # Process different subscription events
            if event_type in ['subscription.created', 'subscription.active', 'subscription.activated', 'subscription.renewed']:
                await self._handle_subscription_activation(user_id, subscription_data)
            elif event_type in ['subscription.cancelled', 'subscription.canceled']:
                await self._handle_subscription_cancelled(user_id, subscription_data)
            elif event_type in ['subscription.expired', 'subscription.ended']:
                await self._handle_subscription_expired(user_id, subscription_data)
            elif event_type == 'subscription.updated':
                await self._handle_subscription_update(user_id, subscription_data)
            else:
                logger.warning(f"⚠️ Unhandled subscription event: {event_type}")
            
            # CRITICAL: Always sync user status after any change
            await self._sync_user_subscription_status(user_id)
            logger.info(f"✅ Subscription webhook {event_type} processed successfully for user {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to handle subscription webhook {event_type}: {e}")
            logger.error(f"📋 Webhook data: {json.dumps(subscription_data, indent=2)}")
            raise
    
    async def handle_payment_webhook(self, event_type: str, payment_data: Dict[str, Any]) -> None:
        """Enhanced payment webhook handler"""
        try:
            logger.info(f"🔄 Processing payment webhook: {event_type}")
            logger.info(f"📋 Payment data keys: {list(payment_data.keys())}")
            
            payment_id = payment_data.get('id')
            user_id = None
            
            # Find user from payment data
            user_id = await self._find_user_from_webhook_data(payment_data)
            
            if not user_id:
                logger.error(f"❌ Cannot find user for payment {payment_id}")
                logger.error(f"📋 Available data: {json.dumps(payment_data, indent=2)}")
                return
            
            logger.info(f"✅ Found user: {user_id}")
            
            if event_type == 'payment.succeeded':
                await self._handle_payment_succeeded(user_id, payment_data)
            elif event_type == 'payment.failed':
                await self._handle_payment_failed(user_id, payment_data)
            else:
                logger.warning(f"⚠️ Unhandled payment event: {event_type}")
            
            logger.info(f"✅ Payment webhook {event_type} processed successfully for user {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to handle payment webhook {event_type}: {e}")
            logger.error(f"📋 Webhook data: {json.dumps(payment_data, indent=2)}")
            raise
    
    async def handle_customer_webhook(self, event_type: str, customer_data: Dict[str, Any]) -> None:
        """Handle customer webhook events"""
        try:
            logger.info(f"🔄 Processing customer webhook: {event_type}")
            logger.info(f"📋 Customer data keys: {list(customer_data.keys())}")
            
            # For now, just log customer events
            # We could add customer data synchronization here if needed
            logger.info(f"✅ Customer webhook {event_type} logged")
            
        except Exception as e:
            logger.error(f"❌ Failed to handle customer webhook {event_type}: {e}")
    
    async def _find_user_from_webhook_data(self, webhook_data: Dict[str, Any]) -> Optional[str]:
        """Enhanced user lookup with multiple fallback strategies"""
        
        # Strategy 1: Try customer_id from webhook root
        customer_id = webhook_data.get('customer_id')
        if customer_id:
            user_id = await self._find_user_by_customer_id(customer_id)
            if user_id:
                logger.info(f"✅ Found user via root customer_id: {customer_id}")
                return user_id
        
        # Strategy 2: Try customer.customer_id nested structure
        customer_obj = webhook_data.get('customer', {})
        if isinstance(customer_obj, dict):
            customer_id = customer_obj.get('customer_id')
            if customer_id:
                user_id = await self._find_user_by_customer_id(customer_id)
                if user_id:
                    logger.info(f"✅ Found user via nested customer.customer_id: {customer_id}")
                    return user_id
        
        # Strategy 3: Try customer.id
        if isinstance(customer_obj, dict):
            customer_id = customer_obj.get('id')
            if customer_id:
                user_id = await self._find_user_by_customer_id(customer_id)
                if user_id:
                    logger.info(f"✅ Found user via customer.id: {customer_id}")
                    return user_id
        
        # Strategy 4: Try metadata.userId (from checkout creation)
        metadata = webhook_data.get('metadata', {})
        if isinstance(metadata, dict):
            user_id = metadata.get('userId') or metadata.get('user_id')
            if user_id:
                # Verify this user exists
                user_exists = await self._verify_user_exists(user_id)
                if user_exists:
                    logger.info(f"✅ Found user via metadata.userId: {user_id}")
                    # Update their customer ID for future webhooks
                    await self._update_user_customer_id(user_id, webhook_data.get('customer_id'))
                    return user_id
        
        # Strategy 5: Try subscription ID lookup (if we have historical data)
        subscription_id = webhook_data.get('subscription_id') or webhook_data.get('id')
        if subscription_id:
            user_id = await self._find_user_by_subscription_id(subscription_id)
            if user_id:
                logger.info(f"✅ Found user via subscription_id: {subscription_id}")
                return user_id
        
        # Strategy 6: Try email lookup from metadata
        if isinstance(metadata, dict):
            email = metadata.get('userEmail') or metadata.get('email')
            if email:
                user_id = await self._find_user_by_email(email)
                if user_id:
                    logger.info(f"✅ Found user via metadata email: {email}")
                    return user_id
        
    
    async def _find_user_by_customer_id(self, customer_id: str) -> Optional[str]:
        """Find user by Dodo customer ID"""
        try:
            user_response = self.supabase.table('assessment_users').select('uid').eq('dodo_customer_id', customer_id).execute()
            if user_response.data:
                return user_response.data[0]['uid']
            return None
        except Exception as e:
            logger.error(f"Error finding user by customer ID {customer_id}: {e}")
            return None
    
    async def _find_user_by_email(self, email: str) -> Optional[str]:
        """Find user by email address"""
        try:
            user_response = self.supabase.table('assessment_users').select('uid').eq('email', email).execute()
            if user_response.data:
                return user_response.data[0]['uid']
            return None
        except Exception as e:
            logger.error(f"Error finding user by email {email}: {e}")
            return None
    
    async def _verify_user_exists(self, user_id: str) -> bool:
        """Verify that a user ID exists in our database"""
        try:
            user_response = self.supabase.table('assessment_users').select('uid').eq('uid', user_id).execute()
            return bool(user_response.data)
        except Exception as e:
            logger.error(f"Error verifying user {user_id}: {e}")
            return False
    
    async def _find_user_by_subscription_id(self, subscription_id: str) -> Optional[str]:
        """Find user by existing subscription record"""
        try:
            sub_response = self.supabase.table('dodo_subscriptions').select('user_id').eq('dodo_subscription_id', subscription_id).execute()
            if sub_response.data:
                return sub_response.data[0]['user_id']
            return None
        except Exception as e:
            logger.error(f"Error finding user by subscription ID {subscription_id}: {e}")
            return None
    
    async def _update_user_customer_id(self, user_id: str, customer_id: str) -> None:
        """Update user's Dodo customer ID if missing"""
        if not customer_id:
            return
        
        try:
            # Check if user already has this customer ID
            user_response = self.supabase.table('assessment_users').select('dodo_customer_id').eq('uid', user_id).execute()
            if user_response.data:
                current_customer_id = user_response.data[0].get('dodo_customer_id')
                if not current_customer_id or current_customer_id != customer_id:
                    self.supabase.table('assessment_users').update({
                        'dodo_customer_id': customer_id,
                        'updated_at': datetime.utcnow().isoformat()
                    }).eq('uid', user_id).execute()
                    logger.info(f"✅ Updated customer ID for user {user_id}: {customer_id}")
        except Exception as e:
            logger.error(f"Error updating customer ID for user {user_id}: {e}")
    
    async def _handle_subscription_activation(self, user_id: str, subscription_data: Dict[str, Any]) -> None:
        """Handle subscription activation/creation/renewal"""
        try:
            dodo_subscription_id = subscription_data.get('subscription_id') or subscription_data.get('id')
            customer_id = subscription_data.get('customer_id') or subscription_data.get('customer', {}).get('customer_id')
            
            # Determine plan type from product
            plan_type = self._determine_plan_type(subscription_data)
            
            # Calculate period dates
            current_period_start = subscription_data.get('current_period_start')
            current_period_end = subscription_data.get('current_period_end')
            
            # If dates are missing, calculate them
            if not current_period_start:
                current_period_start = datetime.utcnow().isoformat()
            if not current_period_end:
                start_date = datetime.fromisoformat(current_period_start.replace('Z', '+00:00'))
                days_to_add = 30 if plan_type == 'monthly' else 365
                end_date = start_date + timedelta(days=days_to_add)
                current_period_end = end_date.isoformat()
            
            subscription_record = {
                'user_id': user_id,
                'dodo_subscription_id': dodo_subscription_id,
                'dodo_customer_id': customer_id,
                'dodo_product_id': subscription_data.get('product_id'),
                'status': 'active',  # Always set to active for activation events
                'plan_type': plan_type,
                'current_period_start': current_period_start,
                'current_period_end': current_period_end,
                'cancel_at_period_end': subscription_data.get('cancel_at_period_end', False),
                'trial_start': subscription_data.get('trial_start'),
                'trial_end': subscription_data.get('trial_end'),
                'next_billing_date': subscription_data.get('next_billing_date'),
                'metadata': subscription_data.get('metadata', {}),
                'raw_data': subscription_data,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Upsert subscription record
            existing_sub = self.supabase.table('dodo_subscriptions').select('id').eq('dodo_subscription_id', dodo_subscription_id).execute()
            
            if existing_sub.data:
                # Update existing subscription
                self.supabase.table('dodo_subscriptions').update(subscription_record).eq('dodo_subscription_id', dodo_subscription_id).execute()
                logger.info(f"✅ Updated subscription {dodo_subscription_id} for user {user_id}")
            else:
                # Create new subscription
                subscription_record['id'] = str(uuid.uuid4())
                subscription_record['created_at'] = datetime.utcnow().isoformat()
                self.supabase.table('dodo_subscriptions').insert(subscription_record).execute()
                logger.info(f"✅ Created subscription {dodo_subscription_id} for user {user_id}")
            
            # Update user's customer ID if needed
            await self._update_user_customer_id(user_id, customer_id)
            
        except Exception as e:
            logger.error(f"❌ Failed to handle subscription activation for user {user_id}: {e}")
            raise
    
    async def _handle_payment_succeeded(self, user_id: str, payment_data: Dict[str, Any]) -> None:
        """Handle successful payment"""
        try:
            payment_id = payment_data.get('id')
            subscription_id = payment_data.get('subscription_id')
            
            logger.info(f"Processing successful payment {payment_id} for user {user_id}")
            
            # Store payment record
            await self._store_payment_record(payment_id, user_id, payment_data)
            
            # CRITICAL: Payment succeeded means user should have unlimited access
            logger.info(f"🚀 Payment succeeded - Granting unlimited access to user {user_id}")
            
            # Note: We don't update current_plan here directly, we let _sync_user_subscription_status handle it
            # This ensures consistent state management
            
        except Exception as e:
            logger.error(f"❌ Failed to handle payment success for user {user_id}: {e}")
            raise
    
    async def _handle_payment_failed(self, user_id: str, payment_data: Dict[str, Any]) -> None:
        """Handle failed payment"""
        try:
            payment_id = payment_data.get('id')
            
            logger.info(f"Processing failed payment {payment_id} for user {user_id}")
            
            # Store payment record with failed status
            await self._store_payment_record(payment_id, user_id, payment_data)
            
            # Don't change user's subscription status on failed payment
            # They might have other active subscriptions
            
        except Exception as e:
            logger.error(f"❌ Failed to handle payment failure for user {user_id}: {e}")
            raise
    
    def _determine_plan_type(self, subscription_data: Dict[str, Any]) -> str:
        """Determine plan type from subscription data"""
        # Check product ID first
        product_id = subscription_data.get('product_id', '').lower()
        if 'yearly' in product_id or 'annual' in product_id:
            return 'yearly'
        
        # Check payment frequency
        payment_frequency = subscription_data.get('payment_frequency_interval', '').lower()
        if payment_frequency == 'year':
            return 'yearly'
        
        # Check metadata
        metadata = subscription_data.get('metadata', {})
        if isinstance(metadata, dict):
            plan_type = metadata.get('planType') or metadata.get('plan_type')
            if plan_type:
                return plan_type.lower()
        
        # Default to monthly
        return 'monthly'
    
    async def _sync_user_subscription_status(self, user_id: str) -> None:
        """Sync user's subscription status based on active subscriptions - FIXED VERSION"""
        try:
            logger.info(f"🔄 Syncing subscription status for user {user_id}")
            
            # Get all active subscriptions for user
            active_subs_response = self.supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).in_('status', ['active', 'trialing']).order('created_at', desc=True).execute()
            
            if active_subs_response.data:
                # User has active subscriptions
                latest_sub = active_subs_response.data[0]
                
                # Check if subscription is still valid (not expired)
                current_period_end = latest_sub.get('current_period_end')
                is_valid = True
                
                if current_period_end:
                    try:
                        end_date = datetime.fromisoformat(current_period_end.replace('Z', '+00:00'))
                        is_valid = end_date > datetime.now(timezone.utc)
                        logger.info(f"Subscription end date: {end_date}, valid: {is_valid}")
                    except Exception as e:
                        logger.warning(f"⚠️ Could not parse end date {current_period_end}: {e}")
                        # If we can't parse the date, assume it's valid to be safe
                        is_valid = True
                
                if is_valid:
                    # Update user to premium/unlimited plan
                    plan_type = latest_sub.get('plan_type', 'monthly')
                    
                    user_updates = {
                        'current_plan': 'unlimited',  # This is the key field for access control
                        'subscription_status': 'active',  # Status field
                        'subscription_type': plan_type,  # Plan type (monthly/yearly)
                        'updated_at': datetime.utcnow().isoformat()
                    }
                    
                    result = self.supabase.table('assessment_users').update(user_updates).eq('uid', user_id).execute()
                    logger.info(f"✅ Updated user {user_id} to unlimited plan (subscription active)")
                    logger.info(f"📊 Database update result: {result.data}")
                    return
            
            # No active/valid subscriptions - set to free plan
            user_updates = {
                'current_plan': 'free',
                'subscription_status': 'inactive',
                'subscription_type': None,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table('assessment_users').update(user_updates).eq('uid', user_id).execute()
            logger.info(f"ℹ️ Updated user {user_id} to free plan (no active subscription)")
            logger.info(f"📊 Database update result: {result.data}")
            
        except Exception as e:
            logger.error(f"❌ Failed to sync subscription status for user {user_id}: {e}")
            # Don't raise - this shouldn't block webhook processing
    
    async def _handle_subscription_cancelled(self, user_id: str, subscription_data: Dict[str, Any]) -> None:
        """Handle subscription cancellation"""
        try:
            dodo_subscription_id = subscription_data.get('subscription_id') or subscription_data.get('id')
            
            # Update subscription status to cancelled
            self.supabase.table('dodo_subscriptions').update({
                'status': 'cancelled',
                'cancel_at_period_end': subscription_data.get('cancel_at_period_end', True),
                'cancelled_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }).eq('dodo_subscription_id', dodo_subscription_id).execute()
            
            logger.info(f"✅ Cancelled subscription {dodo_subscription_id} for user {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to handle subscription cancellation for user {user_id}: {e}")
            raise
    
    async def _handle_subscription_expired(self, user_id: str, subscription_data: Dict[str, Any]) -> None:
        """Handle subscription expiration"""
        try:
            dodo_subscription_id = subscription_data.get('subscription_id') or subscription_data.get('id')
            
            # Update subscription status to expired
            self.supabase.table('dodo_subscriptions').update({
                'status': 'expired',
                'updated_at': datetime.utcnow().isoformat()
            }).eq('dodo_subscription_id', dodo_subscription_id).execute()
            
            logger.info(f"✅ Expired subscription {dodo_subscription_id} for user {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to handle subscription expiration for user {user_id}: {e}")
            raise
    
    async def _handle_subscription_update(self, user_id: str, subscription_data: Dict[str, Any]) -> None:
        """Handle subscription update"""
        try:
            dodo_subscription_id = subscription_data.get('subscription_id') or subscription_data.get('id')
            
            # Extract updated fields
            update_data = {
                'status': subscription_data.get('status', 'active'),
                'plan_type': self._determine_plan_type(subscription_data),
                'current_period_start': subscription_data.get('current_period_start'),
                'current_period_end': subscription_data.get('current_period_end'),
                'cancel_at_period_end': subscription_data.get('cancel_at_period_end', False),
                'next_billing_date': subscription_data.get('next_billing_date'),
                'metadata': subscription_data.get('metadata', {}),
                'raw_data': subscription_data,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Remove None values
            update_data = {k: v for k, v in update_data.items() if v is not None}
            
            self.supabase.table('dodo_subscriptions').update(update_data).eq('dodo_subscription_id', dodo_subscription_id).execute()
            
            logger.info(f"✅ Updated subscription {dodo_subscription_id} for user {user_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to handle subscription update for user {user_id}: {e}")
            raise
    
    async def _store_webhook_event(self, event_id: str, event_type: str, webhook_data: Dict[str, Any]) -> None:
        """Store webhook event for debugging"""
        try:
            webhook_record = {
                'id': str(uuid.uuid4()),
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
        """Store payment record with correct column names matching existing table"""
        try:
            # Check if payment already exists
            existing = self.supabase.table('dodo_payments').select('id').eq('dodo_payment_id', payment_id).execute()
            
            if existing.data:
                logger.info(f"Payment {payment_id} already exists")
                return
            
            # FIXED: Use column names that match your existing table structure
            payment_record = {
                'user_id': str(user_id),  # Convert to string since column is TEXT
                'dodo_payment_id': payment_id,
                'subscription_id': payment_data.get('subscription_id'),
                'dodo_invoice_id': payment_data.get('invoice_id'),
                'amount_cents': payment_data.get('total_amount') or payment_data.get('amount', 0),
                'currency': payment_data.get('currency', 'USD'),
                'status': payment_data.get('status', 'succeeded'),
                'payment_method_type': payment_data.get('payment_method', {}).get('type') if payment_data.get('payment_method') else None,
                'failure_reason': payment_data.get('failure_reason'),
                'refund_amount_cents': payment_data.get('refund_amount', 0),
                'metadata': payment_data.get('metadata', {}),
                'created_at': payment_data.get('created_at', datetime.utcnow().isoformat()),
                'updated_at': datetime.utcnow().isoformat(),
                # Keep the raw_data for debugging
                'raw_data': payment_data
            }
            
            self.supabase.table('dodo_payments').insert(payment_record).execute()
            logger.info(f"Stored payment record {payment_id} for user {user_id}")
            
        except Exception as e:
            logger.warning(f"Could not store payment record: {e}")
            logger.warning(f"Payment data: {payment_data}")
            # Don't fail webhook processing if we can't store the payment
    
    async def get_billing_history(self, user_id: str, limit: int = 50) -> List[BillingHistoryItem]:
        """Get billing history for a user with extensive debugging"""
        try:
            logger.info(f"=== BILLING HISTORY DEBUG START ===")
            logger.info(f"Fetching billing history for user {user_id} with limit {limit}")
            
            # First check if user exists
            user_check = self.supabase.table('assessment_users').select('uid, dodo_customer_id').eq('uid', user_id).execute()
            logger.info(f"User check result: {user_check.data if user_check.data else 'User not found'}")
            
            # Query the dodo_payments table with proper limit handling
            logger.info(f"Querying dodo_payments table for user_id={user_id}")
            payments_response = self.supabase.table('dodo_payments').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
            
            logger.info(f"Raw payments response: {payments_response}")
            logger.info(f"Payments data: {payments_response.data}")
            logger.info(f"Number of payments found: {len(payments_response.data) if payments_response.data else 0}")
            
            # If no payments, check subscriptions for context
            if not payments_response.data:
                logger.info("No payments found, checking subscriptions...")
                subs_response = self.supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).execute()
                logger.info(f"Subscriptions found: {len(subs_response.data) if subs_response.data else 0}")
                if subs_response.data:
                    logger.info(f"Subscription details: {subs_response.data[0]}")
            
            history = []
            for idx, payment in enumerate(payments_response.data or []):
                logger.debug(f"Processing payment {idx}: {payment}")
                # Map database columns to BillingHistoryItem fields
                try:
                    item = BillingHistoryItem(
                        id=payment.get('dodo_payment_id', payment.get('id', f'unknown_{idx}')),
                        amount_cents=payment.get('amount_cents', payment.get('amount', 0)),
                        currency=payment.get('currency', 'USD'),
                        status=payment.get('status', 'unknown'),
                        payment_method_type=payment.get('payment_method_type'),
                        created_at=payment.get('created_at', ''),
                        failure_reason=payment.get('failure_reason')
                    )
                    history.append(item)
                    logger.debug(f"Created history item: {item.dict()}")
                except Exception as item_error:
                    logger.error(f"Error creating history item {idx}: {item_error}")
                    logger.error(f"Payment data causing error: {payment}")
            
            logger.info(f"Successfully retrieved {len(history)} billing records for user {user_id}")
            logger.info(f"=== BILLING HISTORY DEBUG END ===")
            return history
            
        except Exception as e:
            logger.error(f"=== BILLING HISTORY ERROR ===")
            logger.error(f"Failed to get billing history for user {user_id}: {e}")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Error details: {str(e)}")
            import traceback
            logger.error(f"Stack trace:\n{traceback.format_exc()}")
            logger.error(f"=== END ERROR ===")
            # Re-raise the exception to properly return 500 error
            raise
    
    async def cancel_subscription(self, user_id: str, subscription_id: str, cancel_at_period_end: bool = True) -> Dict[str, Any]:
        """Cancel a user's subscription"""
        try:
            logger.info(f"Cancelling subscription {subscription_id} for user {user_id} (at_period_end={cancel_at_period_end})")
            
            # Get user's Dodo customer ID
            user_response = self.supabase.table('assessment_users').select('dodo_customer_id').eq('uid', user_id).execute()
            if not user_response.data or not user_response.data[0].get('dodo_customer_id'):
                raise HTTPException(status_code=404, detail="No customer account found")
            
            # Get subscription details from database
            sub_response = self.supabase.table('dodo_subscriptions').select('*').eq('dodo_subscription_id', subscription_id).eq('user_id', user_id).execute()
            if not sub_response.data:
                raise HTTPException(status_code=404, detail="Subscription not found")
            
            subscription = sub_response.data[0]
            
            if cancel_at_period_end:
                # Mark subscription to cancel at period end
                update_data = {
                    'cancel_at_period_end': True,
                    'updated_at': datetime.utcnow().isoformat()
                }
                
                self.supabase.table('dodo_subscriptions').update(update_data).eq('dodo_subscription_id', subscription_id).execute()
                
                # Update user status
                self.supabase.table('assessment_users').update({
                    'subscription_status': 'cancelling',
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('uid', user_id).execute()
                
                message = "Subscription will be cancelled at the end of the billing period"
            else:
                # Cancel immediately
                update_data = {
                    'status': 'cancelled',
                    'cancel_at_period_end': False,
                    'cancelled_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }
                
                self.supabase.table('dodo_subscriptions').update(update_data).eq('dodo_subscription_id', subscription_id).execute()
                
                # Update user to free plan
                self.supabase.table('assessment_users').update({
                    'current_plan': 'free',
                    'subscription_status': 'cancelled',
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('uid', user_id).execute()
                
                message = "Subscription cancelled immediately"
            
            logger.info(f"Successfully cancelled subscription {subscription_id}: {message}")
            return {"success": True, "message": message}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to cancel subscription {subscription_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to cancel subscription: {str(e)}")
    
    async def reactivate_subscription(self, user_id: str, subscription_id: str) -> Dict[str, Any]:
        """Reactivate a cancelled subscription"""
        try:
            logger.info(f"Reactivating subscription {subscription_id} for user {user_id}")
            
            # Get subscription details
            sub_response = self.supabase.table('dodo_subscriptions').select('*').eq('dodo_subscription_id', subscription_id).eq('user_id', user_id).execute()
            if not sub_response.data:
                raise HTTPException(status_code=404, detail="Subscription not found")
            
            subscription = sub_response.data[0]
            
            # Check if subscription can be reactivated
            if subscription.get('status') == 'cancelled' and not subscription.get('cancel_at_period_end'):
                raise HTTPException(status_code=400, detail="Cannot reactivate a cancelled subscription")
            
            # Remove cancellation flag
            update_data = {
                'cancel_at_period_end': False,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            self.supabase.table('dodo_subscriptions').update(update_data).eq('dodo_subscription_id', subscription_id).execute()
            
            # Update user status
            self.supabase.table('assessment_users').update({
                'subscription_status': 'active',
                'updated_at': datetime.utcnow().isoformat()
            }).eq('uid', user_id).execute()
            
            logger.info(f"Successfully reactivated subscription {subscription_id}")
            return {"success": True, "message": "Subscription reactivated successfully"}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to reactivate subscription {subscription_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to reactivate subscription: {str(e)}")
    
    async def create_customer_portal_session(self, user_id: str) -> Dict[str, Any]:
        """Create a customer portal session for managing payment methods"""
        try:
            logger.info(f"Creating customer portal session for user {user_id}")
            
            # Get user's Dodo customer ID
            user_response = self.supabase.table('assessment_users').select('dodo_customer_id, email').eq('uid', user_id).execute()
            if not user_response.data:
                raise HTTPException(status_code=404, detail="User not found")
            
            user_data = user_response.data[0]
            dodo_customer_id = user_data.get('dodo_customer_id')
            
            if not dodo_customer_id:
                # Create customer if doesn't exist
                email = user_data.get('email')
                if not email:
                    raise HTTPException(status_code=400, detail="User email not found")
                dodo_customer_id = await self.get_or_create_dodo_customer(user_id, email)
            
            # Create customer portal session using Dodo API
            dodo_client = DodoPaymentsClient()
            
            portal_data = {
                "customer_id": dodo_customer_id,
                "return_url": os.getenv('CUSTOMER_PORTAL_RETURN_URL', 'https://englishgpt.everythingenglish.xyz/dashboard/subscriptions')
            }
            
            response = await dodo_client.client.post("/customers/" + dodo_customer_id + "/customer-portal/session", json=portal_data)
            response.raise_for_status()
            portal_response = response.json()
            
            # Extract portal URL
            portal_url = portal_response.get('url') or portal_response.get('portal_url')
            
            if not portal_url:
                logger.error(f"No portal URL in response: {portal_response}")
                raise HTTPException(status_code=500, detail="Failed to create customer portal session")
            
            logger.info(f"Successfully created customer portal session for user {user_id}")
            return {"portal_url": portal_url, "success": True}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to create customer portal session for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create customer portal session: {str(e)}")
    
    # Main webhook entry point - maintains backwards compatibility
    async def handle_subscription_webhook(self, webhook_data: Dict[str, Any]) -> bool:
        """
        Main webhook entry point - processes any Dodo webhook
        This is called from server.py webhook handler
        """
        try:
            event_type = webhook_data.get('type', 'unknown')
            event_data = webhook_data.get('data', webhook_data)
            
            logger.info(f"🎯 Main webhook handler processing: {event_type}")
            
            # Route to appropriate specialized handler
            if event_type.startswith('subscription.'):
                await self.handle_subscription_webhook_event(event_type, event_data)
            elif event_type.startswith('payment.'):
                await self.handle_payment_webhook(event_type, event_data)
            elif event_type.startswith('customer.'):
                await self.handle_customer_webhook(event_type, event_data)
            else:
                logger.warning(f"⚠️ Unknown webhook type: {event_type}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Main webhook handler failed: {e}")
            return False