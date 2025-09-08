import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ChartBarIcon,
  CreditCardIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  RefreshIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { paymentService } from '../../services';
import DiscountManager from '../DiscountManager/DiscountManager';

const PaymentsDashboard = ({ user, darkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch analytics data
      const analyticsResponse = await paymentService.getPaymentAnalytics({
        days: parseInt(dateRange.replace('d', ''))
      });
      setAnalytics(analyticsResponse);

      // Fetch recent payments
      const paymentsResponse = await paymentService.getPayments({
        page_size: 10,
        page_number: 0
      });
      setRecentPayments(paymentsResponse.items || []);

      // Fetch real subscriptions data
      const subscriptionsResponse = await paymentService.getSubscriptions({
        page_size: 10,
        page_number: 0
      });
      setSubscriptions(subscriptionsResponse.items || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      succeeded: { variant: 'success', text: 'Success' },
      active: { variant: 'success', text: 'Active' },
      trialing: { variant: 'default', text: 'Trial' },
      failed: { variant: 'destructive', text: 'Failed' },
      cancelled: { variant: 'outline', text: 'Cancelled' },
      processing: { variant: 'warning', text: 'Processing' }
    };

    const config = statusConfig[status] || { variant: 'outline', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'subscriptions', name: 'Subscriptions', icon: UsersIcon },
    { id: 'discounts', name: 'Discounts', icon: SparklesIcon }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payments Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor and manage your payment system
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last year</option>
            </select>
            
            <Button onClick={fetchDashboardData} variant="outline" size="sm">
              <RefreshIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards - Show only on overview tab */}
        {activeTab === 'overview' && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.total_revenue || 0)}</p>
                  </div>
                  <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12.5% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payments</p>
                    <p className="text-2xl font-bold">{analytics.total_payments || 0}</p>
                  </div>
                  <CreditCardIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {analytics.successful_payments || 0} successful
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {((analytics.success_rate || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Last {dateRange}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.average_order_value || 0)}</p>
                  </div>
                  <ChartBarIcon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+8.2% from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
              {/* Recent Payments */}
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPayments.slice(0, 5).map((payment) => (
                      <div key={payment.payment_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCardIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {payment.customer?.name || 'Unknown Customer'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(payment.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(payment.total_amount, payment.currency)}
                          </p>
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    ))}
                    {recentPayments.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent payments</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Subscriptions */}
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle>Recent Subscriptions</CardTitle>
                  <CardDescription>Latest subscription activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptions.slice(0, 5).map((subscription) => (
                      <div key={subscription.subscription_id || subscription.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UsersIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {subscription.customer?.name || subscription.customer_name || 'Unknown Customer'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {subscription.product_id || subscription.plan || 'Unknown Plan'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(subscription.recurring_pre_tax_amount || subscription.amount || 0, subscription.currency)}
                          </p>
                          {getStatusBadge(subscription.status)}
                        </div>
                      </div>
                    ))}
                    {subscriptions.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent subscriptions</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'payments' && (
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Payments</CardTitle>
                    <CardDescription>Comprehensive view of all payment transactions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FunnelIcon className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium">Payment ID</th>
                        <th className="text-left py-3 px-4 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((payment) => (
                        <tr key={payment.payment_id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 font-mono text-sm">
                            {payment.payment_id.slice(-8)}
                          </td>
                          <td className="py-3 px-4">
                            {payment.customer?.name || payment.customer?.email || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatCurrency(payment.total_amount, payment.currency)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {formatDate(payment.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm">
                              <EyeIcon className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recentPayments.length === 0 && (
                    <div className="text-center py-8">
                      <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No payments found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'subscriptions' && (
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subscription Management</CardTitle>
                    <CardDescription>Manage customer subscriptions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FunnelIcon className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.subscription_id || subscription.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <UsersIcon className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {subscription.customer?.name || subscription.customer_name || 'Unknown Customer'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {subscription.product_id || subscription.plan || 'Unknown Plan'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Started {formatDate(subscription.created_at)}
                            </p>
                            {subscription.next_billing_date && (
                              <p className="text-sm text-blue-600">
                                Next billing: {formatDate(subscription.next_billing_date)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {formatCurrency(subscription.recurring_pre_tax_amount || subscription.amount || 0, subscription.currency)}
                          </p>
                          {getStatusBadge(subscription.status)}
                          <div className="mt-2 space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {subscriptions.length === 0 && (
                    <div className="text-center py-8">
                      <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No active subscriptions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'discounts' && (
            <DiscountManager darkMode={darkMode} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsDashboard;
