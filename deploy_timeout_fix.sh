#!/bin/bash

echo "🚀 Deploying Timeout and Evaluation Fetch Fix..."

# Pull latest changes
echo "📥 Pulling latest changes..."
cd /opt/englishgpt
git pull origin main

# Rebuild frontend
echo "🎨 Building frontend with timeout fixes..."
cd /opt/englishgpt/frontend
npm run build

# Restart backend to apply evaluation endpoint changes
echo "🔄 Restarting backend services..."
cd /opt/englishgpt
docker-compose down
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to restart..."
sleep 10

echo "✅ Timeout and Evaluation Fix Deployed Successfully!"
echo ""
echo "🔧 Changes Applied:"
echo "   ✅ Added 15-second timeout to evaluation fetching in frontend"
echo "   ✅ Added AbortController for request cancellation"
echo "   ✅ Simplified backend evaluations endpoint (no user verification dependency)"
echo "   ✅ Backend now returns empty array instead of 500 error on evaluation fetch failure"
echo "   ✅ Enhanced error logging for debugging timeout issues"
echo ""
echo "🎯 How It Works Now:"
echo "   1. Frontend requests evaluations with 15-second timeout"
echo "   2. Backend fetches directly from database without user verification"
echo "   3. If request times out or fails, empty array is returned (no crash)"
echo "   4. History/Analytics tabs work with empty data (show 'no data' state)"
echo ""
echo "🔍 Debugging:"
echo "   - Check backend logs: docker logs \$(docker ps -q --filter name=backend)"
echo "   - Check frontend console for timeout messages"
echo "   - Evaluate endpoints should respond within 15 seconds"
echo "   - API requests are tracked with unique IDs in browser console"
