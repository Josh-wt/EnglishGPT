import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  CheckCircleIcon, 
  KeyIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  GiftIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentSuccess = ({ user, darkMode }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [licenseKey, setLicenseKey] = useState(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const subscriptionId = searchParams.get('subscription_id');
    const sessionId = searchParams.get('session_id');

    if (paymentId || subscriptionId || sessionId) {
      fetchPaymentDetails(paymentId, subscriptionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentDetails = async (paymentId, subscriptionId) => {
    try {
      let response;
      
      if (paymentId) {
        response = await fetch(`/api/payments/payments/${paymentId}`);
      } else if (subscriptionId) {
        response = await fetch(`/api/payments/subscriptions/${subscriptionId}`);
      }

      if (response?.ok) {
        const data = await response.json();
        setPaymentData(data);

        // Check for license key
        if (data.license_key || data.product_metadata?.license_key_enabled) {
          // Fetch license key details
          try {
            const licenseResponse = await fetch(`/api/payments/licenses/validate?license_key=${data.license_key || ''}`);
            if (licenseResponse.ok) {
              const licenseData = await licenseResponse.json();
              setLicenseKey(licenseData);
            }
          } catch (error) {
            console.error('Error fetching license key:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Unable to fetch payment details');
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

  const handleContinue = () => {
    if (paymentData?.subscription_id) {
      navigate('/subscription');
    } else {
      navigate('/dashboard');
    }
  };

  const handleDownload = () => {
    // In a real implementation, this would download digital products
    toast.success('Download will be available in your account');
  };

  const copyLicenseKey = () => {
    if (licenseKey?.key) {
      navigator.clipboard.writeText(licenseKey.key);
      toast.success('License key copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Payment Successful! 🎉</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Thank you for choosing EEnglishGPT. You now have lifetime access to all features!
          </p>
        </div>

        {/* Payment Details */}
        {paymentData && (
          <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-blue-600" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Transaction
                    </h4>
                    <p className="text-lg font-mono">
                      {paymentData.payment_id || paymentData.subscription_id}
                    </p>
                  </div>
                  
                  {paymentData.total_amount && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Amount
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(paymentData.total_amount, paymentData.currency)}
                      </p>
                    </div>
                  )}

                  {paymentData.recurring_amount && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Subscription
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(paymentData.recurring_amount, paymentData.currency)}
                        <span className="text-sm font-normal text-gray-500">
                          /{paymentData.payment_frequency_interval?.toLowerCase()}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Status
                    </h4>
                    <Badge variant="success" className="mt-1">
                      {paymentData.status === 'active' ? 'Subscription Active' : 'Payment Complete'}
                    </Badge>
                  </div>

                  {paymentData.current_period_end && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Next Billing
                      </h4>
                      <p className="text-lg">
                        {new Date(paymentData.current_period_end).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {paymentData.trial_end && new Date(paymentData.trial_end) > new Date() && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Trial Period
                      </h4>
                      <p className="text-lg text-green-600">
                        Ends {new Date(paymentData.trial_end).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* License Key */}
        {licenseKey && (
          <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyIcon className="w-6 h-6 text-purple-600" />
                Your License Key
              </CardTitle>
              <CardDescription>
                Keep this license key safe. You'll need it to activate premium features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono break-all">
                    {licenseKey.key}
                  </code>
                  <Button onClick={copyLicenseKey} variant="outline" size="sm">
                    Copy
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Activations:</span>
                  <span className="ml-2 font-medium">
                    {licenseKey.activations_count} / {licenseKey.activations_limit || '∞'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="ml-2 font-medium">
                    <Badge variant="success">{licenseKey.status}</Badge>
                  </span>
                </div>
                {licenseKey.expires_at && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                    <span className="ml-2 font-medium">
                      {new Date(licenseKey.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* What's Next */}
        <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GiftIcon className="w-6 h-6 text-yellow-600" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Get Started</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Access your account dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Start evaluating your essays</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Track your writing progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Get AI-powered feedback</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Support</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>Read our getting started guide</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>Watch tutorial videos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>Contact customer support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>Join our community forum</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleContinue} size="lg" className="px-8">
              Go to Dashboard
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
            {paymentData?.digital_products_delivered && (
              <Button onClick={handleDownload} variant="outline" size="lg" className="px-8">
                Download Products
                <DocumentTextIcon className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Questions? Contact our support team at{' '}
            <a 
              href="mailto:support@englishgpt.com" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              support@englishgpt.com
            </a>
          </p>
        </div>

        {/* Email Confirmation Notice */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start gap-3">
            <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Confirmation Email Sent</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                We've sent a confirmation email with your receipt and account details to{' '}
                <span className="font-medium">{user?.email}</span>. Please check your inbox and spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
