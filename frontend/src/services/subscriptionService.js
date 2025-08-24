/**
 * Subscription Service for Frontend
 * Handles all subscription-related API calls and state management
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class SubscriptionService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  /**
   * Get user's current subscription status
   */
  async getSubscriptionStatus(userId) {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'X-User-ID': userId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          hasActiveSubscription: data.has_active_subscription,
          subscriptionId: data.subscription?.id,
          planType: data.subscription?.plan_type,
          status: data.subscription?.status,
          currentPeriodEnd: data.subscription?.current_period_end,
          trialDaysRemaining: data.trial_days_remaining,
          nextBillingDate: data.next_billing_date
        }
      };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return {
        success: false,
        error: error.message,
        data: {
          hasActiveSubscription: false,
          subscriptionId: null,
          planType: null,
          status: 'inactive'
        }
      };
    }
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(planType, userId) {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          plan: planType, // 'monthly' or 'yearly'
          user_id: userId,
          success_url: `${window.location.origin}/subscription/success`,
          cancel_url: `${window.location.origin}/subscription/cancelled`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        checkoutUrl: data.checkout_url,
        sessionId: data.session_id
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(userId, reason = 'user_requested') {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          cancellation_reason: reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
        endsAt: data.ends_at
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(userId) {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/reactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          user_id: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's billing history
   */
  async getBillingHistory(userId, limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/billing-history?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'X-User-ID': userId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        billingHistory: data.billing_history || []
      };
    } catch (error) {
      console.error('Error fetching billing history:', error);
      return {
        success: false,
        error: error.message,
        billingHistory: []
      };
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
    // Implement based on your authentication system
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100); // Convert from cents
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