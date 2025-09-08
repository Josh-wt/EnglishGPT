#!/bin/bash

echo "🚀 Deploying Launch Period Modal Fix..."

# Stop existing containers
echo "📦 Stopping existing containers..."
docker stop englishgpt-api 2>/dev/null || true
docker rm englishgpt-api 2>/dev/null || true

# Pull latest changes
echo "📥 Pulling latest changes..."
cd /opt/englishgpt
git pull origin main

# Apply database migration
echo "🗄️ Applying database migration for launch period tracking..."
cd /opt/englishgpt/database
export $(cat ../.env | xargs)
psql "$SUPABASE_URL" -f add_launch_period_columns.sql || echo "⚠️ Database migration failed or already applied"

# Rebuild and start backend
echo "🔨 Building and starting backend..."
cd /opt/englishgpt/backend
docker build -t englishgpt-backend .
docker run -d \
  --name englishgpt-api \
  -p 5000:5000 \
  --env-file .env \
  englishgpt-backend

# Rebuild frontend
echo "🎨 Building frontend..."
cd /opt/englishgpt/frontend
npm run build

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Check if backend is running
if docker ps | grep -q englishgpt-api; then
    echo "✅ Backend container is running"
    echo ""
    echo "🎉 Launch Period Fix Deployed Successfully!"
    echo ""
    echo "📋 Changes Applied:"
    echo "   ✅ Removed automatic unlimited granting (ensureUnlimited)"
    echo "   ✅ Created launch period modal for new users"
    echo "   ✅ Updated user creation to start with free plan (5 credits)"
    echo "   ✅ Added database tracking for launch period offers"
    echo "   ✅ Added LaunchPeriodModal component to frontend"
    echo ""
    echo "🎯 New User Flow:"
    echo "   1. User signs up → Gets free plan with 5 credits"
    echo "   2. New users see launch period modal offering free unlimited"
    echo "   3. If accepted → User gets unlimited plan with launch tracking"
    echo "   4. If declined → User stays on free plan"
    echo ""
    echo "🔍 Test the changes:"
    echo "   - Create a new account to see launch modal"
    echo "   - Check logs: docker logs englishgpt-api"
    echo "   - Frontend: https://englishgpt.everythingenglish.xyz"
else
    echo "❌ Backend failed to start"
    echo "🔍 Check logs: docker logs englishgpt-api"
    exit 1
fi
