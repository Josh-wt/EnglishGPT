"""
Subscription Service Layer
Handles business logic for subscription management
"""

import uuid
from typing import Dict, Any, Optional, List, Tuple
import os
from urllib.parse import urlencode
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import HTTPException
import logging

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
    """Service for managing subscriptions and payments"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    # -------------------------
    # Internal helpers
    # -------------------------
    def _get_nested(self, data: Dict[str, Any], path: List[str]) -> Optional[Any]:
        """Safely fetch nested dict value by path"""
        node: Any = data
        for key in path:
            if isinstance(node, dict) and key in node:
                node = node[key]
            else:
                return None
        return node

    def _coalesce(self, *values: Any) -> Optional[Any]:
        """Return the first non-None value"""
        for value in values:
            if value is not None:
                return value
        return None

    def _as_int(self, value: Any) -> Optional[int]:
        try:
            if value is None:
                return None
            return int(value)
        except Exception:
            return None

    def _amount_cents_from_payment(self, payment_data: Dict[str, Any]) -> Optional[int]:
        """Derive amount in cents from various Dodo fields."""
        # Prefer explicit minor units if provided
        amount_cents = self._as_int(payment_data.get('amount_cents'))
        if amount_cents is not None:
            return amount_cents
        # Fallback to total_amount (often minor units) if present
        total_amount = self._as_int(payment_data.get('total_amount'))
        if total_amount is not None:
            return total_amount
        # As a last resort, multiply settlement_amount (assumed major units)
        settlement_amount = payment_data.get('settlement_amount')
        try:
            if settlement_amount is not None:
                return int(round(float(settlement_amount) * 100))
        except Exception:
            pass
        return None
    
    async def get_or_create_dodo_customer(self, user_id: str, email: str, name: Optional[str] = None) -> str:
        """Get existing Dodo customer ID or create a new customer"""
        try:
            # Check if user already has a Dodo customer ID
            user_response = self.supabase.table('assessment_users').select('dodo_customer_id').eq('uid', user_id).execute()
            
            if user_response.data and user_response.data[0].get('dodo_customer_id'):
                return user_response.data[0]['dodo_customer_id']
            
            # Create new Dodo customer
            dodo_client = DodoPaymentsClient()
            customer_data = await dodo_client.create_customer(
                email=email,
                name=name,
            )
            
            # FIX: Use 'customer_id' instead of 'id'
            dodo_customer_id = customer_data['customer_id']
            
            # Update user with Dodo customer ID
            self.supabase.table('assessment_users').update({
                'dodo_customer_id': dodo_customer_id,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('uid', user_id).execute()
            
            logger.info(f"Created Dodo customer {dodo_customer_id} for user {user_id}")
            return dodo_customer_id
                
        except Exception as e:
            logger.error(f"Dodo API error: {str(e)}")
            import traceback
            traceback.print_exc()
            logger.error(f"Failed to get/create Dodo customer for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize customer account: {str(e)}")
    
    async def create_checkout_session(self, user_id: str, plan_type: str, 
                                    metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a checkout session for subscription"""
        try:
            # Validate plan type
            if plan_type not in ['monthly', 'yearly']:
                raise HTTPException(status_code=400, detail="Invalid plan type")
            
            # Get user details
            user_response = self.supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
            if not user_response.data:
                raise HTTPException(status_code=404, detail="User not found")
            
            user_data = user_response.data[0]
            email = user_data['email']
            name = user_data.get('display_name')
            
            # Get or create Dodo customer
            dodo_customer_id = await self.get_or_create_dodo_customer(user_id, email, name)
            
            # Map plan type to product ID (allow env override)
            product_id_map = {
                'monthly': os.environ.get('DODO_PAYMENTS_PRODUCT_ID_MONTHLY', 'pdt_LOhuvCIgbeo2qflVuaAty'),
                'yearly': os.environ.get('DODO_PAYMENTS_PRODUCT_ID_YEARLY', 'pdt_R9BBFdK801119u9r3r6jyL')
            }
            product_id = product_id_map[plan_type]
            logger.info(f"Using Dodo product_id for {plan_type}: {product_id}")
            
            # Create checkout session
            dodo_client = DodoPaymentsClient()
            try:
                session_data = await dodo_client.create_checkout_session(
                    product_id=product_id,
                    customer_id=dodo_customer_id,
                    return_url='https://englishgpt.everythingenglish.xyz/dashboard/payment-success',
                    metadata={
                        "user_id": user_id,
                        "plan_type": plan_type,
                        **(metadata or {})
                    }
                )
                return {
                    "checkout_url": session_data['payment_link'],
                    "subscription_id": session_data.get('subscription_id'),
                    "customer_id": dodo_customer_id
                }
            except Exception as e:
                # Fallback: build a static checkout link that lets Dodo collect billing/discounts
                base_link = f"https://test.checkout.dodopayments.com/buy/{product_id}"
                query = {
                    "redirect_url": 'https://englishgpt.everythingenglish.xyz/dashboard/payment-success',
                    "email": email,
                    "fullName": name or email.split('@')[0],
                    "showDiscounts": "true",
                    "quantity": 1,
                    # Pass metadata via query to associate after redirect
                    "metadata_userId": user_id,
                    "metadata_planType": plan_type,
                }
                checkout_url = f"{base_link}?{urlencode(query)}"
                logger.warning(f"Falling back to static checkout link due to API error: {e}")
                return {
                    "checkout_url": checkout_url,
                    "subscription_id": None,
                    "customer_id": dodo_customer_id,
                    "link_type": "static"
                }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to create checkout session for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to create checkout session")
    
    async def get_subscription_status(self, user_id: str) -> SubscriptionStatus:
        """Get current subscription status for a user"""
        try:
            # Get user's active subscription from database
            subscription_response = self.supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).in_('status', ['active', 'trialing']).order('created_at', desc=True).limit(1).execute()
            
            if not subscription_response.data:
                # Fallback: try to fetch latest status from Dodo if webhook is delayed
                try:
                    user_row = self.supabase.table('assessment_users').select('dodo_customer_id').eq('uid', user_id).limit(1).execute()
                    dodo_customer_id = (user_row.data or [{}])[0].get('dodo_customer_id')
                    if dodo_customer_id:
                        dodo = DodoPaymentsClient()
                        api_subs = await dodo.list_subscriptions(dodo_customer_id, limit=5)
                        items = api_subs.get('data') if isinstance(api_subs, dict) else api_subs
                        for sub in items or []:
                            try:
                                await self._handle_subscription_update(user_id, {
                                    'id': sub.get('subscription_id') or sub.get('id'),
                                    'customer_id': dodo_customer_id,
                                    'product_id': sub.get('product_id'),
                                    'status': sub.get('status'),
                                    'current_period_start': sub.get('previous_billing_date') or sub.get('current_period_start'),
                                    'current_period_end': sub.get('next_billing_date') or sub.get('current_period_end'),
                                    'cancel_at_period_end': sub.get('cancel_at_next_billing_date', False),
                                    'trial_start': None,
                                    'trial_end': None,
                                    'metadata': sub.get('metadata', {})
                                })
                            except Exception:
                                continue
                        # Re-query
                        subscription_response = self.supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).in_('status', ['active', 'trialing']).order('created_at', desc=True).limit(1).execute()
                except Exception:
                    pass
                if not subscription_response.data:
                    return SubscriptionStatus(has_active_subscription=False)
            
            subscription = subscription_response.data[0]
            current_period_end = datetime.fromisoformat(subscription['current_period_end'].replace('Z', '+00:00'))
            
            # Check if subscription is still valid
            if current_period_end <= datetime.now(timezone.utc):
                return SubscriptionStatus(has_active_subscription=False)
            
            # Calculate trial days remaining if in trial
            trial_days_remaining = None
            if subscription['trial_end']:
                trial_end = datetime.fromisoformat(subscription['trial_end'].replace('Z', '+00:00'))
                if trial_end > datetime.now(timezone.utc):
                    trial_days_remaining = (trial_end - datetime.now(timezone.utc)).days
            
            return SubscriptionStatus(
                has_active_subscription=True,
                subscription={
                    "id": subscription['id'],
                    "plan_type": subscription['plan_type'],
                    "status": subscription['status'],
                    "current_period_end": subscription['current_period_end'],
                    "cancel_at_period_end": subscription['cancel_at_period_end'],
                    "trial_end": subscription.get('trial_end')
                },
                trial_days_remaining=trial_days_remaining,
                next_billing_date=subscription['current_period_end']
            )
            
        except Exception as e:
            logger.error(f"Failed to get subscription status for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to get subscription status")
    
    async def cancel_subscription(self, user_id: str, subscription_id: str, 
                                cancel_at_period_end: bool = True) -> Dict[str, Any]:
        """Cancel a user's subscription"""
        try:
            # Verify subscription belongs to user
            subscription_response = self.supabase.table('dodo_subscriptions').select('*').eq('id', subscription_id).eq('user_id', user_id).execute()
            
            if not subscription_response.data:
                raise HTTPException(status_code=404, detail="Subscription not found")
            
            subscription = subscription_response.data[0]
            dodo_subscription_id = subscription['dodo_subscription_id']
            
            # Cancel subscription with Dodo Payments
            dodo_client = DodoPaymentsClient()
            result = await dodo_client.cancel_subscription(
                subscription_id=dodo_subscription_id,
                cancel_at_period_end=cancel_at_period_end
            )
            
            # Update local database
            update_data = {
                'cancel_at_period_end': cancel_at_period_end,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            if not cancel_at_period_end:
                update_data['status'] = 'cancelled'
                update_data['cancelled_at'] = datetime.utcnow().isoformat()
            
            self.supabase.table('dodo_subscriptions').update(update_data).eq('id', subscription_id).execute()
            
            # Sync user subscription status
            await self._sync_user_subscription_status(user_id)
            
            effective_date = subscription['current_period_end'] if cancel_at_period_end else datetime.utcnow().isoformat()
            
            return {
                "success": True,
                "message": "Subscription cancelled successfully",
                "effective_date": effective_date,
                "cancel_at_period_end": cancel_at_period_end
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to cancel subscription for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to cancel subscription")
    
    async def reactivate_subscription(self, user_id: str, subscription_id: str) -> Dict[str, Any]:
        """Reactivate a cancelled subscription"""
        try:
            # Verify subscription belongs to user
            subscription_response = self.supabase.table('dodo_subscriptions').select('*').eq('id', subscription_id).eq('user_id', user_id).execute()
            
            if not subscription_response.data:
                raise HTTPException(status_code=404, detail="Subscription not found")
            
            subscription = subscription_response.data[0]
            dodo_subscription_id = subscription['dodo_subscription_id']
            
            # Reactivate subscription with Dodo Payments
            dodo_client = DodoPaymentsClient()
            result = await dodo_client.reactivate_subscription(dodo_subscription_id)
            
            # Update local database
            self.supabase.table('dodo_subscriptions').update({
                'cancel_at_period_end': False,
                'cancelled_at': None,
                'status': 'active',
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', subscription_id).execute()
            
            # Sync user subscription status
            await self._sync_user_subscription_status(user_id)
            
            return {
                "success": True,
                "message": "Subscription reactivated successfully",
                "subscription": subscription
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to reactivate subscription for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to reactivate subscription")
    
    async def create_customer_portal_session(self, user_id: str) -> Dict[str, Any]:
        """Create a customer portal session for payment method management"""
        try:
            # Get user's Dodo customer ID
            user_response = self.supabase.table('assessment_users').select('dodo_customer_id, email, display_name').eq('uid', user_id).execute()
            
            if not user_response.data:
                raise HTTPException(status_code=404, detail="User not found")
            
            user_data = user_response.data[0]
            dodo_customer_id = user_data.get('dodo_customer_id')
            
            if not dodo_customer_id:
                # Create customer if doesn't exist
                dodo_customer_id = await self.get_or_create_dodo_customer(
                    user_id, user_data['email'], user_data.get('display_name')
                )
            
            # Create portal session
            dodo_client = DodoPaymentsClient()
            session_data = await dodo_client.create_customer_portal_session(dodo_customer_id)
            
            # Save portal session to database
            session_id = str(uuid.uuid4())
            self.supabase.table('dodo_customer_portal_sessions').insert({
                'id': session_id,
                'user_id': user_id,
                'dodo_session_id': session_data['id'],
                'session_url': session_data['url'],
                'expires_at': session_data['expires_at'],
                'created_at': datetime.utcnow().isoformat()
            }).execute()
            
            return {
                "portal_url": session_data['url'],
                "session_id": session_data['id']
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to create customer portal session for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to create customer portal session")
    
    async def get_billing_history(self, user_id: str, limit: int = 50) -> List[BillingHistoryItem]:
        """Get billing history for a user"""
        try:
            # Get payments from database
            payments_response = self.supabase.table('dodo_payments').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
            
            billing_history = []
            for payment in payments_response.data:
                billing_history.append(BillingHistoryItem(
                    id=payment['id'],
                    amount_cents=payment['amount_cents'],
                    currency=payment['currency'],
                    status=payment['status'],
                    payment_method_type=payment.get('payment_method_type'),
                    created_at=payment['created_at'],
                    failure_reason=payment.get('failure_reason')
                ))
            
            return billing_history
            
        except Exception as e:
            logger.error(f"Failed to get billing history for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to get billing history")
    
    async def _sync_user_subscription_status(self, user_id: str) -> None:
        """Sync user's subscription status in assessment_users table"""
        try:
            # Use the database function to sync status
            self.supabase.rpc('sync_user_subscription_status', {'user_uid': user_id}).execute()
            
        except Exception as e:
            logger.error(f"Failed to sync subscription status for user {user_id}: {e}")
            # Don't raise exception as this is a background operation
    
    async def _check_user_subscription_access(self, user_id: str) -> bool:
        """Check if user has active subscription access"""
        try:
            # Use the database function to check subscription
            result = self.supabase.rpc('user_has_active_subscription', {'user_uid': user_id}).execute()
            
            if result.data:
                return result.data
            
            # Fallback: check manually
            subscription_response = self.supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).in_('status', ['active', 'trialing']).order('created_at', desc=True).limit(1).execute()
            
            if not subscription_response.data:
                return False
            
            subscription = subscription_response.data[0]
            current_period_end = datetime.fromisoformat(subscription['current_period_end'].replace('Z', '+00:00'))
            
            # Check if subscription is still valid
            return current_period_end > datetime.now(timezone.utc)
            
        except Exception as e:
            logger.error(f"Failed to check subscription access for user {user_id}: {e}")
            # Default to no access on error for security
            return False
    
    async def handle_subscription_webhook(self, event_type: str, subscription_data: Dict[str, Any]) -> None:
        """Handle subscription-related webhook events"""
        try:
            subscription_id = self._coalesce(
                subscription_data.get('id'),
                subscription_data.get('subscription_id')
            )
            customer_id = self._coalesce(
                subscription_data.get('customer_id'),
                self._get_nested(subscription_data, ['customer', 'customer_id']),
                self._get_nested(subscription_data, ['customer', 'id'])
            )
            
            # Find user by customer ID
            user_response = self.supabase.table('assessment_users').select('uid').eq('dodo_customer_id', customer_id).execute()
            
            if not user_response.data:
                logger.warning(f"No user found for Dodo customer {customer_id}")
                return
            
            user_id = user_response.data[0]['uid']
            
            if event_type in ['subscription.created', 'subscription.updated', 'subscription.activated', 'subscription.active', 'subscription.renewed']:
                await self._handle_subscription_update(user_id, subscription_data)
            elif event_type == 'subscription.cancelled':
                await self._handle_subscription_cancelled(user_id, subscription_data)
            elif event_type == 'subscription.expired':
                await self._handle_subscription_expired(user_id, subscription_data)
            elif event_type == 'subscription.trial_ended':
                await self._handle_trial_ended(user_id, subscription_data)
            elif event_type == 'subscription.on_hold':
                try:
                    self.supabase.table('dodo_subscriptions').update({
                        'status': 'on_hold',
                        'updated_at': datetime.utcnow().isoformat()
                    }).eq('dodo_subscription_id', subscription_id).execute()
                except Exception:
                    pass
            
            # Sync user status after any subscription change
            await self._sync_user_subscription_status(user_id)
            
        except Exception as e:
            logger.error(f"Failed to handle subscription webhook {event_type}: {e}")
            raise
    
    async def _handle_subscription_update(self, user_id: str, subscription_data: Dict[str, Any]) -> None:
        """Handle subscription creation or update"""
        try:
            # Parse subscription data with robust key handling
            dodo_subscription_id = self._coalesce(
                subscription_data.get('id'),
                subscription_data.get('subscription_id')
            )
            if not dodo_subscription_id:
                logger.error("Subscription update missing subscription ID")
                return
            
            # Determine plan type from product ID
            plan_type = 'monthly'  # default
            product_id = self._coalesce(
                subscription_data.get('product_id'),
                self._get_nested(subscription_data, ['product', 'product_id']),
                self._get_nested(subscription_data, ['product', 'id'])
            ) or ''
            if 'yearly' in product_id.lower() or 'annual' in product_id.lower():
                plan_type = 'yearly'
            
            subscription_record = {
                'user_id': user_id,
                'dodo_subscription_id': dodo_subscription_id,
                'dodo_product_id': product_id,
                'dodo_customer_id': self._coalesce(
                    subscription_data.get('customer_id'),
                    self._get_nested(subscription_data, ['customer', 'customer_id']),
                    self._get_nested(subscription_data, ['customer', 'id'])
                ),
                'status': subscription_data.get('status', 'active'),
                'plan_type': plan_type,
                'current_period_start': self._coalesce(
                    subscription_data.get('current_period_start'),
                    self._get_nested(subscription_data, ['current_period', 'start']),
                    subscription_data.get('previous_billing_date')
                ),
                'current_period_end': self._coalesce(
                    subscription_data.get('current_period_end'),
                    self._get_nested(subscription_data, ['current_period', 'end']),
                    subscription_data.get('next_billing_date')
                ),
                'cancel_at_period_end': subscription_data.get('cancel_at_period_end', False),
                'trial_start': subscription_data.get('trial_start'),
                'trial_end': subscription_data.get('trial_end'),
                'metadata': subscription_data.get('metadata', {}),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # If critical fields missing, fetch fresh subscription details from Dodo
            if not subscription_record['current_period_end'] or not subscription_record['status']:
                try:
                    dodo_client = DodoPaymentsClient()
                    fresh = await dodo_client.get_subscription(dodo_subscription_id)
                    subscription_record['dodo_product_id'] = subscription_record['dodo_product_id'] or fresh.get('product_id')
                    subscription_record['status'] = subscription_record['status'] or fresh.get('status', 'active')
                    subscription_record['current_period_start'] = subscription_record['current_period_start'] or self._coalesce(
                        fresh.get('current_period_start'), self._get_nested(fresh, ['current_period', 'start'])
                    )
                    subscription_record['current_period_end'] = subscription_record['current_period_end'] or self._coalesce(
                        fresh.get('current_period_end'), self._get_nested(fresh, ['current_period', 'end'])
                    )
                except Exception as e:
                    logger.warning(f"Could not fetch subscription {dodo_subscription_id} from Dodo: {e}")
            
            # Upsert subscription record
            existing_sub = self.supabase.table('dodo_subscriptions').select('id').eq('dodo_subscription_id', dodo_subscription_id).execute()
            
            if existing_sub.data:
                self.supabase.table('dodo_subscriptions').update(subscription_record).eq('dodo_subscription_id', dodo_subscription_id).execute()
            else:
                subscription_record['id'] = str(uuid.uuid4())
                subscription_record['created_at'] = datetime.utcnow().isoformat()
                self.supabase.table('dodo_subscriptions').insert(subscription_record).execute()
            
            logger.info(f"Updated subscription {dodo_subscription_id} for user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to handle subscription update: {e}")
            raise
    
    async def _handle_subscription_cancelled(self, user_id: str, subscription_data: Dict[str, Any]) -> None:
        """Handle subscription cancellation"""
        try:
            dodo_subscription_id = subscription_data['id']
            
            self.supabase.table('dodo_subscriptions').update({
                'status': 'cancelled',
                'cancelled_at': datetime.utcnow().isoformat(),
                'cancel_at_period_end': subscription_data.get('cancel_at_period_end', True),
                'updated_at': datetime.utcnow().isoformat()
            }).eq('dodo_subscription_id', dodo_subscription_id).execute()
            
            logger.info(f"Marked subscription {dodo_subscription_id} as cancelled for user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to handle subscription cancellation: {e}")
            raise
    
    async def _handle_subscription_expired(self, user_id: str, subscription_data: Dict[str, Any]) -> None:
        """Handle subscription expiration"""
        try:
            dodo_subscription_id = subscription_data['id']
            
            self.supabase.table('dodo_subscriptions').update({
                'status': 'expired',
                'updated_at': datetime.utcnow().isoformat()
            }).eq('dodo_subscription_id', dodo_subscription_id).execute()
            
            logger.info(f"Marked subscription {dodo_subscription_id} as expired for user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to handle subscription expiration: {e}")
            raise
    
    async def _handle_trial_ended(self, user_id: str, subscription_data: Dict[str, Any]) -> None:
        """Handle trial period ending"""
        try:
            dodo_subscription_id = subscription_data['id']
            
            # Update subscription status based on whether payment succeeded
            new_status = subscription_data.get('status', 'active')
            
            self.supabase.table('dodo_subscriptions').update({
                'status': new_status,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('dodo_subscription_id', dodo_subscription_id).execute()
            
            logger.info(f"Updated subscription {dodo_subscription_id} after trial ended for user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to handle trial ended: {e}")
            raise
    
    async def handle_payment_webhook(self, event_type: str, payment_data: Dict[str, Any]) -> None:
        """Handle payment-related webhook events"""
        try:
            payment_id = self._coalesce(payment_data.get('id'), payment_data.get('payment_id'))
            subscription_id = self._coalesce(
                payment_data.get('subscription_id'),
                self._get_nested(payment_data, ['subscription', 'id'])
            )
            customer_id = self._coalesce(
                payment_data.get('customer_id'),
                self._get_nested(payment_data, ['customer', 'customer_id']),
                self._get_nested(payment_data, ['customer', 'id'])
            )
            
            # Find user by customer ID
            user_response = self.supabase.table('assessment_users').select('uid').eq('dodo_customer_id', customer_id).execute()
            
            # Fallback: if customer not mapped, try metadata.user_id from payload
            if not user_response.data:
                fallback_user_id = self._get_nested(payment_data, ['metadata', 'user_id'])
                if fallback_user_id:
                    logger.warning(f"No user found for customer {customer_id}; falling back to metadata user_id {fallback_user_id}")
                    user_id = fallback_user_id
                else:
                    logger.warning(f"No user found for Dodo customer {customer_id}")
                    return
            else:
                user_id = user_response.data[0]['uid']
            
            # Find subscription record if payment is subscription-related
            db_subscription_id = None
            if subscription_id:
                sub_response = self.supabase.table('dodo_subscriptions').select('id').eq('dodo_subscription_id', subscription_id).execute()
                if sub_response.data:
                    db_subscription_id = sub_response.data[0]['id']
                else:
                    # Create subscription record if missing, using Dodo API for details
                    try:
                        dodo_client = DodoPaymentsClient()
                        fresh_sub = await dodo_client.get_subscription(subscription_id)
                        # Normalize minimal fields
                        await self._handle_subscription_update(user_id, {
                            'id': subscription_id,
                            'customer_id': customer_id,
                            'product_id': fresh_sub.get('product_id'),
                            'status': fresh_sub.get('status', 'active'),
                            'current_period_start': fresh_sub.get('current_period_start') or self._get_nested(fresh_sub, ['current_period', 'start']),
                            'current_period_end': fresh_sub.get('current_period_end') or self._get_nested(fresh_sub, ['current_period', 'end']),
                            'cancel_at_period_end': fresh_sub.get('cancel_at_period_end', False),
                            'trial_start': fresh_sub.get('trial_start'),
                            'trial_end': fresh_sub.get('trial_end'),
                            'metadata': fresh_sub.get('metadata', {})
                        })
                        # fetch ID again
                        sub_response = self.supabase.table('dodo_subscriptions').select('id').eq('dodo_subscription_id', subscription_id).execute()
                        if sub_response.data:
                            db_subscription_id = sub_response.data[0]['id']
                    except Exception as e:
                        logger.warning(f"Could not create subscription {subscription_id} from payment: {e}")
            
            # Create or update payment record
            payment_record = {
                'user_id': user_id,
                'dodo_payment_id': payment_id,
                'subscription_id': db_subscription_id,
                'amount_cents': self._amount_cents_from_payment(payment_data) or 0,
                'currency': self._coalesce(payment_data.get('currency'), payment_data.get('settlement_currency'), 'USD'),
                'status': payment_data.get('status'),
                'payment_method_type': self._coalesce(payment_data.get('payment_method_type'), payment_data.get('payment_method'), payment_data.get('card_network')),
                'failure_reason': self._coalesce(payment_data.get('failure_reason'), payment_data.get('error_message'), payment_data.get('error_code')),
                'metadata': payment_data.get('metadata', {}),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Upsert payment record
            existing_payment = self.supabase.table('dodo_payments').select('id').eq('dodo_payment_id', payment_id).execute()
            
            if existing_payment.data:
                self.supabase.table('dodo_payments').update(payment_record).eq('dodo_payment_id', payment_id).execute()
            else:
                payment_record['id'] = str(uuid.uuid4())
                payment_record['created_at'] = datetime.utcnow().isoformat()
                self.supabase.table('dodo_payments').insert(payment_record).execute()
            
            logger.info(f"Processed payment {payment_id} for user {user_id}")

            # On payment success, ensure user's subscription status is synced
            if payment_record['status'] == 'succeeded':
                await self._sync_user_subscription_status(user_id)
            
        except Exception as e:
            logger.error(f"Failed to handle payment webhook {event_type}: {e}")
            raise