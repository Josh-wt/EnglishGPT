import React, { useState } from 'react';
import { useLicenseKeyDetail, useRevokeLicenseKey } from '../../../hooks/admin/useLicenseKeys';
import { 
  XMarkIcon, 
  KeyIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const LicenseKeyDetailModal = ({ licenseKeyId, onClose, onRefresh }) => {
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  
  const { data: licenseKey, isLoading, error } = useLicenseKeyDetail(licenseKeyId);
  const revokeMutation = useRevokeLicenseKey();

  const handleRevoke = async () => {
    try {
      await revokeMutation.mutateAsync({
        licenseKeyId: licenseKeyId,
        reason: revokeReason || 'Revoked by admin'
      });
      setShowRevokeModal(false);
      setRevokeReason('');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error revoking license key:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'revoked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'trial': return 'text-blue-600 bg-blue-100';
      case 'basic': return 'text-green-600 bg-green-100';
      case 'premium': return 'text-purple-600 bg-purple-100';
      case 'enterprise': return 'text-orange-600 bg-orange-100';
      case 'lifetime': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading license key details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">Failed to load license key details.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!licenseKey) {
    return null;
  }

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
              <h2 className="text-xl font-bold text-gray-900">License Key Details</h2>
              <p className="text-sm text-gray-600">View and manage license key information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* License Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License Key</label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm">
                {licenseKey.license_key}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(licenseKey.license_key)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Status and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(licenseKey.status)}`}>
                {licenseKey.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(licenseKey.license_type)}`}>
                {licenseKey.license_type}
              </span>
            </div>
          </div>

          {/* Usage Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usage</label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {licenseKey.times_used} / {licenseKey.max_uses}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(licenseKey.times_used / licenseKey.max_uses) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Users</label>
              <span className="text-sm text-gray-600">{licenseKey.max_users}</span>
            </div>
          </div>

          {/* Limits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Evaluations</label>
            <span className="text-sm text-gray-600">
              {licenseKey.max_evaluations ? licenseKey.max_evaluations.toLocaleString() : 'Unlimited'}
            </span>
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expires</label>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {licenseKey.expires_at ? new Date(licenseKey.expires_at).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {licenseKey.assigned_to || 'Unassigned'}
              </span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(licenseKey.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Used</label>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {licenseKey.last_used_at ? new Date(licenseKey.last_used_at).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Description and Notes */}
          {licenseKey.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <p className="text-sm text-gray-600">{licenseKey.description}</p>
            </div>
          )}

          {licenseKey.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <p className="text-sm text-gray-600">{licenseKey.notes}</p>
            </div>
          )}

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <span className="text-sm text-gray-600">{licenseKey.source}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            ID: {licenseKey.id}
          </div>
          <div className="flex space-x-3">
            {licenseKey.status === 'active' && (
              <button
                onClick={() => setShowRevokeModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Revoke License
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Revoke License Key</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to revoke this license key? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Enter reason for revocation..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={revokeMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {revokeMutation.isLoading ? 'Revoking...' : 'Revoke License'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseKeyDetailModal;
