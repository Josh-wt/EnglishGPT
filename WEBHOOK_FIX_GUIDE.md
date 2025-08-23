# Dodo Payments Webhook Signature Validation Fix

## Problem Summary
Webhook signature validation was failing, preventing users from receiving premium access after payment.

## Solutions Implemented

### 1. Enhanced Signature Validation (dodo_payments_client.py)
- Now tries multiple signing formats:
  - `timestamp.payload` (standard webhook format)
  - `payload_only` (without timestamp)
  - `timestamp:payload` (alternative separator)
- Supports both base64 and hex encoding
- Properly extracts signature from `v1,` prefix format

### 2. Temporary Bypass Option
For testing while debugging signature issues:
```bash
# Add to .env file
DODO_BYPASS_WEBHOOK_VALIDATION=true
```
⚠️ **WARNING**: Only use this for testing! Remove in production.

### 3. Debug Endpoint
Test webhook signatures with:
```bash
POST /api/debug/webhook-signature-test
```
This will show which signature format matches.

### 4. Enhanced Logging
- Logs all webhook headers
- Shows signature prefixes for debugging
- Indicates which validation format succeeded

## Quick Fix Steps

### Option 1: Enable Bypass (Immediate Fix)
1. Add to your `.env` file:
   ```
   DODO_BYPASS_WEBHOOK_VALIDATION=true
   ```
2. Restart the backend
3. Test a payment - users should now receive premium access
4. Monitor logs to debug the signature format

### Option 2: Fix Webhook Secret
1. Verify your webhook secret in Dodo Payments dashboard
2. Update `.env` file:
   ```
   DODO_PAYMENTS_WEBHOOK_KEY=your_actual_webhook_secret_here
   ```
3. Ensure the secret matches exactly (no extra spaces)
4. Restart the backend

### Option 3: Debug Signature Format
1. Make a test payment
2. Check logs for "All webhook headers"
3. Look for the signature and timestamp headers
4. Use the debug endpoint to test different formats
5. Update validation logic if needed

## Testing Webhook Validation

### Manual Test
```bash
# Test with your actual webhook data
curl -X POST https://your-domain/api/debug/webhook-signature-test \
  -H "webhook-signature: v1,YOUR_SIGNATURE" \
  -H "webhook-timestamp: TIMESTAMP" \
  -H "Content-Type: application/json" \
  -d '{"your": "webhook", "payload": "here"}'
```

### Check Logs
```bash
# View webhook validation logs
docker logs your-backend-container 2>&1 | grep -i webhook
```

## Production Checklist
- [ ] Remove `DODO_BYPASS_WEBHOOK_VALIDATION=true` from .env
- [ ] Verify correct `DODO_PAYMENTS_WEBHOOK_KEY` is set
- [ ] Test webhook validation is working
- [ ] Monitor logs for any validation failures
- [ ] Remove debug endpoints if not needed

## Common Issues

### Issue: "Invalid signature format"
**Solution**: The signature extractor now handles `v1,`, `v1=`, and `v1:` prefixes.

### Issue: "Webhook timestamp too old"
**Solution**: 5-minute tolerance window is configured. Check server time sync.

### Issue: "Missing signature or timestamp"
**Solution**: Enhanced header detection checks multiple header names:
- `webhook-signature`, `x-dodo-signature`, `dodo-signature`, `signature`
- `webhook-timestamp`, `x-dodo-timestamp`, `dodo-timestamp`, `timestamp`

## Support
If issues persist after trying these fixes:
1. Enable bypass for immediate fix
2. Collect webhook logs with debug mode
3. Contact Dodo Payments support with the logs
