import React, { useState, useEffect } from 'react';
import { subscriptionService, formatCurrency, formatDate, getStatusBadgeClass } from '../../services/billingService';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    customerId: ''
  });

  useEffect(() => {
    loadSubscriptions();
  }, [filters]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.list(filters);
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (subscriptionData) => {
    try {
      await subscriptionService.create(subscriptionData);
      toast.success('Subscription created successfully');
      setShowCreateModal(false);
      loadSubscriptions();
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
    }
  };

  const handleUpdateSubscription = async (subscriptionId, updateData) => {
    try {
      await subscriptionService.update(subscriptionId, updateData);
      toast.success('Subscription updated successfully');
      setShowEditModal(false);
      loadSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      try {
        await subscriptionService.update(subscriptionId, { cancel_at_period_end: true });
        toast.success('Subscription will be canceled at the end of the period');
        loadSubscriptions();
      } catch (error) {
        console.error('Error canceling subscription:', error);
        toast.error('Failed to cancel subscription');
      }
    }
  };

  const handleChargeNow = async (subscriptionId) => {
    try {
      await subscriptionService.chargeNow(subscriptionId);
      toast.success('Subscription charged successfully');
    } catch (error) {
      console.error('Error charging subscription:', error);
      toast.error('Failed to charge subscription');
    }
  };

  const handleChangePlan = async (subscriptionId, newPriceId) => {
    try {
      await subscriptionService.changePlan(subscriptionId, newPriceId);
      toast.success('Plan changed successfully');
      loadSubscriptions();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Failed to change plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Subscriptions
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Subscription
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="canceled">Canceled</option>
              <option value="past_due">Past Due</option>
              <option value="trialing">Trialing</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer ID
            </label>
            <input
              type="text"
              value={filters.customerId}
              onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
              placeholder="Filter by customer ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadSubscriptions}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Next Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {subscription.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {subscription.customer_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {subscription.price_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(subscription.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {subscription.current_period_end ? formatDate(subscription.current_period_end) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        {subscription.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleChargeNow(subscription.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Charge Now"
                            >
                              <CurrencyDollarIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleCancelSubscription(subscription.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {subscriptions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No subscriptions found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal would go here */}
      {/* For brevity, modal implementation is simplified */}
      {showCreateModal && (
        <SubscriptionModal
          title="Create Subscription"
          subscription={null}
          onSave={handleCreateSubscription}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && selectedSubscription && (
        <SubscriptionModal
          title="Edit Subscription"
          subscription={selectedSubscription}
          onSave={(data) => handleUpdateSubscription(selectedSubscription.id, data)}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSubscription(null);
          }}
        />
      )}
    </div>
  );
};

// Simplified Modal Component
const SubscriptionModal = ({ title, subscription, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    customer_id: subscription?.customer_id || '',
    price_id: subscription?.price_id || '',
    quantity: subscription?.quantity || 1,
    trial_days: subscription?.trial_days || 0,
    addon_ids: subscription?.addon_ids || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {title}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer ID
            </label>
            <input
              type="text"
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price ID
            </label>
            <input
              type="text"
              value={formData.price_id}
              onChange={(e) => setFormData({ ...formData, price_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionManager;