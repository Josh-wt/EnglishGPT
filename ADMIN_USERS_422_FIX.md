# 🚨 URGENT: Fix Admin Users 422 Error

## Problem
The admin users page is returning `422 Unprocessable Entity` because the backend expects `min_credits` and `max_credits` as integers, but the frontend sends empty strings when filters are not set.

## Error Details
```
{"detail":[{"type":"int_parsing","loc":["query","min_credits"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":""}]}
```

## Solution Applied
Fixed `backend/routes/admin_dashboard.py` line 266 to accept `min_credits` and `max_credits` as `str` parameters and parse them internally.

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

# Start with corrected parameter handling
docker run -d \
  --name englishgpt-api \
  -p 5000:5000 \
  --env-file .env \
  englishgpt-backend

# Check if running
docker ps | grep englishgpt-api

# Test the fix
curl -H "X-Admin-Session: YOUR_SESSION_TOKEN" \
  "https://englishgpt.everythingenglish.xyz/api/admin/dashboard/users?limit=5&offset=0&min_credits=&max_credits="
```

## What This Fixes
- ❌ Before: `min_credits: Optional[int]` causes 422 error with empty strings
- ✅ After: `min_credits: str` with internal parsing handles empty strings gracefully

## Verification
After deployment, the admin users page should load without 422 errors and display user data properly.
