#!/bin/bash

# Production Deployment Script for EnglishGPT with Dodo Payments Integration
# Run this script on your production server

set -e  # Exit on any error

echo "🚀 Starting EnglishGPT Production Deployment with Dodo Payments Integration"

# Configuration
PROJECT_DIR="/workspace"
BACKUP_DIR="/opt/backups/englishgpt"
LOG_FILE="/var/log/englishgpt-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# 1. Pre-deployment checks
log "Performing pre-deployment checks..."

if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
fi

# 2. Environment validation
log "Validating environment variables..."

if [ ! -f "$PROJECT_DIR/.env" ]; then
    error "Environment file not found at $PROJECT_DIR/.env"
fi

# Check critical environment variables
source "$PROJECT_DIR/.env"

REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "DODO_PAYMENTS_API_KEY"
    "DODO_PAYMENTS_WEBHOOK_KEY"
    "INTERNAL_API_KEY"
    "DODO_MONTHLY_PRODUCT_ID"
    "DODO_YEARLY_PRODUCT_ID"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        error "Required environment variable $var is not set"
    fi
done

success "Environment validation passed"

# 3. Create backup
log "Creating backup of current deployment..."

mkdir -p "$BACKUP_DIR"
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP.tar.gz"

cd "$PROJECT_DIR"
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='*.log' \
    --exclude='.git' \
    .

success "Backup created: $BACKUP_FILE"

# 4. Update production environment variables
log "Updating production environment..."

# Set production-specific variables
export NODE_ENV=production
export DODO_PAYMENTS_ENVIRONMENT=live  # Switch to live mode for production
export DODO_PAYMENTS_BASE_URL=https://live.dodopayments.com

# Update .env file for production
sed -i 's/NODE_ENV=development/NODE_ENV=production/' "$PROJECT_DIR/.env"
sed -i 's/DODO_PAYMENTS_ENVIRONMENT=test/DODO_PAYMENTS_ENVIRONMENT=live/' "$PROJECT_DIR/.env"

# 5. Build and deploy containers
log "Building and deploying containers..."

cd "$PROJECT_DIR"

# Pull latest images
docker-compose pull

# Build services
log "Building services..."
docker-compose build --no-cache

# 6. Database setup
log "Setting up database schema..."

# Note: This would normally connect to your Supabase instance
# The schema is already in the dodo_webhook_schema.sql file

# 7. Start services
log "Starting services..."

docker-compose down --remove-orphans
docker-compose up -d

# 8. Wait for services to be healthy
log "Waiting for services to be healthy..."

TIMEOUT=300  # 5 minutes
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $TIMEOUT ]; do
    if curl -f http://localhost:3001/health >/dev/null 2>&1 && \
       curl -f http://localhost:8000/api/webhooks/health >/dev/null 2>&1; then
        success "All services are healthy"
        break
    fi
    
    log "Services starting... (${ELAPSED}s elapsed)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    error "Services failed to become healthy within $TIMEOUT seconds"
fi

# 9. Run post-deployment tests
log "Running post-deployment tests..."

# Test webhook service
WEBHOOK_RESPONSE=$(curl -s http://localhost:3001/health)
if echo "$WEBHOOK_RESPONSE" | grep -q "healthy"; then
    success "Webhook service is responding"
else
    warning "Webhook service health check failed"
fi

# Test API service
API_RESPONSE=$(curl -s http://localhost:8000/api/webhooks/health)
if echo "$API_RESPONSE" | grep -q "healthy"; then
    success "API service is responding"
else
    warning "API service health check failed"
fi

# 10. Configure Dodo Payments webhook URL
log "Webhook configuration reminder..."

cat << EOF

🎯 IMPORTANT: Configure your Dodo Payments webhook URL

1. Go to your Dodo Payments Dashboard
2. Navigate to Webhooks section
3. Set webhook URL to: https://your-domain.com/webhook/dodo
4. Select all subscription and payment events
5. Make sure the webhook signing key matches your DODO_PAYMENTS_WEBHOOK_KEY environment variable

EOF

# 11. Setup monitoring
log "Setting up monitoring..."

# Create logrotate configuration
cat > /etc/logrotate.d/englishgpt << EOF
/var/log/englishgpt-*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
EOF

# Setup cron job for monitoring
(crontab -l 2>/dev/null; echo "*/5 * * * * cd $PROJECT_DIR && python3 monitoring/webhook-monitor.py >> /var/log/englishgpt-monitor.log 2>&1") | crontab -

# 12. Final status report
log "Deployment completed successfully!"

cat << EOF

🎉 EnglishGPT with Dodo Payments Integration Deployed Successfully!

📋 Deployment Summary:
- Backup created: $BACKUP_FILE
- Services running in production mode
- Webhook service: http://localhost:3001
- API service: http://localhost:8000
- Frontend: http://localhost:3000
- Environment: Production
- Dodo Payments: Live mode

🔗 Service URLs:
- Frontend: https://your-domain.com
- API Health: https://your-domain.com/api/webhooks/health
- Webhook Health: https://your-domain.com/webhook/health

📝 Next Steps:
1. Configure proper SSL certificates
2. Update Dodo Payments webhook URL in dashboard
3. Test payment flow end-to-end
4. Monitor logs for any issues

📊 Monitoring:
- Logs: /var/log/englishgpt-deploy.log
- Container logs: docker-compose logs -f
- Service status: docker-compose ps

EOF

success "Production deployment completed!"