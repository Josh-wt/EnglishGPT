        #!/bin/bash

        echo "🚀 Deploying Dodo Payments API URL fix to production..."

        # Stop and remove existing backend container
        echo "📦 Stopping existing backend container..."
        docker stop englishgpt-api 2>/dev/null || true
        docker rm englishgpt-api 2>/dev/null || true

        # Build new backend image
        echo "🔨 Building backend with API URL fix..."
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
            echo "🔗 API URL fixed - now using https://test.dodopayments.com/api/subscriptions"
            echo "🧪 Test subscription creation should now work properly"
        else
            echo "❌ Backend container failed to start"
            docker logs englishgpt-api
            exit 1
        fi

        echo "🎉 Deployment complete! Test the subscription creation now."
