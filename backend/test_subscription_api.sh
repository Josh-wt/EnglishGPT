#!/bin/bash

# Test script for subscription endpoints
# Replace BASE_URL with your actual server URL

BASE_URL="https://englishgpt.everythingenglish.xyz/api"
USER_ID="08ac58a5-0cfe-4f69-a4d1-e50d9d9b678e"

echo "=========================================="
echo "Testing Subscription Endpoints"
echo "=========================================="
echo ""

# Test 1: Create subscription checkout
echo "1. Testing POST /subscriptions/create"
echo "--------------------------------------"
curl -X POST "${BASE_URL}/subscriptions/create" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "monthly",
    "user_id": "'${USER_ID}'"
  }' | python3 -m json.tool
echo ""
echo ""

# Test 2: Get subscription status
echo "2. Testing GET /subscriptions/status/{user_id}"
echo "-----------------------------------------------"
curl -X GET "${BASE_URL}/subscriptions/status/${USER_ID}" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo ""
echo ""

# Test 3: Get subscription plans
echo "3. Testing GET /subscriptions/plans"
echo "------------------------------------"
curl -X GET "${BASE_URL}/subscriptions/plans" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo ""
echo ""

# Test 4: Cancel subscription
echo "4. Testing POST /subscriptions/action (cancel)"
echo "-----------------------------------------------"
curl -X POST "${BASE_URL}/subscriptions/action" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'${USER_ID}'",
    "action": "cancel"
  }' | python3 -m json.tool
echo ""
echo ""

# Test 5: Reactivate subscription
echo "5. Testing POST /subscriptions/action (reactivate)"
echo "---------------------------------------------------"
curl -X POST "${BASE_URL}/subscriptions/action" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'${USER_ID}'",
    "action": "reactivate"
  }' | python3 -m json.tool
echo ""
echo ""

echo "=========================================="
echo "All tests completed!"
echo "=========================================="