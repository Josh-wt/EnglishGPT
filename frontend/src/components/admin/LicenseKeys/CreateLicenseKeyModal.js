import React, { useState } from 'react';
import { useCreateLicenseKey } from '../../../hooks/admin/useLicenseKeys';
import { XMarkIcon, KeyIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const CreateLicenseKeyModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    license_type: 'trial',
    max_users: 1,
    max_evaluations: null,
    expires_at: '',
    max_uses: 1,
    description: '',
    notes: '',
    source: 'manual'
  });
  
  const createMutation = useCreateLicenseKey();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        max_evaluations: formData.max_evaluations || null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
      };
      
      await createMutation.mutateAsync(submitData);
      onSuccess();
    } catch (error) {
      console.error('Error creating license key:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const licenseTypes = [
    { value: 'trial', label: 'Trial', description: '7-day trial license' },
    { value: 'basic', label: 'Basic', description: 'Basic features for 1 year' },
    { value: 'premium', label: 'Premium', description: 'Premium features for 1 year' },
    { value: 'enterprise', label: 'Enterprise', description: 'Enterprise features for 1 year' },
    { value: 'lifetime', label: 'Lifetime', description: 'Lifetime access to all features' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <KeyIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create License Key</h2>
              <p className="text-sm text-gray-600">Generate a new license key for user access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* License Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
            <select
              value={formData.license_type}
              onChange={(e) => handleInputChange('license_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {licenseTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Max Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Users</label>
            <input
              type="number"
              min="1"
              value={formData.max_users}
              onChange={(e) => handleInputChange('max_users', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Number of users this license can be assigned to</p>
          </div>

          {/* Max Evaluations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Evaluations</label>
            <input
              type="number"
              min="1"
              value={formData.max_evaluations || ''}
              onChange={(e) => handleInputChange('max_evaluations', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty for unlimited"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum number of evaluations (leave empty for unlimited)</p>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Uses</label>
            <input
              type="number"
              min="1"
              value={formData.max_uses}
              onChange={(e) => handleInputChange('max_uses', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">How many times this license key can be used</p>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
            <input
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => handleInputChange('expires_at', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration (lifetime licenses)</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of this license key"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Additional notes about this license key"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <select
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="manual">Manual</option>
              <option value="payment">Payment</option>
              <option value="promo">Promotional</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Error Display */}
          {createMutation.error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                {createMutation.error.response?.data?.detail || 'Failed to create license key'}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create License Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLicenseKeyModal;
