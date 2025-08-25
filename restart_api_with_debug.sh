#!/bin/bash

# Script to restart API container with enhanced debugging for billing history issues

echo "Restarting API container with enhanced debugging..."

# Navigate to backend directory
cd /opt/englishgpt/backend

# Restart the API container
docker compose restart api

echo "Waiting for API to start..."
sleep 5

echo "Showing recent logs with debugging info:"
docker logs englishgpt-api --tail 50

echo ""
echo "API restarted with enhanced debugging."
echo "Now try accessing the subscription tab to see detailed debug logs."
echo ""
echo "To monitor logs continuously, run:"
echo "docker logs -f englishgpt-api"