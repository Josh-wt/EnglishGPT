import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getBackendUrl } from '../../utils/backendUrl';
import Header from './Header';
import UserProfile from './UserProfile';
import SubscriptionInfo from './SubscriptionInfo';
import TransactionHistory from './TransactionHistory';
import AcademicLevelSelector from './AcademicLevelSelector';

const AccountPage = ({ onBack, user, userStats, onLevelChange, showLevelPrompt = false, darkMode, toggleDarkMode, onPricing }) => {
  const [academicLevel, setAcademicLevel] = useState('');
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    setError('');
    const userId = user?.uid || user?.id;
    if (user && userId) {
      // Fetch user data and academic level
      

        axios.get(`${getBackendUrl()}/api/users/${userId}`).then(res => {
        if (!mounted) return;
        let backendLevel = res.data.user?.academic_level || '';
        backendLevel = backendLevel.toLowerCase().replace(/[^a-z]/g, '');
        setAcademicLevel(backendLevel);
      }).catch(() => {
        // Silently handle error
      });

      // Fetch transaction history
      setTransactionsLoading(true);
              axios.get(`${getBackendUrl()}/api/transactions/${userId}`).then(res => {
        if (!mounted) return;
        setTransactions(res.data.transactions || []);
        setTransactionsLoading(false);
      }).catch(() => {
        if (mounted) setTransactionsLoading(false);
      });
    }
    return () => { mounted = false; };
  }, [user]);

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
    const userId = user?.uid || user?.id;
    if (user && userId) {
      try {
        await axios.put(`${getBackendUrl()}/api/users/${userId}`, { academic_level: level });
        if (onLevelChange) onLevelChange(normalized);
        
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

  return (
    <div className="min-h-screen bg-main">
      <Header onBack={onBack} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile user={user} userStats={userStats} />
        
        <AcademicLevelSelector
          academicLevel={academicLevel}
          onLevelChange={handleAcademicLevelChange}
          showLevelPrompt={showLevelPrompt}
          error={error}
        />
        
        <SubscriptionInfo 
          userStats={userStats} 
          onPricing={onPricing}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <TransactionHistory
          transactions={transactions}
          transactionsLoading={transactionsLoading}
          formatTransactionAmount={formatTransactionAmount}
        />
      </div>
    </div>
  );
};

export default AccountPage;
