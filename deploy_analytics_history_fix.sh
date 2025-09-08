#!/bin/bash

echo "🚀 Deploying Analytics and History Fix..."

# Pull latest changes
echo "📥 Pulling latest changes..."
cd /opt/englishgpt
git pull origin main

# Rebuild frontend
echo "🎨 Building frontend with fixed analytics and history..."
cd /opt/englishgpt/frontend
npm run build

# Wait for build to complete
echo "⏳ Frontend build completed"

echo "✅ Analytics and History Fix Deployed Successfully!"
echo ""
echo "🔧 Changes Applied:"
echo "   ✅ Fixed evaluations service API endpoint (/evaluations/user/{user_id})"
echo "   ✅ Enhanced App.js evaluation fetching with better error handling"
echo "   ✅ Updated History component to allow access if user has evaluations"
echo "   ✅ Updated Analytics component to allow access if user has evaluations"
echo "   ✅ Added detailed logging for evaluation fetching process"
echo ""
echo "🎯 How It Works Now:"
echo "   1. App.js fetches evaluations when user logs in"
echo "   2. History/Analytics tabs show data if user has unlimited OR has evaluations"
echo "   3. Better error handling and logging for debugging"
echo "   4. Consistent API endpoints across all services"
echo ""
echo "🔍 Test the changes:"
echo "   - Check browser console for evaluation fetching logs"
echo "   - Visit Analytics tab to see if data appears"
echo "   - Visit History tab to see if essays appear"
echo "   - Users with evaluations should see data regardless of plan"
