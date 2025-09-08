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
echo "   ✅ REMOVED all plan restrictions from History component"
echo "   ✅ REMOVED all plan restrictions from Analytics component"
echo "   ✅ Added detailed logging for evaluation fetching process"
echo ""
echo "🎯 How It Works Now:"
echo "   1. App.js fetches evaluations when user logs in"
echo "   2. History/Analytics tabs are now available to ALL USERS (any plan)"
echo "   3. Better error handling and logging for debugging"
echo "   4. Consistent API endpoints across all services"
echo ""
echo "🔍 Test the changes:"
echo "   - Check browser console for evaluation fetching logs"
echo "   - Visit Analytics tab to see if data appears"
echo "   - Visit History tab to see if essays appear"
echo "   - ALL USERS can now access Analytics & History tabs regardless of plan"
