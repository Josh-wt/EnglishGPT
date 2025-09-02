#!/bin/bash

# Deployment script for EnglishGPT Backend
set -e

echo "🚀 Starting EnglishGPT Backend deployment..."

# Stop and remove existing container if it exists
echo "🛑 Stopping existing container..."
docker stop englishgpt-api 2>/dev/null || true
docker rm englishgpt-api 2>/dev/null || true

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t englishgpt-backend .

# Run the container
echo "🏃 Starting container..."
docker run -d \
    --name englishgpt-api \
    -p 5000:5000 \
    --env-file .env \
    --restart unless-stopped \
    englishgpt-backend

# Wait a moment for the container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Check container status
echo "📋 Container status:"
docker ps | grep englishgpt-api

# Check logs
echo "📋 Recent logs:"
docker logs englishgpt-api --tail 20

# Health check
echo "🏥 Health check:"
if curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Health check failed. Checking logs..."
    docker logs englishgpt-api --tail 50
fi

echo "🎉 Deployment completed!"
