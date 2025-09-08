#!/bin/bash

# Production deployment script for API endpoint fix
set -e

echo "🚀 Deploying API endpoint fix to production server..."
echo ""

echo "📋 Changes being deployed:"
echo "  ✅ Fixed MCP function calls → Use dodo_service instead"
echo "  ✅ Added /api prefix to Dodo Payments base URL"
echo "  ✅ Updated all API endpoints to correct paths"
echo ""

# Configuration - Update these variables for your server
PRODUCTION_SERVER="ubuntu@your-production-server"  # Update this!
PROJECT_PATH="/opt/englishgpt"  # Update this!

echo "📤 Files to copy:"
echo "  - backend/routes/payments.py"
echo "  - backend/services/dodo_service.py"
echo "  - backend/services/mcp_dodo_service.py"
echo ""

echo "🔧 Manual deployment steps:"
echo ""
echo "1. Copy the updated files to your production server:"
echo "   scp backend/routes/payments.py $PRODUCTION_SERVER:$PROJECT_PATH/backend/routes/"
echo "   scp backend/services/dodo_service.py $PRODUCTION_SERVER:$PROJECT_PATH/backend/services/"
echo "   scp backend/services/mcp_dodo_service.py $PRODUCTION_SERVER:$PROJECT_PATH/backend/services/"
echo ""
echo "2. SSH into your production server:"
echo "   ssh $PRODUCTION_SERVER"
echo ""
echo "3. Navigate to project and rebuild backend:"
echo "   cd $PROJECT_PATH/backend"
echo "   docker stop englishgpt-api || true"
echo "   docker rm englishgpt-api || true"
echo "   docker build -t englishgpt-backend ."
echo "   docker run -d --name englishgpt-api -p 5000:5000 --env-file .env englishgpt-backend"
echo ""
echo "4. Verify the deployment:"
echo "   docker logs englishgpt-api"
echo "   docker ps | grep englishgpt-api"
echo ""
echo "5. Test the API endpoint:"
echo "   curl -X POST https://englishgpt.everythingenglish.xyz/api/payments/subscriptions \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"plan_type\": \"monthly\", \"customer\": {\"email\": \"test@example.com\", \"name\": \"Test User\"}, \"billing\": {\"country\": \"US\", \"city\": \"New York\", \"state\": \"NY\", \"street\": \"123 Main St\", \"zipcode\": \"10001\"}}'"
echo ""

echo "🔍 Expected changes:"
echo "  ❌ Before: https://test.dodopayments.com/subscriptions (404 Not Found)"
echo "  ✅ After:  https://test.dodopayments.com/api/subscriptions (Should work)"
echo ""

echo "📝 What was fixed:"
echo "  1. Removed direct MCP function calls that don't exist in production"
echo "  2. Added /api prefix to Dodo Payments base URL"
echo "  3. Updated all API endpoints to use dodo_service instead of mcp_dodo_service"
echo ""

echo "🎯 This should resolve the 404 error you're seeing!"
