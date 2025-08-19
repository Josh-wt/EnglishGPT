/**
 * Subscription Management Dashboard Component
 * Comprehensive subscription management interface
 */

import React, { useState, useEffect } from 'react';
import subscriptionService from './subscriptionService';
import toast, { Toaster } from 'react-hot-toast';

const SubscriptionDashboard = ({ user, onBack, darkMode }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [status, history] = await Promise.all([
        subscriptionService.getSubscriptionStatus(user.id),
        subscriptionService.getBillingHistory(user.id, 20)
      ]);
      
      setSubscriptionStatus(status);
      setBillingHistory(history);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (cancelAtPeriodEnd = true) => {
    if (!subscriptionStatus?.subscription?.id) return;

    try {
      setActionLoading(true);
      await subscriptionService.cancelSubscription(
        user.id, 
        subscriptionStatus.subscription.id, 
        cancelAtPeriodEnd
      );
      
      setShowCancelModal(false);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Cancellation failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscriptionStatus?.subscription?.id) return;

    try {
      setActionLoading(true);
      await subscriptionService.reactivateSubscription(user.id, subscriptionStatus.subscription.id);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Reactivation failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      await subscriptionService.openCustomerPortal(user.id);
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const themeClasses = {
    background: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500'
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Subscription Management</h1>
            <p className={themeClasses.textSecondary}>Manage your subscription and billing</p>
          </div>
          <button
            onClick={onBack}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Subscription Overview */}
        <div className={`${themeClasses.card} border rounded-lg shadow-sm p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4`}>Current Subscription</h2>
          
          {subscriptionStatus?.hasActiveSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-medium ${themeClasses.text}`}>
                    {subscriptionService.getPlanDisplayName(subscriptionStatus.subscription.plan_type)}
                  </h3>
                  <p className={themeClasses.textSecondary}>
                    {subscriptionService.getPlanPricing(subscriptionStatus.subscription.plan_type).price}
                    {subscriptionService.getPlanPricing(subscriptionStatus.subscription.plan_type).period}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscriptionService.getStatusBadgeColor(subscriptionStatus.subscription.status)}`}>
                  {subscriptionStatus.subscription.status}
                </span>
              </div>

              {subscriptionStatus.subscription.cancel_at_period_end && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Subscription Scheduled for Cancellation
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Your subscription will end on {subscriptionService.formatDate(subscriptionStatus.subscription.current_period_end)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className={`text-sm ${themeClasses.textMuted}`}>Next Billing Date</p>
                  <p className={`text-lg font-semibold ${themeClasses.text}`}>
                    {subscriptionService.formatDate(subscriptionStatus.next_billing_date)}
                  </p>
                </div>
                
                {subscriptionStatus.trial_days_remaining !== null && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className={`text-sm ${themeClasses.textMuted}`}>Trial Days Remaining</p>
                    <p className={`text-lg font-semibold ${themeClasses.text}`}>
                      {subscriptionStatus.trial_days_remaining}
                    </p>
                  </div>
                )}

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className={`text-sm ${themeClasses.textMuted}`}>Access Status</p>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 border-t">
                <button
                  onClick={handleUpdatePaymentMethod}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Update Payment Method
                </button>

                {subscriptionStatus.subscription.cancel_at_period_end ? (
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Reactivate Subscription'}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className={`mt-2 text-sm font-medium ${themeClasses.text}`}>No Active Subscription</h3>
              <p className={`mt-1 text-sm ${themeClasses.textMuted}`}>
                You're currently on the free plan with limited access.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className={`${themeClasses.card} border rounded-lg shadow-sm p-6`}>
          <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4`}>Billing History</h2>
          
          {billingHistory.length > 0 ? (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billingHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subscriptionService.formatDate(payment.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subscriptionService.formatPrice(payment.amount_cents, payment.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscriptionService.getPaymentStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.payment_method_type || 'Card'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className={`mt-2 text-sm font-medium ${themeClasses.text}`}>No Billing History</h3>
              <p className={`mt-1 text-sm ${themeClasses.textMuted}`}>
                Your billing history will appear here once you make payments.
              </p>
            </div>
          )}
        </div>

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Cancel Subscription</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to cancel your subscription? You can choose to cancel immediately or at the end of your billing period.
                  </p>
                </div>
                <div className="items-center px-4 py-3 space-y-2">
                  <button
                    onClick={() => handleCancelSubscription(true)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-yellow-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Cancel at Period End'}
                  </button>
                  <button
                    onClick={() => handleCancelSubscription(false)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Cancel Immediately'}
                  </button>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    Keep Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
};

export default SubscriptionDashboard;
