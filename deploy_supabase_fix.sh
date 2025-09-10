#!/bin/bash

# Deploy script to fix Supabase configuration issues
echo "🔧 Fixing Supabase configuration and rebuilding containers..."

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Remove the old container to force rebuild
echo "🗑️ Removing old API container..."
docker rm -f englishgpt-api 2>/dev/null || true

# Rebuild the API container with new configuration
echo "🔨 Rebuilding API container..."
docker-compose build englishgpt-api

# Start the services
echo "🚀 Starting services..."
docker-compose up -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check container logs
echo "📋 Checking API container logs..."
docker logs englishgpt-api --tail 20

# Test the health endpoint
echo "🏥 Testing health endpoint..."
curl -f http://localhost:5000/api/health || echo "❌ Health check failed"

echo "✅ Deployment complete!"
echo "🔍 Check the logs above for any Supabase configuration issues"
echo "📊 Monitor with: docker logs englishgpt-api -f"
