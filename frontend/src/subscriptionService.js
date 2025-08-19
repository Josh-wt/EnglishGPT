/**
 * Subscription Service for Frontend
 * Handles all subscription-related API calls and state management
 */

import axios from 'axios';
import toast from 'react-hot-toast';

// Use relative URLs to avoid CORS issues - same as main app
console.log('🔧 SubscriptionService using relative URLs');
console.log('🔧 Current hostname:', window.location.hostname);
console.log('🔧 Current origin:', window.location.origin);

class SubscriptionService {
  constructor() {
    this.api = axios.create({
      baseURL: '/api',  // Use relative URL
      timeout: 30000,
    });
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(userId, planType, metadata = {}) {
    try {
      const response = await this.api.post('/subscriptions/create-checkout', {
        userId,
        planType,
        metadata
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      const message = error.response?.data?.detail || 'Failed to create checkout session';
      toast.error(message);
      throw new Error(message);
    }
  }

  /**
   * Get user's subscription status
   */
  async getSubscriptionStatus(userId) {
    try {
      const response = await this.api.get(`/subscriptions/status?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return { hasActiveSubscription: false };
    }
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(userId, subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const response = await this.api.post('/subscriptions/cancel', {
        userId,
        subscriptionId,
        cancelAtPeriodEnd
      });
      
      if (response.data.success) {
        const message = cancelAtPeriodEnd 
          ? 'Subscription will be cancelled at the end of your billing period'
          : 'Subscription cancelled immediately';
        toast.success(message);
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      const message = error.response?.data?.detail || 'Failed to cancel subscription';
      toast.error(message);
      throw new Error(message);
    }
  }

  /**
   * Reactivate user's subscription
   */
  async reactivateSubscription(userId, subscriptionId) {
    try {
      const response = await this.api.post('/subscriptions/reactivate', {
        userId,
        subscriptionId
      });
      
      if (response.data.success) {
        toast.success('Subscription reactivated successfully!');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      const message = error.response?.data?.detail || 'Failed to reactivate subscription';
      toast.error(message);
      throw new Error(message);
    }
  }

  /**
   * Create customer portal session for payment method management
   */
  async createCustomerPortalSession(userId) {
    try {
      const response = await this.api.post('/subscriptions/customer-portal', {
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create customer portal session:', error);
      const message = error.response?.data?.detail || 'Failed to access customer portal';
      toast.error(message);
      throw new Error(message);
    }
  }

  /**
   * Get user's billing history
   */
  async getBillingHistory(userId, limit = 50) {
    try {
      const response = await this.api.get(`/subscriptions/billing-history?user_id=${userId}&limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get billing history:', error);
      return [];
    }
  }

  /**
   * Redirect to checkout
   */
  async redirectToCheckout(userId, planType) {
    try {
      const loadingToast = toast.loading('Creating checkout session...');
      
      const { checkout_url } = await this.createCheckoutSession(userId, planType, {
        source: 'pricing_page',
        timestamp: new Date().toISOString()
      });
      
      toast.dismiss(loadingToast);
      
      // Redirect to Dodo Payments checkout
      window.location.href = checkout_url;
      
    } catch (error) {
      console.error('Checkout redirect failed:', error);
      // Error already handled in createCheckoutSession
    }
  }

  /**
   * Open customer portal in new tab
   */
  async openCustomerPortal(userId) {
    try {
      const loadingToast = toast.loading('Opening customer portal...');
      
      const { portal_url } = await this.createCustomerPortalSession(userId);
      
      toast.dismiss(loadingToast);
      
      // Open in new tab
      window.open(portal_url, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Customer portal open failed:', error);
      // Error already handled in createCustomerPortalSession
    }
  }

  /**
   * Format price for display
   */
  formatPrice(cents, currency = 'USD') {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Calculate days until date
   */
  daysUntil(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Get plan display name
   */
  getPlanDisplayName(planType) {
    const plans = {
      monthly: 'Unlimited Monthly',
      yearly: 'Unlimited Yearly'
    };
    return plans[planType] || planType;
  }

  /**
   * Get plan pricing
   */
  getPlanPricing(planType) {
    const pricing = {
      monthly: { price: '$4.99', period: '/month', savings: null },
      yearly: { price: '$49', period: '/year', savings: 'Save $10.88' }
    };
    return pricing[planType] || pricing.monthly;
  }

  /**
   * Get subscription status badge color
   */
  getStatusBadgeColor(status) {
    const colors = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      on_hold: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get payment status badge color
   */
  getPaymentStatusColor(status) {
    const colors = {
      succeeded: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}

// Create and export singleton instance
const subscriptionService = new SubscriptionService();
export default subscriptionService;
