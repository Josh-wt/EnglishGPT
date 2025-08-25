# Billing History Debug Summary

## Changes Made

### 1. Enhanced Debugging in subscription_service.py
- Added extensive logging to `get_billing_history()` method
- Now logs user existence check, raw database responses, and payment processing
- Changed error handling to re-raise exceptions for proper 500 status codes
- Added fallback field mappings for payment data

### 2. Enhanced Subscription Status Debugging
- Added detailed logging to `get_subscription_status()` method
- Logs user data, subscription searches, and synthetic subscription creation

### 3. Created Diagnostic Scripts

#### restart_api_with_debug.sh
- Restarts the API container with new debugging code
- Shows recent logs after restart

#### test_billing_endpoints.py
- Tests all subscription-related endpoints
- Shows subscription status, billing history, and user info
- Helps identify which specific endpoint is failing

#### check_database_schema.py
- Verifies database tables exist (dodo_payments, dodo_subscriptions)
- Provides SQL to create missing tables if needed
- Shows sample data structure for debugging

## How to Use

1. **On the server, restart the API with debugging:**
   ```bash
   cd /opt/englishgpt/backend
   docker compose restart api
   ```

2. **Monitor the logs:**
   ```bash
   docker logs -f englishgpt-api
   ```

3. **Test the endpoints (from server):**
   ```bash
   cd /opt/englishgpt/backend
   python3 /workspace/test_billing_endpoints.py
   ```

4. **Check database schema (from server):**
   ```bash
   cd /opt/englishgpt/backend
   python3 /workspace/check_database_schema.py
   ```

## Expected Debug Output

When accessing the subscription tab, you should now see:
- `=== BILLING HISTORY DEBUG START ===`
- User existence check results
- Raw database query responses
- Number of payments found
- Any subscription details if no payments exist
- Detailed error messages with stack traces if failures occur

## Common Issues and Fixes

### Issue 1: Missing dodo_payments table
**Fix:** Run the CREATE TABLE SQL provided by check_database_schema.py in Supabase

### Issue 2: No payment records for user
**Expected:** Returns empty array, UI shows "No billing history available"

### Issue 3: Column name mismatches
**Fixed:** Added fallback mappings (amount_cents vs amount, etc.)

### Issue 4: User has no Dodo customer ID
**Expected:** Shows subscription status but may have empty billing history

## Next Steps

After restarting the API:
1. Access the subscription tab in the UI
2. Check docker logs for debug output
3. Identify the specific error from the detailed logs
4. The debug output will show exactly where the issue occurs