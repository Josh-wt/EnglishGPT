import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { 
  SparklesIcon, 
  TrophyIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { paymentService } from '../../services';

const SubscriptionDashboard = ({ user, darkMode }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState(null);
  const [payments, setPayments] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.id) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] ===== STARTING SUBSCRIPTION DATA FETCH =====');
    console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] User object:', user);
    console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] User ID:', user.id);
    console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] User email:', user.email);
    console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] User metadata:', user.user_metadata);
    
    try {
      // Get or create customer in Dodo Payments
      let customerId = user.dodo_customer_id;
      console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Existing customer ID:', customerId);
      
      if (!customerId) {
        console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] No existing customer ID, creating new customer');
        console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Customer data to create:', {
          name: user.user_metadata?.full_name || user.email,
          email: user.email,
          phone_number: user.user_metadata?.phone || null
        });
        
        try {
          const customer = await paymentService.createCustomer({
            name: user.user_metadata?.full_name || user.email,
            email: user.email,
            phone_number: user.user_metadata?.phone || null
          });
          console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Customer creation response:', customer);
          customerId = customer.customer_id;
          console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] New customer ID:', customerId);
        } catch (customerError) {
          console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Customer creation failed:', customerError);
          console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Customer error details:', {
            message: customerError.message,
            stack: customerError.stack,
            response: customerError.response
          });
          throw customerError;
        }
      } else {
        console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Using existing customer ID:', customerId);
      }

      // Fetch subscription info using real API
      console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Fetching subscriptions for customer:', customerId);
      try {
        const subscriptionsData = await paymentService.getSubscriptions({
          customer_id: customerId,
          page_size: 1
        });
        console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Subscriptions API response:', subscriptionsData);
        const activeSubscription = subscriptionsData.items?.[0] || null;
        setSubscription(activeSubscription);
        console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Active subscription set:', activeSubscription);
      } catch (subscriptionError) {
        console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Subscription fetch failed:', subscriptionError);
        console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Subscription error details:', {
          message: subscriptionError.message,
          stack: subscriptionError.stack,
          response: subscriptionError.response
        });
        setSubscription(null);
      }

      // Fetch payment history using real API
      console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Fetching payment history for customer:', customerId);
      try {
        const paymentsData = await paymentService.getPayments({
          customer_id: customerId,
          page_size: 10
        });
        console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Payments API response:', paymentsData);
        setPayments(paymentsData.items || []);
        console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Payment history set:', paymentsData.items);
      } catch (paymentError) {
        console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Payment history fetch failed:', paymentError);
        console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Payment error details:', {
          message: paymentError.message,
          stack: paymentError.stack,
          response: paymentError.response
        });
        setPayments([]);
      }

      // Fetch license keys if available
      if (activeSubscription?.subscription_id) {
        try {
          console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Fetching license keys for subscription:', activeSubscription.subscription_id);
          const licensesData = await paymentService.getLicenseKeys({
            customer_id: customerId,
            page_size: 10
          });
          console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] License keys API response:', licensesData);
          setLicenses(licensesData.items || []);
          console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] License keys set:', licensesData.items);
        } catch (licenseError) {
          console.warn('[SUBSCRIPTION_DASHBOARD_ERROR] License fetch failed:', licenseError);
          console.warn('[SUBSCRIPTION_DASHBOARD_ERROR] License error details:', {
            message: licenseError.message,
            stack: licenseError.stack,
            response: licenseError.response
          });
          setLicenses([]);
        }
      } else {
        console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] No active subscription, skipping license fetch');
        setLicenses([]);
      }

      // Calculate usage data based on subscription and payments
      console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Calculating usage data');
      const evaluationsUsed = payments.length || 0;
      const evaluationsLimit = activeSubscription ? -1 : 3; // Unlimited for subscribers, 3 for free users
      
      const usageData = {
        evaluationsUsed,
        evaluationsLimit,
        resetDate: activeSubscription?.next_billing_date ? 
          new Date(activeSubscription.next_billing_date) : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      
      console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Usage data calculated:', usageData);
      setUsage(usageData);

    } catch (error) {
      console.error('[SUBSCRIPTION_DASHBOARD_ERROR] ===== CRITICAL ERROR IN SUBSCRIPTION DATA FETCH =====');
      console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Error message:', error.message);
      console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Error stack:', error.stack);
      console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response,
        status: error.status,
        statusText: error.statusText
      });
      toast.error('Failed to load subscription data: ' + error.message);
    } finally {
      console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] ===== SUBSCRIPTION DATA FETCH COMPLETED =====');
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.subscription_id) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.'
    );

    if (!confirmed) return;

    try {
      console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Cancelling subscription:', subscription.subscription_id);
      
      // Use PATCH request to update subscription with cancellation
      const response = await fetch(`/api/payments/subscriptions/${subscription.subscription_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          cancel_at_next_billing_date: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to cancel subscription');
      }

      const result = await response.json();
      console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Cancellation successful:', result);
      toast.success('Subscription will be cancelled at the end of your billing period');
      await fetchSubscriptionData();
    } catch (error) {
      console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Error cancelling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription?.subscription_id) return;

    try {
      console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Reactivating subscription:', subscription.subscription_id);
      
      const result = await paymentService.updateSubscription(subscription.subscription_id, {
        cancel_at_next_billing_date: false
      });

      console.debug('[SUBSCRIPTION_DASHBOARD_DEBUG] Subscription reactivation result:', result);
      toast.success('Subscription reactivated successfully');
      await fetchSubscriptionData();
    } catch (error) {
      console.error('[SUBSCRIPTION_DASHBOARD_ERROR] Error reactivating subscription:', error);
      toast.error('Failed to reactivate subscription');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      trialing: { variant: 'default', text: 'Trial' },
      cancelled: { variant: 'destructive', text: 'Cancelled' },
      expired: { variant: 'outline', text: 'Expired' },
      on_hold: { variant: 'warning', text: 'On Hold' },
      failed: { variant: 'destructive', text: 'Failed' }
    };

    const config = statusConfig[status] || { variant: 'outline', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100); // Convert from cents
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subscription data...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'usage', name: 'Usage', icon: DocumentTextIcon },
    { id: 'licenses', name: 'Licenses', icon: KeyIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Subscription Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your EEnglishGPT subscription and account settings
          </p>
        </div>

        {/* Current Plan Overview */}
        <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {subscription ? (
                    <>
                      <SparklesIcon className="w-6 h-6 text-blue-600" />
                      {subscription.product_name || 'Unlimited Plan'}
                    </>
                  ) : (
                    <>
                      <TrophyIcon className="w-6 h-6 text-gray-400" />
                      Free Plan
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {subscription ? 'Active subscription' : 'Upgrade to unlock unlimited features'}
                </CardDescription>
              </div>
              <div className="text-right">
                {subscription ? getStatusBadge(subscription.status) : getStatusBadge('free')}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Plan Details
                </h4>
                <div className="mt-2">
                  {subscription ? (
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        {formatCurrency(subscription.recurring_amount, subscription.currency)}
                        <span className="text-sm font-normal text-gray-500">
                          /{subscription.payment_frequency_interval?.toLowerCase()}
                        </span>
                      </p>
                      {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
                        <p className="text-sm text-green-600">
                          Trial ends {formatDate(subscription.trial_end)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">$0<span className="text-sm font-normal text-gray-500">/month</span></p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Usage This Month
                </h4>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Evaluations</span>
                        <span className="text-sm font-medium">
                          {usage?.evaluationsUsed || 0} / {usage?.evaluationsLimit === -1 ? '∞' : usage?.evaluationsLimit || 3}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: usage?.evaluationsLimit === -1 
                              ? '100%' 
                              : `${Math.min(100, ((usage?.evaluationsUsed || 0) / (usage?.evaluationsLimit || 3)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Next Billing
                </h4>
                <div className="mt-2">
                  {subscription ? (
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {formatDate(subscription.current_period_end)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {subscription.cancel_at_next_billing ? 'Subscription will end' : 'Auto-renewal'}
                      </p>
                    </div>
                  ) : (
                    <p className="font-semibold text-gray-400">No active subscription</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.name}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription ? (
                    <>
                      {subscription.cancel_at_next_billing ? (
                        <Button onClick={handleReactivateSubscription} className="w-full">
                          Reactivate Subscription
                        </Button>
                      ) : (
                        <Button variant="destructive" onClick={handleCancelSubscription} className="w-full">
                          Cancel Subscription
                        </Button>
                      )}
                      <Button variant="outline" className="w-full">
                        Change Plan
                      </Button>
                      <Button variant="outline" className="w-full">
                        Update Payment Method
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full">
                      Get Unlimited Access
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.slice(0, 3).map((payment) => (
                      <div key={payment.payment_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCardIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Payment</p>
                            <p className="text-sm text-gray-500">{formatDate(payment.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(payment.total_amount, payment.currency)}</p>
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'billing' && (
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your payment history and download invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.payment_id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <CreditCardIcon className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-medium">Payment #{payment.payment_id.slice(-8)}</p>
                          <p className="text-sm text-gray-500">{formatDate(payment.created_at)}</p>
                          <p className="text-sm text-gray-500">{payment.payment_method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(payment.total_amount, payment.currency)}</p>
                        {getStatusBadge(payment.status)}
                        <div className="mt-2">
                          <Button variant="outline" size="sm">
                            Download Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {payments.length === 0 && (
                    <div className="text-center py-8">
                      <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No billing history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'usage' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle>Current Usage</CardTitle>
                  <CardDescription>Your usage for this billing period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Essay Evaluations</span>
                        <span className="text-sm text-gray-500">
                          {usage?.evaluationsUsed || 0} / {usage?.evaluationsLimit === -1 ? '∞' : usage?.evaluationsLimit || 3}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: usage?.evaluationsLimit === -1 
                              ? '100%' 
                              : `${Math.min(100, ((usage?.evaluationsUsed || 0) / (usage?.evaluationsLimit || 3)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Resets on {formatDate(usage?.resetDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle>Plan Features</CardTitle>
                  <CardDescription>What's included in your plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subscription ? (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          <span>Advanced AI Feedback</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          <span>Progress Tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          <span>Priority Support</span>
                        </div>
                        {subscription && (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              <span>Advanced Analytics</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              <span>Unlimited Evaluations</span>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          <span>3 Evaluations per month</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircleIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-500">Advanced AI Feedback</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircleIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-500">Progress Tracking</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'licenses' && (
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle>License Keys</CardTitle>
                <CardDescription>Manage your software licenses and activations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {licenses.map((license, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <KeyIcon className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium">License Key</p>
                            <p className="text-sm text-gray-500 font-mono">{license.key}</p>
                            <p className="text-sm text-gray-500">
                              {license.activations_count} / {license.activations_limit} activations used
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(license.status)}
                          {license.expires_at && (
                            <p className="text-sm text-gray-500 mt-1">
                              Expires {formatDate(license.expires_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {licenses.length === 0 && (
                    <div className="text-center py-8">
                      <KeyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No license keys available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle>Subscription Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Notifications</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Billing reminders</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Usage alerts</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Product updates</span>
                      </label>
                    </div>
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Download Account Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    Request Support
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
