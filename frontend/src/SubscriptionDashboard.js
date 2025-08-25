/**
 * Subscription Management Dashboard Component
 * Comprehensive subscription management interface
 */

import React, { useState, useEffect } from 'react';
import subscriptionService from './services/subscriptionService';
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
      
      console.log('Subscription status:', status);
      console.log('Billing history:', history);
      
      setSubscriptionStatus(status);
      // Handle both array and object with data property
      setBillingHistory(Array.isArray(history) ? history : (history?.data || history?.payments || []));
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (cancelAtPeriodEnd = true) => {
    if (!subscriptionStatus?.subscription?.dodo_subscription_id && !subscriptionStatus?.subscription?.id) {
      toast.error('No active subscription to cancel');
      return;
    }

    try {
      setActionLoading(true);
      const subscriptionId = subscriptionStatus.subscription.dodo_subscription_id || subscriptionStatus.subscription.id;
      await subscriptionService.cancelSubscription(
        user.id, 
        subscriptionId, 
        cancelAtPeriodEnd
      );
      
      toast.success(cancelAtPeriodEnd ? 'Subscription will be cancelled at period end' : 'Subscription cancelled immediately');
      setShowCancelModal(false);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscriptionStatus?.subscription?.dodo_subscription_id && !subscriptionStatus?.subscription?.id) {
      toast.error('No subscription to reactivate');
      return;
    }

    try {
      setActionLoading(true);
      const subscriptionId = subscriptionStatus.subscription.dodo_subscription_id || subscriptionStatus.subscription.id;
      await subscriptionService.reactivateSubscription(user.id, subscriptionId);
      toast.success('Subscription reactivated successfully');
      await loadSubscriptionData();
    } catch (error) {
      console.error('Reactivation failed:', error);
      toast.error('Failed to reactivate subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      await subscriptionService.openCustomerPortal(user.id);
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      toast.error('Failed to open payment management portal');
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
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    tableHeader: darkMode ? 'bg-gray-700' : 'bg-gray-50',
    tableRow: darkMode ? 'bg-gray-800' : 'bg-white',
    tableBorder: darkMode ? 'divide-gray-700' : 'divide-gray-200'
  };

  const hasActiveSubscription = subscriptionStatus?.has_active_subscription;
  const subscription = subscriptionStatus?.subscription;
  
  // Log for debugging
  console.log('Subscription Status:', subscriptionStatus);
  console.log('Has Active Subscription:', hasActiveSubscription);
  console.log('Subscription Details:', subscription);

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
          
          {hasActiveSubscription && subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-medium ${themeClasses.text}`}>
                    {subscription.current_plan === 'unlimited' ? 'Unlimited Plan' : subscriptionService.getPlanDisplayName(subscription.plan_type)}
                  </h3>
                  <p className={themeClasses.textSecondary}>
                    {subscription.current_plan === 'unlimited' ? 'Premium Access' : 
                      `${subscriptionService.getPlanPricing(subscription.plan_type).price}${subscriptionService.getPlanPricing(subscription.plan_type).period}`}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscriptionService.getStatusBadgeColor(subscription.status)}`}>
                  {subscription.status}
                </span>
              </div>

              {subscription.cancel_at_period_end && (
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
                        <p>Your subscription will end on {subscriptionService.formatDate(subscription.current_period_end)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionStatus.next_billing_date && (
                  <div className={`text-center p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <p className={`text-sm ${themeClasses.textMuted}`}>Next Billing Date</p>
                    <p className={`text-lg font-semibold ${themeClasses.text}`}>
                      {subscriptionService.formatDate(subscriptionStatus.next_billing_date)}
                    </p>
                  </div>
                )}
                
                {subscription.current_plan === 'unlimited' && !subscriptionStatus.next_billing_date && (
                  <div className={`text-center p-4 ${darkMode ? 'bg-purple-900' : 'bg-purple-50'} rounded-lg`}>
                    <p className={`text-sm ${themeClasses.textMuted}`}>Plan Type</p>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>
                      Lifetime Access
                    </p>
                  </div>
                )}
                
                {subscriptionStatus.trial_days_remaining !== null && subscriptionStatus.trial_days_remaining !== undefined && (
                  <div className={`text-center p-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} rounded-lg`}>
                    <p className={`text-sm ${themeClasses.textMuted}`}>Trial Days Remaining</p>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>
                      {subscriptionStatus.trial_days_remaining}
                    </p>
                  </div>
                )}

                <div className={`text-center p-4 ${darkMode ? 'bg-green-900' : 'bg-green-50'} rounded-lg`}>
                  <p className={`text-sm ${themeClasses.textMuted}`}>Access Status</p>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-green-200' : 'text-green-600'}`}>Active</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 border-t">
                {/* Only show payment method button if not unlimited plan or has real subscription */}
                {(subscription.current_plan !== 'unlimited' || subscription.dodo_subscription_id?.indexOf('unlimited_') !== 0) && (
                  <button
                    onClick={handleUpdatePaymentMethod}
                    className={`inline-flex items-center px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Update Payment Method
                  </button>
                )}

                {/* Only show cancel/reactivate for non-unlimited plans or real subscriptions */}
                {(subscription.current_plan !== 'unlimited' || subscription.dodo_subscription_id?.indexOf('unlimited_') !== 0) && (
                  subscription.cancel_at_period_end ? (
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
                  )
                )}
                
                {/* Show special message for unlimited lifetime plans */}
                {subscription.current_plan === 'unlimited' && subscription.dodo_subscription_id?.indexOf('unlimited_') === 0 && (
                  <div className={`inline-flex items-center px-4 py-2 ${themeClasses.textSecondary}`}>
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Lifetime access - No recurring charges
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className={`mx-auto h-12 w-12 ${themeClasses.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          
          {billingHistory && billingHistory.length > 0 ? (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${themeClasses.tableBorder}`}>
                  <thead className={themeClasses.tableHeader}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                        Date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                        Amount
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                        Payment Method
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${themeClasses.tableRow} divide-y ${themeClasses.tableBorder}`}>
                    {billingHistory.map((payment, index) => (
                      <tr key={payment.id || index}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.text}`}>
                          {subscriptionService.formatDate(payment.created_at)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.text}`}>
                          {subscriptionService.formatPrice(payment.amount_cents, payment.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscriptionService.getPaymentStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.text}`}>
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
              <svg className={`mx-auto h-12 w-12 ${themeClasses.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
