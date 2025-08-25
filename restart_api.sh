#!/bin/bash

# Restart API service to apply the billing history fixes
echo "🔄 Restarting API service to apply billing history fixes..."

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    echo "Using docker-compose to restart API..."
    docker-compose restart englishgpt-api
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "Using docker compose to restart API..."
    docker compose restart englishgpt-api
else
    echo "❌ Docker not found. Please restart the API manually."
    echo "The fixes have been applied to:"
    echo "  - backend/subscription_service.py (get_billing_history and _store_payment_record methods)"
    echo "  - backend/server.py (billing history endpoint)"
    exit 1
fi

echo "✅ API restart initiated. Waiting for service to be ready..."
sleep 5

# Test the endpoint
echo "🧪 Testing billing history endpoint..."
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "https://englishgpt.everythingenglish.xyz/api/subscriptions/billing-history?user_id=df3831b0-ff4b-40b9-b296-373eccc272bf&limit=20")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" = "200" ]; then
    echo "✅ Endpoint returned 200 OK"
    echo "Response: $body"
else
    echo "⚠️  Endpoint returned status: $http_status"
    echo "Response: $body"
fi

echo ""
echo "📝 Don't forget to run the SQL cleanup script in Supabase:"
echo "   fix_dodo_payments_table.sql"