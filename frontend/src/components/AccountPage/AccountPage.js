import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Header from './Header';
import UserProfile from './UserProfile';
import SubscriptionInfo from './SubscriptionInfo';
import TransactionHistory from './TransactionHistory';
import AcademicLevelSelector from './AcademicLevelSelector';
import Footer from '../ui/Footer';

const AccountPage = ({ onBack, user, userStats, onLevelChange, showLevelPrompt = false, darkMode, toggleDarkMode, onPricing, defaultTab = 'profile' }) => {
  const [academicLevel, setAcademicLevel] = useState(userStats?.academicLevel || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: false,
    showProgress: true
  });
  
  useEffect(() => {
    let mounted = true;
    setError('');
    const userId = user?.uid || user?.id;
    if (user && userId) {
      // Use academic level from userStats if available, otherwise fetch from API
      if (userStats?.academicLevel) {
        setAcademicLevel(userStats.academicLevel);
      } else {
        api.get(`/users/${userId}`).then(res => {
          if (!mounted) return;
          let backendLevel = res.data.user?.academic_level || '';
          backendLevel = backendLevel.toLowerCase().replace(/[^a-z]/g, '');
          setAcademicLevel(backendLevel);
        }).catch(() => {
          // Silently handle error
        });
      }

      // Fetch transaction history
      console.debug('[ACCOUNT_PAGE_DEBUG] ===== FETCHING TRANSACTION HISTORY =====');
      console.debug('[ACCOUNT_PAGE_DEBUG] User ID for transactions:', userId);
      setTransactionsLoading(true);
      
      api.get(`/transactions/${userId}`).then(res => {
        console.debug('[ACCOUNT_PAGE_DEBUG] Transaction API response:', res);
        console.debug('[ACCOUNT_PAGE_DEBUG] Transaction data:', res.data);
        console.debug('[ACCOUNT_PAGE_DEBUG] Transactions array:', res.data.transactions);
        
        if (!mounted) return;
        const transactionData = res.data.transactions || [];
        console.debug('[ACCOUNT_PAGE_DEBUG] Setting transactions:', transactionData);
        setTransactions(transactionData);
        setTransactionsLoading(false);
        console.debug('[ACCOUNT_PAGE_DEBUG] Transaction fetch completed successfully');
      }).catch((error) => {
        console.error('[ACCOUNT_PAGE_ERROR] Transaction fetch failed:', error);
        console.error('[ACCOUNT_PAGE_ERROR] Error details:', {
          message: error.message,
          response: error.response,
          status: error.status,
          statusText: error.statusText
        });
        if (mounted) {
          setTransactions([]);
          setTransactionsLoading(false);
        }
      });
    }
    return () => { mounted = false; };
  }, [user, userStats?.academicLevel]);

  // Helper function to format transaction amount
  const formatTransactionAmount = (amountInr) => {
    // Convert INR paise to USD (assuming 1 USD = 83 INR for realistic conversion)
    const inrAmount = amountInr / 100; // Convert paise to INR
    const usdAmount = inrAmount / 83; // Convert INR to USD
    return usdAmount.toFixed(2);
  };

  const handleAcademicLevelChange = async (level) => {
    const normalized = level.toLowerCase().replace(/[^a-z]/g, '');
    setAcademicLevel(normalized);
    setError('');
    
    if (user && user.id) {
      try {
        // Use the onLevelChange prop which is the updateLevel function from useUser
        if (onLevelChange) {
          await onLevelChange(normalized);
        }
        
        // If this was triggered by the level prompt, redirect to question types
        if (showLevelPrompt) {
          // Small delay to ensure the level is updated
          setTimeout(() => {
            window.location.reload(); // Simple way to refresh and go to dashboard
          }, 500);
        }
      } catch (err) {
        setError('Failed to update level.');
      }
    } else {
      setError('Please wait for authentication to complete.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'subscription', label: 'Subscription', icon: '💳' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'history', label: 'Transaction History', icon: '📋' }
  ];

  const handlePreferenceChange = async (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setSuccess('Preference updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header onBack={onBack} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <UserProfile user={user} userStats={userStats} />
              <AcademicLevelSelector
                academicLevel={academicLevel}
                onLevelChange={handleAcademicLevelChange}
                showLevelPrompt={showLevelPrompt}
                error={error}
              />
            </div>
          )}

          {activeTab === 'subscription' && (
            <SubscriptionInfo 
              userStats={userStats} 
              onPricing={onPricing}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          )}

          {activeTab === 'preferences' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email updates about your evaluations</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('emailNotifications', !preferences.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Marketing Emails</h3>
                    <p className="text-sm text-gray-500">Receive updates about new features and offers</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('marketingEmails', !preferences.marketingEmails)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.marketingEmails ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Progress Stats</h3>
                    <p className="text-sm text-gray-500">Display your learning progress on the dashboard</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('showProgress', !preferences.showProgress)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.showProgress ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.showProgress ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Toggle dark mode theme</p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-medium text-red-600 mb-4">Danger Zone</h3>
                <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <TransactionHistory
              transactions={transactions}
              transactionsLoading={transactionsLoading}
              formatTransactionAmount={formatTransactionAmount}
            />
          )}
        </motion.div>
      </div>
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default AccountPage;
