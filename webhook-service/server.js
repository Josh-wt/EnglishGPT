/**
 * Dodo Payments Webhook Service
 * 
 * This service handles webhook verification using the dodopayments-webhooks library
 * and forwards processed webhook data to the Python FastAPI backend for business logic processing.
 */

const express = require('express');
const { DodopaymentsHandler } = require('dodopayments-webhooks');
const axios = require('axios');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Dodo Payments Handler with comprehensive error handling
let PaymentHandler;
try {
    if (!process.env.DODO_PAYMENTS_WEBHOOK_KEY) {
        throw new Error('DODO_PAYMENTS_WEBHOOK_KEY environment variable is required');
    }
    
    PaymentHandler = new DodopaymentsHandler({
        signing_key: process.env.DODO_PAYMENTS_WEBHOOK_KEY
    });
    
    console.log('✅ Dodo Payments Handler initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Dodo Payments Handler:', error.message);
    process.exit(1);
}

// Security and monitoring middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for webhook endpoints
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'webhook-id', 'webhook-timestamp', 'webhook-signature']
}));

// Rate limiting to prevent webhook spam
const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many webhook requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
});

// Logging middleware
if (NODE_ENV !== 'test') {
    app.use(morgan('combined', {
        skip: (req, res) => req.path === '/health' && res.statusCode < 400
    }));
}

// Body parsing middleware with size limits
app.use(express.json({ 
    limit: process.env.MAX_PAYLOAD_SIZE || '10mb',
    verify: (req, res, buf) => {
        // Store raw body for signature verification
        req.rawBody = buf;
    }
}));

app.use(express.raw({ 
    type: 'application/json', 
    limit: process.env.MAX_PAYLOAD_SIZE || '10mb' 
}));

// Health check endpoint with comprehensive system status
app.get('/health', async (req, res) => {
    const healthStatus = {
        status: 'healthy',
        service: 'dodo-webhook-handler',
        version: require('./package.json').version,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: NODE_ENV,
        webhookUrl: 'https://englishgpt.everythingenglish.xyz/webhooks/dodo',
        configuration: {
            webhookKeyConfigured: !!process.env.DODO_PAYMENTS_WEBHOOK_KEY,
            pythonBackendConfigured: !!process.env.PYTHON_BACKEND_URL,
            internalApiKeyConfigured: !!process.env.INTERNAL_API_KEY
        }
    };

    // Test Python backend connection
    try {
        const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
        const response = await axios.get(`${backendUrl}/api/webhooks/health`, {
            timeout: 3000,
            headers: { 'User-Agent': 'WebhookService-HealthCheck/1.0' }
        });
        healthStatus.backendConnection = 'healthy';
        healthStatus.backendStatus = response.data;
    } catch (error) {
        healthStatus.backendConnection = 'unhealthy';
        healthStatus.backendError = error.message;
    }

    res.json(healthStatus);
});

