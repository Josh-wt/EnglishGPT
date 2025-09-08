import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  KeyIcon,
  ShieldCheckIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { 
  LockClosedIcon,
  LockOpenIcon 
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { paymentService } from '../../services';

const LicenseManager = ({ darkMode }) => {
  const [licenses, setLicenses] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activationData, setActivationData] = useState({
    license_key: '',
    name: ''
  });

  useEffect(() => {
    fetchLicenses();
    fetchInstances();
  }, []);

  const fetchLicenses = async () => {
    try {
      // Mock license data for now - in production this would come from API
      setLicenses([
        {
          id: 'lic_123',
          key: 'EG-PREM-2024-ABC123XYZ',
          status: 'active',
          product_id: 'premium_yearly',
          customer_id: 'cust_123',
          customer_name: 'John Doe',
          instances_count: 2,
          activations_limit: 5,
          expires_at: '2024-12-31T23:59:59Z',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'lic_456',
          key: 'EG-BASIC-2024-DEF456UVW',
          status: 'active',
          product_id: 'basic_monthly',
          customer_id: 'cust_456',
          customer_name: 'Jane Smith',
          instances_count: 1,
          activations_limit: 3,
          expires_at: '2024-06-30T23:59:59Z',
          created_at: '2024-03-01T00:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast.error('Failed to load licenses');
    }
  };

  const fetchInstances = async () => {
    setLoading(true);
    try {
      // Mock instance data for now
      setInstances([
        {
          id: 'inst_123',
          license_key_id: 'lic_123',
          name: 'MacBook Pro - Work',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'inst_124',
          license_key_id: 'lic_123',
          name: 'iPhone 15 Pro',
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          id: 'inst_456',
          license_key_id: 'lic_456',
          name: 'Desktop PC',
          created_at: '2024-03-01T00:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching instances:', error);
      toast.error('Failed to load license instances');
    } finally {
      setLoading(false);
    }
  };

  const activateLicense = async () => {
    if (!activationData.license_key.trim() || !activationData.name.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await paymentService.activateLicense(
        activationData.license_key,
        activationData.name
      );

      toast.success('License activated successfully!');
      setShowActivateModal(false);
      setActivationData({ license_key: '', name: '' });
      fetchLicenses();
      fetchInstances();
    } catch (error) {
      console.error('License activation failed:', error);
      toast.error('Failed to activate license. Please check the license key.');
    }
  };

  const deactivateInstance = async (licenseKey, instanceId) => {
    if (!window.confirm('Are you sure you want to deactivate this license instance?')) {
      return;
    }

    try {
      await paymentService.deactivateLicense(licenseKey, instanceId);
      toast.success('License instance deactivated successfully');
      fetchLicenses();
      fetchInstances();
    } catch (error) {
      console.error('Deactivation failed:', error);
      toast.error('Failed to deactivate license instance');
    }
  };

  const validateLicense = async (licenseKey, instanceId = null) => {
    try {
      const result = await paymentService.validateLicense(licenseKey, instanceId);
      if (result.valid) {
        toast.success('License is valid and active');
      } else {
        toast.error('License is invalid or expired');
      }
    } catch (error) {
      console.error('License validation failed:', error);
      toast.error('Failed to validate license');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active', icon: CheckCircleIcon },
      expired: { variant: 'destructive', text: 'Expired', icon: XCircleIcon },
      disabled: { variant: 'outline', text: 'Disabled', icon: XCircleIcon }
    };

    const config = statusConfig[status] || { variant: 'outline', text: status, icon: XCircleIcon };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInstancesForLicense = (licenseId) => {
    return instances.filter(instance => instance.license_key_id === licenseId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">License Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage license keys and device activations for premium features
          </p>
        </div>
        <Button onClick={() => setShowActivateModal(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Activate License
        </Button>
      </div>

      {/* License Keys */}
      <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="w-5 h-5" />
            License Keys
          </CardTitle>
          <CardDescription>
            Active license keys and their activation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {licenses.map((license) => {
              const licenseInstances = getInstancesForLicense(license.id);
              const isExpiringSoon = new Date(license.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

              return (
                <div
                  key={license.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                          {license.key}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(license.key)}
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </Button>
                        {getStatusBadge(license.status)}
                        {isExpiringSoon && (
                          <Badge variant="warning" className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Customer:</span>
                          <p>{license.customer_name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Product:</span>
                          <p>{license.product_id}</p>
                        </div>
                        <div>
                          <span className="font-medium">Activations:</span>
                          <p>{license.instances_count}/{license.activations_limit}</p>
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span>
                          <p>{formatDate(license.expires_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => validateLicense(license.key)}
                      >
                        <ShieldCheckIcon className="w-4 h-4 mr-1" />
                        Validate
                      </Button>
                    </div>
                  </div>

                  {/* License Instances */}
                  {licenseInstances.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <ComputerDesktopIcon className="w-4 h-4" />
                        Active Devices ({licenseInstances.length})
                      </h4>
                      <div className="space-y-2">
                        {licenseInstances.map((instance) => (
                          <div
                            key={instance.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <ComputerDesktopIcon className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium">{instance.name}</p>
                                <p className="text-sm text-gray-500">
                                  Activated {formatDate(instance.created_at)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deactivateInstance(license.key, instance.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {licenses.length === 0 && (
              <div className="text-center py-8">
                <KeyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No license keys found</p>
                <Button onClick={() => setShowActivateModal(true)} variant="outline">
                  Activate your first license
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* License Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Licenses</p>
                <p className="text-2xl font-bold">{licenses.filter(l => l.status === 'active').length}</p>
              </div>
              <LockOpenIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activations</p>
                <p className="text-2xl font-bold">{instances.length}</p>
              </div>
              <ComputerDesktopIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Activations</p>
                <p className="text-2xl font-bold">
                  {licenses.reduce((acc, l) => acc + (l.activations_limit - l.instances_count), 0)}
                </p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activate License Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4`}>
            <h3 className="text-lg font-bold mb-4">Activate License</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">License Key</label>
                <input
                  type="text"
                  value={activationData.license_key}
                  onChange={(e) => setActivationData({...activationData, license_key: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 font-mono"
                  placeholder="EG-XXXX-XXXX-XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Device Name</label>
                <input
                  type="text"
                  value={activationData.name}
                  onChange={(e) => setActivationData({...activationData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  placeholder="My MacBook Pro"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowActivateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={activateLicense}
                disabled={!activationData.license_key || !activationData.name}
              >
                Activate License
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManager;
