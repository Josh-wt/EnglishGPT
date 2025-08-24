# Webhook Processing Fixes - current_plan Field

## Summary
Fixed webhook processing to correctly update the `current_plan` field in the database instead of incorrect field names. The database uses `current_plan` with values 'free' or 'unlimited' to track user subscription levels.

## Changes Made

### 1. webhook_processor.py
- Updated all `_update_user_subscription_info` calls to set `current_plan` field:
  - `subscription.created`: Sets `current_plan = 'unlimited'`
  - `subscription.cancelled`: Sets `current_plan = 'free'`
  - `subscription.expired`: Sets `current_plan = 'free'`
  - `subscription.reactivated`: Sets `current_plan = 'unlimited'`
  - `subscription.paused`: Sets `current_plan = 'free'`
  - `subscription.resumed`: Sets `current_plan = 'unlimited'`
  - `subscription.updated`: Sets `current_plan = 'unlimited'` if active, else `'free'`

- Fixed method calls to subscription_service to use correct internal handler methods:
  - `activate_subscription` → `_handle_subscription_activation`
  - `cancel_subscription` → `_handle_subscription_cancelled`
  - `renew_subscription` → `_handle_payment_succeeded`
  - `handle_failed_payment` → `_handle_payment_failed`
  - `update_subscription_status` → `_handle_subscription_update`
  - `reactivate_subscription` → `_handle_subscription_activation`
  - `expire_subscription` → `_handle_subscription_expired`

### 2. subscription_service.py
- Already correctly updates `current_plan` in `_sync_user_subscription_status` method
- Sets `current_plan = 'unlimited'` for active subscriptions
- Sets `current_plan = 'free'` when no active subscription

### 3. server.py
- Fixed analytics access check to use `current_plan == 'unlimited'` instead of checking for 'pro' or 'genius' plans

### 4. Frontend (App.js)
- Already correctly uses `currentPlan` from `current_plan` field
- Checks `currentPlan === 'unlimited'` for access control

## Database Schema
The `assessment_users` table has:
- `current_plan` (text): Values are 'free' or 'unlimited'
- This is the primary field for subscription access control

## Webhook Flow
1. Dodo Payments sends webhook to Node.js service
2. Node.js service verifies and forwards to Python backend
3. Python backend processes webhook and updates user's `current_plan`:
   - Payment succeeds → `current_plan = 'unlimited'`
   - Subscription cancelled → `current_plan = 'free'`
   - Subscription expired → `current_plan = 'free'`

## Testing
Webhook events now correctly:
- Grant unlimited access when payment succeeds
- Revoke access (set to free) when subscription is cancelled or expires
- Maintain single source of truth in `current_plan` field