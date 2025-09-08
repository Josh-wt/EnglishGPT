#!/bin/bash

echo "🚀 Deploying Enhanced Debug Version to Production..."

# Stop and remove existing backend container
echo "📦 Stopping existing backend container..."
docker stop englishgpt-api 2>/dev/null || true
docker rm englishgpt-api 2>/dev/null || true

# Build new backend image with enhanced debugging
echo "🔨 Building backend with extensive debugging..."
cd /opt/englishgpt/backend
docker build -t englishgpt-backend .

# Run new backend container with debug logging
echo "▶️  Starting backend container with enhanced logging..."
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
    echo "✅ Backend container is running with enhanced debugging"
    echo ""
    echo "🔍 To view debug logs, run:"
    echo "   docker logs -f englishgpt-api"
    echo ""
    echo "🧪 Now test subscription creation to see detailed logs"
    echo "📊 Debug logs will show:"
    echo "   - Full API URLs being called"
    echo "   - Request/response details"
    echo "   - Authentication headers (masked)"
    echo "   - Error details from Dodo API"
else
    echo "❌ Backend container failed to start"
    docker logs englishgpt-api
    exit 1
fi

echo ""
echo "🎉 Enhanced debugging deployed!"
echo "🔍 Monitor logs: docker logs -f englishgpt-api"
