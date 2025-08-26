/**
 * Subscription Service for Frontend
 * Handles all subscription-related API calls and state management
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class SubscriptionService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  /**
   * Get user's current subscription status
   */
  async getSubscriptionStatus(userId) {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/status?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return {
        has_active_subscription: false,
        subscription: null,
        next_billing_date: null,
        trial_days_remaining: null
      };
    }
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(planType, userId) {
    try {
      const token = this.getAuthToken();
      const requestBody = {
        plan: planType, // 'monthly' or 'yearly'
        user_id: userId,
        success_url: `${window.location.origin}/subscription/success`,
        cancel_url: `${window.location.origin}/subscription/cancelled`
      };
      
      console.log('Creating checkout session:', { planType, userId, url: `${this.baseURL}/subscriptions/create-checkout` });
      
      const response = await fetch(`${this.baseURL}/subscriptions/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'include' // Include credentials if needed
      }).catch(error => {
        console.error('Network request failed:', error);
        throw new Error(`Network error: ${error.message}`);
      });

      if (!response) {
        throw new Error('No response received from server');
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail?.message || errorData.message || errorMessage;
        } catch (jsonError) {
          console.warn('Could not parse error response:', jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ API Response received:', {
        hasCheckoutUrl: !!data.checkout_url,
        hasCheckoutURL: !!data.checkoutUrl,
        hasSessionId: !!data.session_id,
        dataKeys: Object.keys(data),
        rawData: data
      });
      
      // Handle both possible response formats (checkout_url and checkoutUrl)
      const checkoutUrl = data.checkout_url || data.checkoutUrl || data.url;
      const sessionId = data.session_id || data.sessionId || data.id;
      
      console.log('Extracted values:', {
        checkoutUrl: checkoutUrl || 'NOT FOUND',
        sessionId: sessionId || 'NOT FOUND'
      });
      
      return {
        success: true,
        checkoutUrl: checkoutUrl,
        sessionId: sessionId
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check if the backend is running on port 5000.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error: The backend server needs to allow requests from this origin.';
      }
      
      return {
        success: false,
        error: errorMessage,
        originalError: error.message
      };
    }
  }

  /**
   * Redirect to checkout for subscription
   */
  async redirectToCheckout(userId, planType) {
    console.log('=== Starting checkout redirect ===');
    console.log('User ID:', userId);
    console.log('Plan Type:', planType);
    console.log('API Base URL:', this.baseURL);
    
    try {
      console.log('Calling createCheckoutSession...');
      const result = await this.createCheckoutSession(planType, userId);
      
      console.log('Checkout session result:', {
        success: result.success,
        hasCheckoutUrl: !!result.checkoutUrl,
        checkoutUrl: result.checkoutUrl || 'NOT PROVIDED',
        sessionId: result.sessionId || 'NOT PROVIDED',
        error: result.error || 'NONE',
        originalError: result.originalError || 'NONE'
      });
      
      if (result.success && result.checkoutUrl) {
        console.log('✅ Success! Redirecting to:', result.checkoutUrl);
        window.location.href = result.checkoutUrl;
      } else {
        const errorMsg = result.error || 'Failed to create checkout session';
        console.error('❌ Checkout session creation failed:', errorMsg);
        console.error('Full result object:', JSON.stringify(result, null, 2));
        if (result.originalError) {
          console.error('Original error details:', result.originalError);
        }
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error redirecting to checkout:', error);
      console.error('Error stack:', error.stack);
      
      // Re-throw with more context
      if (error.message.includes('Unable to connect')) {
        throw new Error('Backend server is not running. Please start the server on port 5000.');
      }
      throw error;
    }
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(userId, subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userId: userId,
          subscriptionId: subscriptionId,
          cancelAtPeriodEnd: cancelAtPeriodEnd
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(userId, subscriptionId) {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/reactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userId: userId,
          subscriptionId: subscriptionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Get user's billing history
   */
  async getBillingHistory(userId, limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/billing-history?user_id=${userId}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Handle both direct array and object with data/payments property
      return data.data || data.payments || data || [];
    } catch (error) {
      console.error('Error fetching billing history:', error);
      return [];
    }
  }

  /**
   * Open Stripe customer portal for payment management
   */
  async openCustomerPortal(userId) {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/customer-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userId: userId,
          returnUrl: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
      return data;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  }

  /**
   * Get available subscription plans
   */
  getAvailablePlans() {
    return [
      {
        id: 'monthly',
        name: 'Monthly Plan',
        price: 4.99,
        currency: 'USD',
        interval: 'month',
        productId: process.env.REACT_APP_DODO_MONTHLY_PRODUCT_ID,
        features: [
          'Unlimited assessments',
          'Advanced analytics',
          'Priority support',
          'Export results'
        ]
      },
      {
        id: 'yearly',
        name: 'Yearly Plan',
        price: 49.00,
        currency: 'USD',
        interval: 'year',
        productId: process.env.REACT_APP_DODO_YEARLY_PRODUCT_ID,
        features: [
          'Unlimited assessments',
          'Advanced analytics',
          'Priority support',
          'Export results',
          'Save 17% annually'
        ],
        popular: true
      }
    ];
  }

  /**
   * Get auth token from localStorage or context
   */
  getAuthToken() {
    // Check multiple possible token locations
    const token = localStorage.getItem('auth_token') || 
                  sessionStorage.getItem('auth_token') ||
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('token');
    
    if (!token) {
      console.warn('No authentication token found');
    }
    
    return token || 'dummy_token_for_dev'; // Fallback for development
  }

  /**
   * Get plan display name
   */
  getPlanDisplayName(planType) {
    const plans = {
      'monthly': 'Monthly Plan',
      'yearly': 'Annual Plan',
      'free': 'Free Plan',
      'unlimited': 'Premium Plan'
    };
    return plans[planType] || planType || 'Free Plan';
  }

  /**
   * Get plan pricing details
   */
  getPlanPricing(planType) {
    const pricing = {
      'monthly': { price: '$4.99', period: '/month' },
      'yearly': { price: '$49.00', period: '/year' },
      'free': { price: 'Free', period: '' },
      'unlimited': { price: 'Premium', period: '' }
    };
    return pricing[planType] || { price: 'Free', period: '' };
  }

  /**
   * Get status badge color classes
   */
  getStatusBadgeColor(status) {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'trialing': 'bg-blue-100 text-blue-800',
      'past_due': 'bg-yellow-100 text-yellow-800',
      'canceled': 'bg-gray-100 text-gray-800',
      'unpaid': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get payment status color classes
   */
  getPaymentStatusColor(status) {
    const colors = {
      'succeeded': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Format price in cents to currency
   */
  formatPrice(amountCents, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amountCents / 100);
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  }
}

export default new SubscriptionService();