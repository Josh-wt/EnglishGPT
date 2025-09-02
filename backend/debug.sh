#!/bin/bash

echo "🔍 Debugging EnglishGPT Backend..."

# Check container status
echo "📋 Container Status:"
docker ps | grep englishgpt-api

# Check container logs
echo "📋 Container Logs:"
docker logs englishgpt-api --tail 30

# Test API endpoints
echo "🏥 Health Check:"
curl -v http://localhost:5000/api/health

echo "🧪 Test Endpoint:"
curl -v http://localhost:5000/api/test

echo "👤 Test User Endpoint:"
curl -v http://localhost:5000/api/test-user/test-user-id

# Check environment variables
echo "🔧 Environment Check:"
docker exec englishgpt-api env | grep -E "(SUPABASE|DEEPSEEK|QWEN)" | head -10

# Check if Supabase is connected
echo "🗄️ Supabase Connection Test:"
curl -s http://localhost:5000/api/test | jq '.supabase_connected' 2>/dev/null || echo "jq not available"

# Check network connectivity
echo "🌐 Network Test:"
docker exec englishgpt-api curl -s https://openrouter.ai/api/v1/health || echo "OpenRouter not reachable"

# Check file permissions
echo "📁 File Permissions:"
ls -la /opt/englishgpt/backend/

# Check .env file
echo "🔐 Environment File Check:"
if [ -f /opt/englishgpt/backend/.env ]; then
    echo "✅ .env file exists"
    echo "📄 .env file size: $(wc -l < /opt/englishgpt/backend/.env) lines"
else
    echo "❌ .env file missing"
fi

# Check Docker image
echo "🐳 Docker Image Info:"
docker images | grep englishgpt-backend

# Check port binding
echo "🔌 Port Binding Check:"
netstat -tlnp | grep :5000 || ss -tlnp | grep :5000

# Check container resource usage
echo "💾 Container Resource Usage:"
docker stats englishgpt-api --no-stream

# Test CORS
echo "🌍 CORS Test:"
curl -H "Origin: https://englishgpt.everythingenglish.xyz" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     -v http://localhost:5000/api/health

echo "�� Debug completed!"
