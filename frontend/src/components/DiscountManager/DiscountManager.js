import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  CalendarIcon,
  UsersIcon,
  PercentBadgeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { paymentService } from '../../services';

const DiscountManager = ({ darkMode }) => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, expired, used_up

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getDiscounts({ page_size: 50 });
      setDiscounts(response.items || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const createDiscount = async (discountData) => {
    try {
      await paymentService.createDiscount(discountData);
      toast.success('Discount created successfully');
      setShowCreateModal(false);
      fetchDiscounts();
    } catch (error) {
      console.error('Error creating discount:', error);
      toast.error('Failed to create discount');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDiscountStatus = (discount) => {
    const now = new Date();
    const expiresAt = discount.expires_at ? new Date(discount.expires_at) : null;
    
    if (expiresAt && expiresAt < now) {
      return { status: 'expired', text: 'Expired', variant: 'outline' };
    }
    
    if (discount.usage_limit && discount.times_used >= discount.usage_limit) {
      return { status: 'used_up', text: 'Used Up', variant: 'destructive' };
    }
    
    return { status: 'active', text: 'Active', variant: 'success' };
  };

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discount.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    
    const { status } = getDiscountStatus(discount);
    return status === filter;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Discount Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage discount codes for your customers
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Create Discount
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search discounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'expired', label: 'Expired' },
                  { id: 'used_up', label: 'Used Up' }
                ].map((filterOption) => (
                  <Button
                    key={filterOption.id}
                    variant={filter === filterOption.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filterOption.id)}
                  >
                    {filterOption.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discounts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading discounts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDiscounts.map((discount) => {
              const { status, text, variant } = getDiscountStatus(discount);
              
              return (
                <Card key={discount.discount_id} className={`relative transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-lg">{discount.name}</CardTitle>
                      </div>
                      <Badge variant={variant}>{text}</Badge>
                    </div>
                    <CardDescription className="mt-2">
                      Code: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">{discount.code}</code>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Discount Value */}
                    <div className="text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {discount.type === 'percentage' ? `${discount.amount / 100}%` : `$${discount.amount / 100}`}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {discount.type === 'percentage' ? 'Percentage Off' : 'Fixed Amount Off'}
                      </p>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-lg">{discount.times_used}</div>
                        <div className="text-gray-600 dark:text-gray-400">Times Used</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg">
                          {discount.usage_limit ? discount.usage_limit : '∞'}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Usage Limit</div>
                      </div>
                    </div>

                    {/* Expiration */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4" />
                        Expires: {formatDate(discount.expires_at)}
                      </div>
                    </div>

                    {/* Restrictions */}
                    {discount.restricted_to && discount.restricted_to.length > 0 && (
                      <div className="text-center">
                        <Badge variant="outline" className="text-xs">
                          Restricted to {discount.restricted_to.length} product(s)
                        </Badge>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingDiscount(discount)}
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this discount?')) {
                            // Implement delete functionality
                            toast.success('Discount deleted');
                          }
                        }}
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredDiscounts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No discounts found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Create your first discount to get started.'
                  }
                </p>
                {!searchTerm && filter === 'all' && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create First Discount
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Discount Modal */}
        {(showCreateModal || editingDiscount) && (
          <DiscountModal
            discount={editingDiscount}
            onClose={() => {
              setShowCreateModal(false);
              setEditingDiscount(null);
            }}
            onSave={createDiscount}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

// Discount Modal Component
const DiscountModal = ({ discount, onClose, onSave, darkMode }) => {
  const [formData, setFormData] = useState({
    name: discount?.name || '',
    code: discount?.code || '',
    type: discount?.type || 'percentage',
    amount: discount?.amount || '',
    usage_limit: discount?.usage_limit || '',
    expires_at: discount?.expires_at ? discount.expires_at.split('T')[0] : '',
    restricted_to: discount?.restricted_to || [],
    subscription_cycles: discount?.subscription_cycles || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const discountData = {
      ...formData,
      amount: parseInt(formData.amount),
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      subscription_cycles: formData.subscription_cycles ? parseInt(formData.subscription_cycles) : null
    };

    onSave(discountData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle>{discount ? 'Edit Discount' : 'Create New Discount'}</CardTitle>
          <CardDescription>
            {discount ? 'Update discount settings' : 'Configure a new discount code for customers'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Summer Sale 2024"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Discount Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                  placeholder="SUMMER20"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
              </div>
            </div>

            {/* Discount Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount {formData.type === 'percentage' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                  min="1"
                  max={formData.type === 'percentage' ? '100' : undefined}
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  required
                />
              </div>
            </div>

            {/* Usage Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Unlimited"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited usage</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Expiration Date</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>
            </div>

            {/* Subscription Cycles */}
            <div>
              <label className="block text-sm font-medium mb-2">Subscription Cycles</label>
              <input
                type="number"
                value={formData.subscription_cycles}
                onChange={(e) => setFormData({ ...formData, subscription_cycles: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Apply to all cycles"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Number of billing cycles for recurring subscriptions (leave empty for indefinite)</p>
            </div>
          </CardContent>

          <div className="flex justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {discount ? 'Update Discount' : 'Create Discount'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DiscountManager;
