#!/bin/bash

echo "🚀 Deploying Webhook Fix and Success Page..."

# Stop and remove existing backend container
echo "📦 Stopping existing backend container..."
docker stop englishgpt-api 2>/dev/null || true
docker rm englishgpt-api 2>/dev/null || true

# Build new backend image
echo "🔨 Building backend with webhook fixes..."
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
    echo "🔧 Fixes applied:"
    echo "   - Fixed webhook endpoint routing (/api/webhooks/dodo)"
    echo "   - Separated webhook router from payments router"
    echo "   - Subscription creation working (200 OK)"
    echo ""
    echo "🎯 Expected results:"
    echo "   - Webhooks: 200 OK instead of 405 Method Not Allowed"
    echo "   - Payment success page should load properly"
    echo ""
    echo "🔍 Monitor logs: docker logs -f englishgpt-api"
else
    echo "❌ Backend container failed to start"
    docker logs englishgpt-api
    exit 1
fi

echo "🎉 Webhook fixes deployed!"
