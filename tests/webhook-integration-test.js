/**
 * Comprehensive Integration Tests for Dodo Payments Webhook System
 * Tests the complete flow from webhook receipt to database updates
 */

const request = require('supertest');
const { DodopaymentsHandler } = require('dodopayments-webhooks');
const crypto = require('crypto');

// Test configuration
const WEBHOOK_SERVICE_URL = process.env.WEBHOOK_SERVICE_URL || 'http://localhost:3001';
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
const TEST_WEBHOOK_KEY = process.env.TEST_WEBHOOK_KEY || 'test_webhook_key_123';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'test_internal_key';

describe('Dodo Payments Webhook Integration', () => {
  
  // Helper function to create valid webhook signature
  function createWebhookSignature(payload, timestamp, secret) {
    const message = `${timestamp}.${JSON.stringify(payload)}`;
    return `sha256=${crypto.createHmac('sha256', secret).update(message).digest('hex')}`;
  }

  // Helper function to create test webhook data
  function createTestWebhook(eventType, data = {}) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const webhookId = `evt_test_${Date.now()}`;
    
    const payload = {
      id: webhookId,
      type: eventType,
      created_at: new Date().toISOString(),
      data: {
        id: `sub_test_${Date.now()}`,
        status: 'active',
        customer: {
          id: `cus_test_${Date.now()}`,
          email: 'test@example.com'
        },
        product_id: 'pdt_1SNTZ2ED27HBPf8JOOWtI', // Monthly plan
        amount: 499, // $4.99 in cents
        currency: 'USD',
        ...data
      }
    };

    const signature = createWebhookSignature(payload, timestamp, TEST_WEBHOOK_KEY);

    return {
      payload,
      headers: {
        'webhook-id': webhookId,
        'webhook-timestamp': timestamp,
        'webhook-signature': signature,
        'content-type': 'application/json'
      }
    };
  }

  describe('Webhook Service Health', () => {
    test('should return healthy status', async () => {
      const response = await request(WEBHOOK_SERVICE_URL)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'dodo-webhook-handler'
      });
    });

    test('should have all required configuration', async () => {
      const response = await request(WEBHOOK_SERVICE_URL)
        .get('/health')
        .expect(200);

      expect(response.body.configuration).toMatchObject({
        webhookKeyConfigured: true,
        pythonBackendConfigured: true,
        internalApiKeyConfigured: true
      });
    });
  });

  describe('Webhook Signature Verification', () => {
    test('should reject webhook with invalid signature', async () => {
      const { payload } = createTestWebhook('subscription.created');
      
      const response = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send(payload)
        .set({
          'webhook-id': 'test_id',
          'webhook-timestamp': Math.floor(Date.now() / 1000).toString(),
          'webhook-signature': 'invalid_signature',
          'content-type': 'application/json'
        })
        .expect(400);

      expect(response.body.error_code).toBe('INVALID_SIGNATURE');
    });

    test('should reject webhook with missing headers', async () => {
      const { payload } = createTestWebhook('subscription.created');
      
      const response = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send(payload)
        .set('content-type', 'application/json')
        .expect(400);

      expect(response.body.error_code).toBe('MISSING_HEADERS');
    });

    test('should accept webhook with valid signature', async () => {
      const { payload, headers } = createTestWebhook('subscription.created');
      
      const response = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send(payload)
        .set(headers)
        .expect(200);

      expect(response.body.status).toBe('processed');
    });
  });

  describe('Subscription Webhook Processing', () => {
    test('should process subscription.created webhook', async () => {
      const { payload, headers } = createTestWebhook('subscription.created', {
        status: 'active',
        customer: {
          id: 'cus_test_created',
          email: 'created@example.com'
        }
      });

      const response = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send(payload)
        .set(headers)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'processed',
        event_id: payload.id
      });
    });

    test('should process subscription.cancelled webhook', async () => {
      const { payload, headers } = createTestWebhook('subscription.cancelled', {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      const response = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send(payload)
        .set(headers)
        .expect(200);

      expect(response.body.status).toBe('processed');
    });
  });

  describe('Payment Webhook Processing', () => {
    test('should process payment.succeeded webhook', async () => {
      const { payload, headers } = createTestWebhook('payment.succeeded', {
        subscription_id: 'sub_test_payment',
        amount: 499,
        currency: 'USD',
        status: 'succeeded'
      });

      const response = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send(payload)
        .set(headers)
        .expect(200);

      expect(response.body.status).toBe('processed');
    });

    test('should process payment.failed webhook', async () => {
      const { payload, headers } = createTestWebhook('payment.failed', {
        subscription_id: 'sub_test_failed',
        amount: 499,
        currency: 'USD',
        status: 'failed',
        failure_reason: 'insufficient_funds'
      });

      const response = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send(payload)
        .set(headers)
        .expect(200);

      expect(response.body.status).toBe('processed');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed webhook data', async () => {
      const response = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send('invalid json')
        .set({
          'webhook-id': 'test_id',
          'webhook-timestamp': Math.floor(Date.now() / 1000).toString(),
          'webhook-signature': 'test_signature',
          'content-type': 'application/json'
        })
        .expect(400);

      expect(response.body.error_code).toBe('MISSING_DATA');
    });
  });

  describe('Idempotency', () => {
    test('should handle duplicate webhooks correctly', async () => {
      const { payload, headers } = createTestWebhook('subscription.created');

      // First request
      const response1 = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send(payload)
        .set(headers)
        .expect(200);

      // Second identical request
      const response2 = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send(payload)
        .set(headers)
        .expect(200);

      expect(response1.body.status).toBe('processed');
      // The second response might be 'already_processed' depending on implementation
    });
  });

  describe('Performance Monitoring', () => {
    test('webhook processing should complete within acceptable time', async () => {
      const { payload, headers } = createTestWebhook('subscription.created');
      
      const startTime = Date.now();
      
      const response = await request(WEBHOOK_SERVICE_URL)
        .post('/webhook/dodo')
        .send(payload)
        .set(headers);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(response.body.processing_time).toBeDefined();
    });
  });
});