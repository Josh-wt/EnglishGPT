#!/bin/bash

# Production deployment script for MCP fix
set -e

echo "🚀 Deploying MCP fix to production server..."

# Configuration - Update these variables for your server
PRODUCTION_SERVER="ubuntu@ip-172-26-8-226"  # Update with your server details
PROJECT_PATH="/opt/englishgpt"  # Update with your project path on the server

echo "📋 Deployment Configuration:"
echo "  Server: $PRODUCTION_SERVER"
echo "  Project Path: $PROJECT_PATH"
echo ""

# Copy updated files to production server
echo "📤 Copying updated backend files to production..."

scp backend/routes/payments.py $PRODUCTION_SERVER:$PROJECT_PATH/backend/routes/
scp backend/services/dodo_service.py $PRODUCTION_SERVER:$PROJECT_PATH/backend/services/
scp backend/services/mcp_dodo_service.py $PRODUCTION_SERVER:$PROJECT_PATH/backend/services/

echo "✅ Files copied successfully"

# Execute deployment commands on production server
echo "🔧 Executing deployment commands on production server..."

ssh $PRODUCTION_SERVER << EOF
    cd $PROJECT_PATH/backend
    
    echo "🛑 Stopping existing backend container..."
    docker stop englishgpt-api || true
    docker rm englishgpt-api || true
    
    echo "🔨 Building new backend image..."
    docker build -t englishgpt-backend .
    
    echo "🚀 Starting new backend container..."
    docker run -d --name englishgpt-api -p 5000:5000 --env-file .env englishgpt-backend
    
    echo "⏳ Waiting for container to start..."
    sleep 5
    
    echo "🔍 Checking container status..."
    docker ps | grep englishgpt-api
    
    echo "📋 Container logs (last 10 lines):"
    docker logs --tail 10 englishgpt-api
    
    echo "✅ Deployment completed!"
EOF

echo ""
echo "🎉 Production deployment finished!"
echo ""
echo "🧪 Test your subscription endpoint:"
echo "curl -X POST https://englishgpt.everythingenglish.xyz/api/payments/subscriptions \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"plan_type\": \"monthly\", \"customer\": {\"email\": \"test@example.com\", \"name\": \"Test User\"}, \"billing\": {\"country\": \"US\", \"city\": \"New York\", \"state\": \"NY\", \"street\": \"123 Main St\", \"zipcode\": \"10001\"}}'"
