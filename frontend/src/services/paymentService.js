import { API_ENDPOINTS } from '../constants/apiEndpoints';
import toast from 'react-hot-toast';

/**
 * Payment Service for Dodo Payments Integration
 * Handles all payment-related API calls
 */

class PaymentService {
  constructor() {
    this.baseURL = API_ENDPOINTS.API;
  }

  async _request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.debug(`[PAYMENT_SERVICE_DEBUG] Making request to: ${url}`);
    console.debug(`[PAYMENT_SERVICE_DEBUG] Options:`, options);
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      console.debug(`[PAYMENT_SERVICE_DEBUG] Sending fetch request`);
      const response = await fetch(url, { ...defaultOptions, ...options });
      console.debug(`[PAYMENT_SERVICE_DEBUG] Response status: ${response.status}`);
      console.debug(`[PAYMENT_SERVICE_DEBUG] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[PAYMENT_SERVICE_ERROR] Request failed with status ${response.status}:`, errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.debug(`[PAYMENT_SERVICE_DEBUG] Response data:`, data);
        return data;
      }
      
      console.debug(`[PAYMENT_SERVICE_DEBUG] Non-JSON response returned`);
      return response;
    } catch (error) {
      console.error(`[PAYMENT_SERVICE_ERROR] API Error (${endpoint}):`, error);
      console.error(`[PAYMENT_SERVICE_ERROR] Error stack:`, error.stack);
      throw error;
    }
  }

  // Payment Operations
  async createPayment(paymentData) {
    console.debug('[PAYMENT_SERVICE_DEBUG] Creating payment with data:', paymentData);
    return await this._request(API_ENDPOINTS.PAYMENTS, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPayment(paymentId) {
    return await this._request(`${API_ENDPOINTS.PAYMENTS}/${paymentId}`);
  }

  async getPayments(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page_number !== undefined) params.append('page_number', filters.page_number);
    if (filters.page_size !== undefined) params.append('page_size', filters.page_size);
    if (filters.status) params.append('status', filters.status);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);

    const endpoint = `${API_ENDPOINTS.PAYMENTS}${params.toString() ? `?${params.toString()}` : ''}`;
    return await this._request(endpoint);
  }

  // Subscription Operations
  async createSubscription(subscriptionData) {
    console.debug('[PAYMENT_SERVICE_DEBUG] Creating subscription with data:', subscriptionData);
    return await this._request(API_ENDPOINTS.SUBSCRIPTIONS, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async getSubscription(subscriptionId) {
    return await this._request(`${API_ENDPOINTS.SUBSCRIPTIONS}/${subscriptionId}`);
  }

  async getSubscriptions(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page_number !== undefined) params.append('page_number', filters.page_number);
    if (filters.page_size !== undefined) params.append('page_size', filters.page_size);
    if (filters.status) params.append('status', filters.status);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);

    const endpoint = `${API_ENDPOINTS.SUBSCRIPTIONS}${params.toString() ? `?${params.toString()}` : ''}`;
    return await this._request(endpoint);
  }

  async updateSubscription(subscriptionId, updateData) {
    return await this._request(`${API_ENDPOINTS.SUBSCRIPTIONS}/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async cancelSubscription(subscriptionId) {
    return await this.updateSubscription(subscriptionId, {
      cancel_at_next_billing_date: true
    });
  }

  // Customer Operations
  async createCustomer(customerData) {
    return await this._request(API_ENDPOINTS.CUSTOMERS, {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async getCustomer(customerId) {
    return await this._request(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`);
  }

  async getCustomers(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page_number !== undefined) params.append('page_number', filters.page_number);
    if (filters.page_size !== undefined) params.append('page_size', filters.page_size);
    if (filters.email) params.append('email', filters.email);

    const endpoint = `${API_ENDPOINTS.CUSTOMERS}${params.toString() ? `?${params.toString()}` : ''}`;
    return await this._request(endpoint);
  }

  async updateCustomer(customerId, updateData) {
    return await this._request(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async createCustomerPortalSession(customerId, sendEmail = false) {
    return await this._request(`${API_ENDPOINTS.CUSTOMERS}/${customerId}/customer-portal`, {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId, send_email: sendEmail }),
    });
  }

  // Product Operations
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page_number !== undefined) params.append('page_number', filters.page_number);
    if (filters.page_size !== undefined) params.append('page_size', filters.page_size);
    if (filters.recurring !== undefined) params.append('recurring', filters.recurring);
    if (filters.archived !== undefined) params.append('archived', filters.archived);

    const endpoint = `${API_ENDPOINTS.PRODUCTS}${params.toString() ? `?${params.toString()}` : ''}`;
    return await this._request(endpoint);
  }

  async getProduct(productId) {
    return await this._request(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
  }

  // Discount Operations
  async createDiscount(discountData) {
    return await this._request(API_ENDPOINTS.DISCOUNTS, {
      method: 'POST',
      body: JSON.stringify(discountData),
    });
  }

  async getDiscount(discountId) {
    return await this._request(`${API_ENDPOINTS.DISCOUNTS}/${discountId}`);
  }

  async getDiscounts(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page_number !== undefined) params.append('page_number', filters.page_number);
    if (filters.page_size !== undefined) params.append('page_size', filters.page_size);

    const endpoint = `${API_ENDPOINTS.DISCOUNTS}${params.toString() ? `?${params.toString()}` : ''}`;
    return await this._request(endpoint);
  }

  async updateDiscount(discountId, updateData) {
    return await this._request(`${API_ENDPOINTS.DISCOUNTS}/${discountId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteDiscount(discountId) {
    return await this._request(`${API_ENDPOINTS.DISCOUNTS}/${discountId}`, {
      method: 'DELETE',
    });
  }

  // Webhook Operations
  async createWebhook(webhookData) {
    return await this._request(API_ENDPOINTS.WEBHOOKS, {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  async getWebhook(webhookId) {
    return await this._request(`${API_ENDPOINTS.WEBHOOKS}/${webhookId}`);
  }

  async listWebhooks(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.iterator) params.append('iterator', filters.iterator);

    const endpoint = `${API_ENDPOINTS.WEBHOOKS}${params.toString() ? `?${params.toString()}` : ''}`;
    return await this._request(endpoint);
  }

  async updateWebhook(webhookId, updateData) {
    return await this._request(`${API_ENDPOINTS.WEBHOOKS}/${webhookId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteWebhook(webhookId) {
    return await this._request(`${API_ENDPOINTS.WEBHOOKS}/${webhookId}`, {
      method: 'DELETE',
    });
  }

  // License Operations
  async activateLicense(licenseKey, name) {
    return await this._request(`${API_ENDPOINTS.LICENSES}/activate`, {
      method: 'POST',
      body: JSON.stringify({ license_key: licenseKey, name }),
    });
  }

  async deactivateLicense(licenseKey, instanceId) {
    return await this._request(`${API_ENDPOINTS.LICENSES}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ 
        license_key: licenseKey, 
        license_key_instance_id: instanceId 
      }),
    });
  }

  async validateLicense(licenseKey, instanceId = null) {
    const data = { license_key: licenseKey };
    if (instanceId) data.license_key_instance_id = instanceId;
    
    return await this._request(`${API_ENDPOINTS.LICENSES}/validate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics Operations
  async getPaymentAnalytics(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.days) params.append('days', filters.days);

    const endpoint = `/analytics${params.toString() ? `?${params.toString()}` : ''}`;
    return await this._request(endpoint);
  }

  // Utility Methods
  async checkHealth() {
    return await this._request('/api/payments/health');
  }

  // Pricing Plans Helper
  async createSubscriptionForPlan(planType, billingCycle, customerData, billingAddress) {
    try {
      // Map plan types to product IDs (these would come from backend config)
      const productMap = {
        'basic_monthly': 'prod_basic_monthly',
        'basic_yearly': 'prod_basic_yearly',
        'premium_monthly': 'prod_premium_monthly',
        'premium_yearly': 'prod_premium_yearly'
      };

      const productId = productMap[`${planType}_${billingCycle}`];
      if (!productId) {
        throw new Error('Invalid plan configuration');
      }

      const subscriptionData = {
        customer: customerData,
        product_id: productId,
        quantity: 1,
        billing: billingAddress,
        billing_currency: 'USD',
        payment_link: true,
        return_url: `${window.location.origin}/payment-success`,
        metadata: {
          plan_type: planType,
          billing_cycle: billingCycle,
          source: 'englishgpt_webapp'
        }
      };

      const result = await this.createSubscription(subscriptionData);
      
      // If payment link is provided, redirect user
      if (result.payment_link) {
        window.location.href = result.payment_link;
      }

      return result;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      toast.error('Failed to create subscription. Please try again.');
      throw error;
    }
  }

  // Quick payment for one-time purchases
  async createQuickPayment(items, customerData, billingAddress) {
    try {
      const paymentData = {
        customer: customerData,
        product_cart: items,
        billing: billingAddress,
        billing_currency: 'USD',
        payment_link: true,
        return_url: `${window.location.origin}/payment-success`,
        metadata: {
          source: 'englishgpt_webapp',
          payment_type: 'one_time'
        }
      };

      const result = await this.createPayment(paymentData);
      
      // If payment link is provided, redirect user
      if (result.payment_link) {
        window.location.href = result.payment_link;
      }

      return result;
    } catch (error) {
      console.error('Payment creation failed:', error);
      toast.error('Failed to process payment. Please try again.');
      throw error;
    }
  }

  // Format currency helper
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  }

  // Format date helper
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

const paymentService = new PaymentService();
export default paymentService;