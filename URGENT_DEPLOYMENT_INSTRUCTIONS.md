# 🚨 URGENT: Deploy Dodo Payments URL Fix

## Problem
The backend is calling `https://test.dodopayments.com/subscriptions` which returns 404. 
The Dodo Payments API expects endpoints WITHOUT the `/api` prefix.

## Solution Applied
Fixed `backend/services/dodo_service.py` to use the base URL directly without appending `/api`.

## Deployment Commands (Run on Production Server)

```bash
# SSH to production server first, then run these commands:

cd /opt/englishgpt
git pull origin main

# Stop current backend
docker stop englishgpt-api
docker rm englishgpt-api

# Rebuild with the fix
cd backend
docker build -t englishgpt-backend .

# Start with corrected URLs
docker run -d \
  --name englishgpt-api \
  -p 5000:5000 \
  --env-file .env \
  englishgpt-backend

# Check if running
docker ps | grep englishgpt-api

# Test the fix
curl -X GET https://englishgpt.everythingenglish.xyz/api/payments/health
```

## What This Fixes
- ❌ Before: `https://test.dodopayments.com/api/subscriptions` (404 error)
- ✅ After: `https://test.dodopayments.com/subscriptions` (correct endpoint)

## Verification
After deployment, test subscription creation. The 404 error should be resolved.