// Detailed status endpoint for monitoring
app.get('/status', (req, res) => {
    res.json({
        service: 'dodo-webhook-service',
        status: 'running',
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: require('./package.json').version,
        node_version: process.version,
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Main webhook endpoint - this is what Dodo Payments will call
app.post('/api/webhooks/dodo', webhookLimiter, async (req, res) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    console.log(`🔔 [${requestId}] Webhook received from Dodo Payments`);
    console.log(`📝 [${requestId}] Headers:`, sanitizeHeaders(req.headers));
    console.log(`📏 [${requestId}] Body size: ${JSON.stringify(req.body).length} bytes`);

    try {
        // Use the dodopayments-webhooks library to handle verification
        const payment = await PaymentHandler.handle({
            body: req.body,
            headers: req.headers
        });

        console.log(`✅ [${requestId}] Webhook verified successfully`);
        console.log(`📊 [${requestId}] Event type: ${payment.type}`);
        console.log(`🆔 [${requestId}] Event ID: ${payment.id}`);
        
        if (NODE_ENV === 'development') {
            console.log(`🔍 [${requestId}] Payment data:`, JSON.stringify(payment, null, 2));
        }

        // Forward processed webhook to Python backend with retry logic
        const forwardResponse = await forwardToPythonBackend(payment, req.headers, requestId);
        
        if (forwardResponse.success) {
            const processingTime = Date.now() - startTime;
            console.log(`✅ [${requestId}] Successfully processed webhook in ${processingTime}ms`);
            
            // Send success response to Dodo Payments
            res.status(200).json({
                status: 'processed',
                event_id: payment.id,
                processing_time: processingTime,
                request_id: requestId
            });
        } else {
            console.error(`❌ [${requestId}] Failed to forward to Python backend:`, forwardResponse.error);
            
            // Return 500 to trigger Dodo Payments retry mechanism
            res.status(500).json({
                status: 'processing_failed',
                error: 'Internal processing error',
                request_id: requestId,
                retry: true
            });
        }

    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ [${requestId}] Webhook processing failed in ${processingTime}ms`);
        console.error(`📋 [${requestId}] Error name: ${error.name}`);
        console.error(`💬 [${requestId}] Error message: ${error.message}`);
        
        // Handle specific error types from the dodopayments-webhooks library
        const errorResponse = handleWebhookError(error, requestId);
        res.status(errorResponse.status).json(errorResponse.body);
    }
});

// Test endpoint for development and debugging
app.post('/webhook/test', async (req, res) => {
    if (NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Test endpoint not available in production' });
    }

    const requestId = generateRequestId();
    console.log(`🧪 [${requestId}] Test webhook received`);

    try {
        // Create mock webhook data for testing
        const mockPayment = {
            id: req.body.id || `test_${Date.now()}`,
            type: req.body.type || 'subscription.created',
            data: req.body.data || {},
            created_at: new Date().toISOString()
        };

        const forwardResponse = await forwardToPythonBackend(mockPayment, req.headers, requestId);
        
        res.json({
            status: 'test_processed',
            mock_payment: mockPayment,
            forward_result: forwardResponse,
            request_id: requestId
        });

    } catch (error) {
        res.status(500).json({
            status: 'test_failed',
            error: error.message,
            request_id: requestId
        });
    }
});

/**
 * Forward processed webhook data to Python backend with retry logic and comprehensive error handling
 */
async function forwardToPythonBackend(paymentData, originalHeaders, requestId, retryCount = 0) {
    const maxRetries = parseInt(process.env.MAX_RETRIES) || 3;
    const retryDelay = parseInt(process.env.RETRY_DELAY) || 1000; // 1 second
    const timeout = parseInt(process.env.REQUEST_TIMEOUT) || 30000; // 30 seconds

    try {
        const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
        const internalApiKey = process.env.INTERNAL_API_KEY;

        if (!internalApiKey) {
            throw new Error('INTERNAL_API_KEY not configured for secure communication');
        }

        const payload = {
            event_type: paymentData.type,
            event_id: paymentData.id,
            data: paymentData,
            processed_at: new Date().toISOString(),
            original_headers: {
                'webhook-id': originalHeaders['webhook-id'],
                'webhook-timestamp': originalHeaders['webhook-timestamp'],
                'webhook-signature': originalHeaders['webhook-signature']
            },
            metadata: {
                request_id: requestId,
                retry_count: retryCount,
                forwarded_by: 'dodo-webhook-service',
                service_version: require('./package.json').version
            }
        };

        console.log(`🔄 [${requestId}] Forwarding to Python backend (attempt ${retryCount + 1}/${maxRetries + 1})`);

        const response = await axios.post(`${pythonBackendUrl}/api/webhooks/dodo-processed`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${internalApiKey}`,
                'User-Agent': 'DodoWebhookService/1.0',
                'X-Request-ID': requestId,
                'X-Forwarded-By': 'webhook-service'
            },
            timeout: timeout,
            validateStatus: (status) => status >= 200 && status < 500 // Don't throw for 4xx errors
        });

        console.log(`✅ [${requestId}] Backend response: ${response.status} ${response.statusText}`);

        return {
            success: response.status >= 200 && response.status < 300,
            status: response.status,
            data: response.data,
            retry_count: retryCount
        };

    } catch (error) {
        console.error(`❌ [${requestId}] Forward attempt ${retryCount + 1} failed:`, error.message);
        
        if (error.response) {
            console.error(`📊 [${requestId}] Response status: ${error.response.status}`);
            console.error(`📝 [${requestId}] Response data:`, error.response.data);
        }

        // Retry logic for temporary failures
        if (retryCount < maxRetries && shouldRetry(error)) {
            console.log(`🔄 [${requestId}] Retrying in ${retryDelay}ms (attempt ${retryCount + 2}/${maxRetries + 1})`);
            
            await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1))); // Exponential backoff
            return forwardToPythonBackend(paymentData, originalHeaders, requestId, retryCount + 1);
        }
        
        return {
            success: false,
            error: error.message,
            status: error.response?.status || 500,
            retry_count: retryCount,
            final_attempt: true
        };
    }
}

