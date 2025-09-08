#!/bin/bash

echo "🚀 Deploying Endpoint and Product ID fixes..."

# Stop and remove existing backend container
echo "📦 Stopping existing backend container..."
docker stop englishgpt-api 2>/dev/null || true
docker rm englishgpt-api 2>/dev/null || true

# Build new backend image
echo "🔨 Building backend with endpoint fixes..."
cd /opt/englishgpt/backend
docker build -t englishgpt-backend .

# Run new backend container
echo "▶️  Starting backend container..."
docker run -d \
  --name englishgpt-api \
  -p 5000:5000 \
  --env-file .env \
  englishgpt-backend

# Wait for container to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Check if container is running
if docker ps | grep -q englishgpt-api; then
    echo "✅ Backend container is running"
    echo ""
    echo "🔧 Changes applied:"
    echo "   - Removed /api prefix from base URL"
    echo "   - Added product_id cleaning (strip whitespace)"
    echo "   - Enhanced debugging for product_id"
    echo ""
    echo "📊 Expected API calls:"
    echo "   - URL: https://test.dodopayments.com/subscriptions"
    echo "   - Clean product_id without tab characters"
    echo ""
    echo "🔍 Monitor logs: docker logs -f englishgpt-api"
else
    echo "❌ Backend container failed to start"
    docker logs englishgpt-api
    exit 1
fi

echo "🎉 Endpoint fixes deployed! Test subscription creation now."
