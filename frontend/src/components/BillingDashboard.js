import React, { useState, useEffect } from 'react';
import billingService from '../services/billingService';
import toast from 'react-hot-toast';
import { 
  CreditCardIcon, 
  UserGroupIcon, 
  ShoppingCartIcon,
  TagIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ServerIcon,
  BoltIcon,
  CubeIcon,
  ReceiptRefundIcon,
  BellIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// Import sub-components
import SubscriptionManager from './billing/SubscriptionManager';
import CustomerManager from './billing/CustomerManager';
import ProductManager from './billing/ProductManager';
import PaymentHistory from './billing/PaymentHistory';
import DiscountManager from './billing/DiscountManager';
import AddonManager from './billing/AddonManager';
import LicenseManager from './billing/LicenseManager';
import RefundManager from './billing/RefundManager';
import WebhookManager from './billing/WebhookManager';
import BrandSettings from './billing/BrandSettings';

const BillingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalCustomers: 0,
    pendingPayments: 0,
    activeProducts: 0,
    activeDiscounts: 0
  });

  // Tab configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: CurrencyDollarIcon },
    { id: 'subscriptions', name: 'Subscriptions', icon: CreditCardIcon },
    { id: 'customers', name: 'Customers', icon: UserGroupIcon },
    { id: 'products', name: 'Products', icon: CubeIcon },
    { id: 'payments', name: 'Payments', icon: DocumentTextIcon },
    { id: 'discounts', name: 'Discounts', icon: TagIcon },
    { id: 'addons', name: 'Addons', icon: ShoppingCartIcon },
    { id: 'licenses', name: 'Licenses', icon: BoltIcon },
    { id: 'refunds', name: 'Refunds', icon: ReceiptRefundIcon },
    { id: 'webhooks', name: 'Webhooks', icon: BellIcon },
    { id: 'brand', name: 'Brand Settings', icon: GlobeAltIcon },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load overview statistics
      const [subscriptions, customers, products, payments, discounts] = await Promise.all([
        billingService.subscription.list({ limit: 100 }),
        billingService.customer.list({ limit: 100 }),
        billingService.product.list({ active: true }),
        billingService.payment.list({ limit: 100 }),
        billingService.discount.list({ activeOnly: true })
      ]);

      // Calculate statistics
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const totalRevenue = payments
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + p.amount, 0);
      const pendingPayments = payments.filter(p => p.status === 'pending').length;

      setStats({
        totalRevenue,
        activeSubscriptions,
        totalCustomers: customers.length,
        pendingPayments,
        activeProducts: products.length,
        activeDiscounts: discounts.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={billingService.formatCurrency(stats.totalRevenue)}
          icon={CurrencyDollarIcon}
          color="green"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CreditCardIcon}
          color="blue"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={UserGroupIcon}
          color="purple"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={DocumentTextIcon}
          color="yellow"
        />
        <StatCard
          title="Active Products"
          value={stats.activeProducts}
          icon={CubeIcon}
          color="indigo"
        />
        <StatCard
          title="Active Discounts"
          value={stats.activeDiscounts}
          icon={TagIcon}
          color="pink"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            label="Create Product"
            onClick={() => setActiveTab('products')}
            icon={CubeIcon}
          />
          <QuickActionButton
            label="Add Customer"
            onClick={() => setActiveTab('customers')}
            icon={UserGroupIcon}
          />
          <QuickActionButton
            label="Create Discount"
            onClick={() => setActiveTab('discounts')}
            icon={TagIcon}
          />
          <QuickActionButton
            label="View Payments"
            onClick={() => setActiveTab('payments')}
            icon={DocumentTextIcon}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <div className="text-gray-600 dark:text-gray-400">
          Activity feed will be displayed here
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (loading && activeTab === 'overview') {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'subscriptions':
        return <SubscriptionManager />;
      case 'customers':
        return <CustomerManager />;
      case 'products':
        return <ProductManager />;
      case 'payments':
        return <PaymentHistory />;
      case 'discounts':
        return <DiscountManager />;
      case 'addons':
        return <AddonManager />;
      case 'licenses':
        return <LicenseManager />;
      case 'refunds':
        return <RefundManager />;
      case 'webhooks':
        return <WebhookManager />;
      case 'brand':
        return <BrandSettings />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Billing Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your billing, subscriptions, and payments
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex flex-wrap">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      mr-8 py-2 px-1 border-b-2 font-medium text-sm flex items-center
                      transition-colors duration-200
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ label, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
  >
    <Icon className="w-5 h-5 mr-2" />
    {label}
  </button>
);

export default BillingDashboard;