import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Header from './Header';
import UserProfile from './UserProfile';
import SubscriptionInfo from './SubscriptionInfo';
import TransactionHistory from './TransactionHistory';
import AcademicLevelSelector from './AcademicLevelSelector';
import Footer from '../ui/Footer';
import { 
  BellIcon, 
  EnvelopeIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  DocumentTextIcon,
  LightBulbIcon,
  SpeakerWaveIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  ClockIcon,
  EyeIcon,
  PaletteIcon,
  AdjustmentsHorizontalIcon,
  CommandLineIcon,
  ArrowRightIcon,
  DocumentCheckIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  LockClosedIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

const AccountPage = ({ onBack, user, userStats, onLevelChange, showLevelPrompt = false, darkMode, toggleDarkMode, onPricing, defaultTab = 'profile' }) => {
  const [academicLevel, setAcademicLevel] = useState(userStats?.academicLevel || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    marketing_emails: false,
    show_progress: true,
    use_data_for_training: true,
    auto_save_drafts: true,
    show_tips: true,
    sound_effects: true,
    compact_mode: false,
    language_preference: 'en',
    timezone: 'UTC',
    notification_frequency: 'immediate',
    feedback_detail_level: 'detailed',
    theme_color: 'blue',
    font_size: 'medium',
    accessibility_mode: false,
    keyboard_shortcuts: true,
    auto_advance: false,
    show_word_count: true,
    show_character_count: false,
    spell_check: true,
    grammar_suggestions: true,
    writing_style: 'academic',
    focus_mode: false,
    distraction_free: false,
    auto_backup: true,
    cloud_sync: true,
    privacy_mode: false,
    data_retention_days: 365,
    export_format: 'pdf',
    backup_frequency: 'daily'
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    setError('');
    const userId = user?.uid || user?.id;
    
    // Load user preferences when component mounts
    if (userId) {
      loadUserPreferences();
    }
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
    
    // Auto-save preferences to backend
    try {
      setPreferencesLoading(true);
      await api.put(`/users/${user?.uid || user?.id}/preferences`, {
        [key]: value
      });
      setSuccess('Preference updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving preference:', error);
      setError('Failed to save preference. Please try again.');
    } finally {
      setPreferencesLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    if (!user?.uid && !user?.id) return;
    
    try {
      setPreferencesLoading(true);
      const response = await api.get(`/users/${user?.uid || user?.id}/preferences`);
      if (response.data) {
        setPreferences(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setPreferencesLoading(false);
    }
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
              <h2 className="text-lg font-semibold mb-6">Preferences</h2>
              {preferencesLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                  Saving preferences...
                </div>
              )}
              
              <div className="space-y-8">
                {/* Notifications Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <BellIcon className="w-5 h-5 mr-2" />
                    Notifications
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive email updates about your evaluations</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('email_notifications', !preferences.email_notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.email_notifications ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
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
                        onClick={() => handlePreferenceChange('marketing_emails', !preferences.marketing_emails)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.marketing_emails ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.marketing_emails ? 'translate-x-6' : 'translate-x-1'
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
                        onClick={() => handlePreferenceChange('show_progress', !preferences.show_progress)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.show_progress ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.show_progress ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Privacy & Data Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    Privacy & Data
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Use Data for AI Training</h3>
                        <p className="text-sm text-gray-500">Allow your essays and feedback to improve our AI models (anonymized)</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('use_data_for_training', !preferences.use_data_for_training)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.use_data_for_training ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.use_data_for_training ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Privacy Mode</h3>
                        <p className="text-sm text-gray-500">Hide sensitive information and limit data collection</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('privacy_mode', !preferences.privacy_mode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.privacy_mode ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.privacy_mode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Writing Experience Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <PencilIcon className="w-5 h-5 mr-2" />
                    Writing Experience
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Auto-save Drafts</h3>
                        <p className="text-sm text-gray-500">Automatically save your work as you type</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('auto_save_drafts', !preferences.auto_save_drafts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.auto_save_drafts ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.auto_save_drafts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Tips</h3>
                        <p className="text-sm text-gray-500">Display helpful writing tips and suggestions</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('show_tips', !preferences.show_tips)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.show_tips ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.show_tips ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Spell Check</h3>
                        <p className="text-sm text-gray-500">Enable automatic spell checking</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('spell_check', !preferences.spell_check)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.spell_check ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.spell_check ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Grammar Suggestions</h3>
                        <p className="text-sm text-gray-500">Get real-time grammar improvement suggestions</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('grammar_suggestions', !preferences.grammar_suggestions)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.grammar_suggestions ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.grammar_suggestions ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Word Count</h3>
                        <p className="text-sm text-gray-500">Display word count while writing</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('show_word_count', !preferences.show_word_count)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.show_word_count ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.show_word_count ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interface & Accessibility Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <CogIcon className="w-5 h-5 mr-2" />
                    Interface & Accessibility
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
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

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Compact Mode</h3>
                        <p className="text-sm text-gray-500">Use a more compact interface layout</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('compact_mode', !preferences.compact_mode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.compact_mode ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.compact_mode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Accessibility Mode</h3>
                        <p className="text-sm text-gray-500">Enhanced accessibility features</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('accessibility_mode', !preferences.accessibility_mode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.accessibility_mode ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.accessibility_mode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Sound Effects</h3>
                        <p className="text-sm text-gray-500">Play sound effects for interactions</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('sound_effects', !preferences.sound_effects)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.sound_effects ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.sound_effects ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                    Advanced Settings
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Frequency
                      </label>
                      <select
                        value={preferences.notification_frequency}
                        onChange={(e) => handlePreferenceChange('notification_frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback Detail Level
                      </label>
                      <select
                        value={preferences.feedback_detail_level}
                        onChange={(e) => handlePreferenceChange('feedback_detail_level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="basic">Basic</option>
                        <option value="detailed">Detailed</option>
                        <option value="comprehensive">Comprehensive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Writing Style
                      </label>
                      <select
                        value={preferences.writing_style}
                        onChange={(e) => handlePreferenceChange('writing_style', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="academic">Academic</option>
                        <option value="creative">Creative</option>
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size
                      </label>
                      <select
                        value={preferences.font_size}
                        onChange={(e) => handlePreferenceChange('font_size', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="extra-large">Extra Large</option>
                      </select>
                    </div>
                  </div>
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
