# CRITICAL FIX: Users Not Getting Premium Access After Payment

## THE PROBLEM
Users were paying but staying on the free plan because the webhook handler was NOT updating the `current_plan` field - it was only updating `subscription_status` and `subscription_tier`.

## THE ROOT CAUSE
The frontend checks `current_plan` to determine if a user has premium access, but the webhook handlers were not updating this field!

```javascript
// Frontend checks:
user.current_plan === 'premium'  // THIS WAS NEVER BEING SET!
```

## THE FIX APPLIED

### 1. Fixed Payment Webhook Handler
```python
# backend/subscription_service.py - Line 290-298
# CRITICAL: Update user to premium immediately after payment
user_update = {
    'current_plan': 'premium',  # THIS IS THE KEY FIELD
    'subscription_status': 'premium',
    'updated_at': datetime.utcnow().isoformat()
}
self.supabase.table('assessment_users').update(user_update).eq('uid', user_id).execute()
```

### 2. Fixed Subscription Active Handler
```python
# backend/subscription_service.py - Line 354-362
user_update = {
    'current_plan': 'premium',  # THIS IS CRITICAL - the frontend checks current_plan
    'subscription_status': 'premium',
    'subscription_tier': plan_type,
    'updated_at': datetime.utcnow().isoformat()
}
```

### 3. Fixed Subscription Cancelled Handler
```python
# backend/subscription_service.py - Line 406-412
user_update = {
    'current_plan': 'free',  # THIS IS CRITICAL - revert to free plan
    'subscription_status': 'none',
    'subscription_tier': 'free',
    'updated_at': datetime.utcnow().isoformat()
}
```

## NEW DEBUG ENDPOINTS

### 1. Check User's Subscription Status
```bash
GET /api/debug/subscription-status/{user_id}
```
Shows current_plan, subscription_status, subscriptions, and recent payments.

### 2. Manually Confirm Subscription
```bash
POST /api/subscriptions/confirm/{user_id}
```
Immediately grants premium access to a user (for emergency fixes).

## IMMEDIATE ACTION REQUIRED

### For the user who already paid (df3831b0-ff4b-40b9-b296-373eccc272bf):

1. **Option 1: Manual Fix (Immediate)**
   ```bash
   curl -X POST https://englishgpt.everythingenglish.xyz/api/subscriptions/confirm/df3831b0-ff4b-40b9-b296-373eccc272bf
   ```

2. **Option 2: Trigger Webhook Reprocessing**
   - Find the payment webhook in Dodo Payments dashboard
   - Resend the webhook
   - User should now get premium access

3. **Option 3: Direct Database Update**
   ```sql
   UPDATE assessment_users 
   SET current_plan = 'premium',
       subscription_status = 'premium',
       subscription_tier = 'monthly'
   WHERE uid = 'df3831b0-ff4b-40b9-b296-373eccc272bf';
   ```

## TESTING THE FIX

1. **Check current status:**
   ```bash
   curl https://englishgpt.everythingenglish.xyz/api/debug/subscription-status/df3831b0-ff4b-40b9-b296-373eccc272bf
   ```

2. **After fix, verify in frontend:**
   - User should see "Premium" plan
   - Unlimited access should be available
   - Credits should not be deducted

## DEPLOYMENT

1. **Rebuild and deploy backend:**
   ```bash
   docker build -t englishgpt-backend ./backend --no-cache
   docker-compose up -d backend
   ```

2. **Monitor logs:**
   ```bash
   docker logs englishgpt-backend -f | grep -i "current_plan"
   ```

## PREVENTION

### Database Schema Update (Recommended)
Add a trigger to ensure current_plan is always synced:

```sql
CREATE OR REPLACE FUNCTION sync_current_plan()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_status = 'premium' THEN
        NEW.current_plan = 'premium';
    ELSIF NEW.subscription_status IN ('none', 'cancelled') THEN
        NEW.current_plan = 'free';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_current_plan_sync
BEFORE INSERT OR UPDATE ON assessment_users
FOR EACH ROW
EXECUTE FUNCTION sync_current_plan();
```

## CRITICAL NOTES

1. **The frontend ONLY checks `current_plan`** - not `subscription_status`
2. **All webhook handlers MUST update `current_plan`**
3. **The bypass validation is still available if needed**: `DODO_BYPASS_WEBHOOK_VALIDATION=true`
4. **Always test with the debug endpoint after payments**

## SUCCESS CRITERIA

✅ User's `current_plan` = 'premium' after payment
✅ Frontend shows "Premium" status
✅ No credits deducted for premium users
✅ Webhook logs show "Updated user X to premium (current_plan='premium')"