/**
 * Handle webhook-specific errors from dodopayments-webhooks library
 */
function handleWebhookError(error, requestId) {
    switch(error.name) {
        case 'dodopay_invalid_signature':
            console.error(`🚨 [${requestId}] SECURITY ALERT: Invalid signature - possible security issue or outdated webhook key`);
            return {
                status: 400,
                body: {
                    error: 'Invalid webhook signature',
                    message: 'The webhook signature could not be verified. This may indicate a security issue.',
                    error_code: 'INVALID_SIGNATURE',
                    request_id: requestId
                }
            };
            
        case 'dodopay_request_missing_data':
            console.error(`📋 [${requestId}] Missing required data in webhook request`);
            return {
                status: 400,
                body: {
                    error: 'Missing required data',
                    message: 'The webhook request is missing required body or headers.',
                    error_code: 'MISSING_DATA',
                    request_id: requestId
                }
            };
            
        case 'dodopay_webhook_missing_headers':
            console.error(`📨 [${requestId}] Missing required webhook headers`);
            return {
                status: 400,
                body: {
                    error: 'Missing required headers',
                    message: 'Required webhook headers (webhook-id, webhook-signature, webhook-timestamp) are missing.',
                    error_code: 'MISSING_HEADERS',
                    request_id: requestId,
                    required_headers: ['webhook-id', 'webhook-signature', 'webhook-timestamp']
                }
            };
            
        default:
            console.error(`💥 [${requestId}] Unknown webhook error:`, error);
            return {
                status: 500,
                body: {
                    error: 'Internal server error',
                    message: NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
                    error_code: 'INTERNAL_ERROR',
                    request_id: requestId
                }
            };
    }
}

/**
 * Determine if an error should trigger a retry
 */
function shouldRetry(error) {
    // Retry on network errors and 5xx server errors
    if (!error.response) return true; // Network error
    if (error.response.status >= 500) return true; // Server error
    if (error.response.status === 429) return true; // Rate limited
    
    return false; // Don't retry 4xx client errors
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize headers for logging (remove sensitive data)
 */
function sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    
    // Remove or mask sensitive headers
    if (sanitized['webhook-signature']) {
        sanitized['webhook-signature'] = 'sha256=[REDACTED]';
    }
    if (sanitized['authorization']) {
        sanitized['authorization'] = '[REDACTED]';
    }
    
    return sanitized;
}

// Global error handling middleware
app.use((error, req, res, next) => {
    const requestId = generateRequestId();
    console.error(`💥 [${requestId}] Unhandled error:`, error);
    
    res.status(500).json({ 
        error: 'Internal server error',
        message: NODE_ENV === 'development' ? error.message : 'Something went wrong',
        request_id: requestId,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: {
            'POST /api/webhooks/dodo': 'Main webhook endpoint for Dodo Payments',
            'GET /health': 'Health check endpoint',
            'GET /status': 'Detailed status information'
        }
    });
});

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
    console.log(`🛑 Received ${signal}. Gracefully shutting down webhook service...`);
    
    // Give ongoing requests 10 seconds to complete
    setTimeout(() => {
        console.log('⏱️  Shutdown timeout reached, forcing exit');
        process.exit(1);
    }, 10000);
    
    // Close server gracefully
    server.close(() => {
        console.log('✅ Webhook service shutdown complete');
        process.exit(0);
    });
}

// Start the server
const server = app.listen(PORT, () => {
    console.log('🚀 Dodo Payments Webhook Service Started');
    console.log(`📡 Server running on port ${PORT} in ${NODE_ENV} mode`);
    console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/api/webhooks/dodo`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Status endpoint: http://localhost:${PORT}/status`);
    
    // Environment validation
    const requiredEnvVars = [
        'DODO_PAYMENTS_WEBHOOK_KEY',
        'PYTHON_BACKEND_URL',
        'INTERNAL_API_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('⚠️  Service may not function correctly without these variables');
    } else {
        console.log('✅ All required environment variables configured');
    }
    
    console.log('🎯 Ready to receive webhooks from Dodo Payments!');
});

module.exports = app; // Export for testing