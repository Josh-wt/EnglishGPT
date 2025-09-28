import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  CheckCircleIcon, 
  KeyIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  GiftIcon,
  SparklesIcon,
  TrophyIcon,
  RocketLaunchIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  HeartIcon,
  LightBulbIcon,
  BoltIcon
} from '@heroicons/react/24/solid';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentSuccess = ({ user, darkMode, forceRefreshUserData }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [licenseKey, setLicenseKey] = useState(null);

  // Refresh user data when component mounts (after successful payment)
  useEffect(() => {
    if (forceRefreshUserData) {
      console.log('🔄 PaymentSuccess: Refreshing user data after successful payment...');
      forceRefreshUserData().then(() => {
        console.log('✅ PaymentSuccess: User data refreshed successfully');
      }).catch((error) => {
        console.error('❌ PaymentSuccess: Failed to refresh user data:', error);
      });
    }
  }, [forceRefreshUserData]);

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
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.h2 
            className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Processing Your Payment
          </motion.h2>
          <motion.p 
            className="text-gray-600 dark:text-gray-400"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Please wait while we confirm your purchase...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-32 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20"
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-20"
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-32 right-1/3 w-14 h-14 bg-purple-200 rounded-full opacity-20"
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Success Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="relative mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <TrophyIcon className="w-16 h-16 text-white drop-shadow-lg" />
              </motion.div>
            </div>
            
            {/* Floating Icons */}
            <motion.div
              className="absolute -top-4 -right-4"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <StarIcon className="w-8 h-8 text-yellow-400" />
            </motion.div>
            
            <motion.div
              className="absolute -bottom-2 -left-4"
              animate={{ 
                rotate: [0, -360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <SparklesIcon className="w-6 h-6 text-blue-400" />
            </motion.div>
          </motion.div>

          <motion.h1 
            className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Payment Successful!
          </motion.h1>
          
          <motion.p 
            className="text-2xl text-gray-600 dark:text-gray-300 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Welcome to the EnglishGPT family!
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <BoltIcon className="w-6 h-6" />
            <span>You now have lifetime unlimited access!</span>
            <BoltIcon className="w-6 h-6" />
          </motion.div>
        </motion.div>

        {/* Payment Details */}
        {paymentData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-xl border-2 border-green-200 dark:border-green-800`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <SparklesIcon className="w-6 h-6 text-blue-600" />
                  </motion.div>
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
          </motion.div>
        )}

        {/* License Key */}
        {licenseKey && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-xl border-2 border-purple-200 dark:border-purple-800`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <KeyIcon className="w-6 h-6 text-purple-600" />
                  </motion.div>
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
          </motion.div>
        )}

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-xl border-2 border-yellow-200 dark:border-yellow-800`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <GiftIcon className="w-6 h-6 text-yellow-600" />
                </motion.div>
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.7 }}
                >
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <RocketLaunchIcon className="w-5 h-5 text-green-500" />
                    Get Started
                  </h4>
                  <ul className="space-y-3">
                    <motion.li 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 1.9 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </motion.div>
                      <span>Access your account dashboard</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 2.0 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      >
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </motion.div>
                      <span>Start evaluating your essays</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 2.1 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      >
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </motion.div>
                      <span>Track your writing progress</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 2.2 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                      >
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </motion.div>
                      <span>Get AI-powered feedback</span>
                    </motion.li>
                  </ul>
                </motion.div>

                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.7 }}
                >
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <HeartIcon className="w-5 h-5 text-red-500" />
                    Support & Resources
                  </h4>
                  <ul className="space-y-3">
                    <motion.li 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 1.9 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <BookOpenIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      </motion.div>
                      <span>Read our getting started guide</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 2.0 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                      >
                        <LightBulbIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      </motion.div>
                      <span>Watch tutorial videos</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 2.1 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2 }}
                      >
                        <AcademicCapIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      </motion.div>
                      <span>Contact customer support</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 2.2 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 3 }}
                      >
                        <ChartBarIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </motion.div>
                      <span>Join our community forum</span>
                    </motion.li>
                  </ul>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="text-center space-y-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.7 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleContinue} 
                size="lg" 
                className="px-10 py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRightIcon className="w-5 h-5 ml-3" />
                </motion.div>
              </Button>
            </motion.div>
            
            {paymentData?.digital_products_delivered && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleDownload} 
                  variant="outline" 
                  size="lg" 
                  className={`px-10 py-3 text-lg font-semibold border-2 ${darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  Download Products
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <DocumentTextIcon className="w-5 h-5 ml-3" />
                  </motion.div>
                </Button>
              </motion.div>
            )}
          </div>
          
          <motion.p 
            className="text-base text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.9 }}
          >
            Questions? Reach out to our dedicated support team at{' '}
            <a 
              href="mailto:support@everythingenglish.xyz" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              support@everythingenglish.xyz
            </a>
          </motion.p>
        </motion.div>

        {/* Email Confirmation Notice */}
        <motion.div 
          className="mt-12 p-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl shadow-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.9 }}
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <EnvelopeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            </motion.div>
            <div>
              <h4 className="font-bold text-xl text-blue-900 dark:text-blue-100 mb-1">Confirmation Email Sent!</h4>
              <p className="text-base text-blue-800 dark:text-blue-200">
                We've dispatched a detailed confirmation email with your receipt and account specifics to{' '}
                <span className="font-semibold text-blue-700 dark:text-blue-300">{user?.email}</span>. 
                Please check your inbox (and spam folder, just in case) for all the important details.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
