import { useState, useCallback } from 'react';
import { getUserSubscription } from '../services/user';
import subscriptionService from '../services/subscriptionService';

/**
 * Custom hook for subscription management
 * @returns {Object} - Subscription state and functions
 */
export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch user subscription
   * @param {string} userId - The user ID
   */
  const fetchSubscription = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getUserSubscription(userId);
      setSubscription(data);
      
      return data;
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Redirect to checkout
   * @param {string} userId - The user ID
   * @param {string} planType - The plan type
   */
  const redirectToCheckout = useCallback(async (userId, planType) => {
    try {
      setLoading(true);
      setError(null);
      
      await subscriptionService.redirectToCheckout(userId, planType);
    } catch (err) {
      console.error('Error redirecting to checkout:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user has unlimited access
   * @param {Object} userStats - User statistics
   * @returns {boolean} - Whether user has unlimited access
   */
  const hasUnlimitedAccess = useCallback((userStats) => {
    if (!userStats?.currentPlan) return false;
    return userStats?.currentPlan?.toLowerCase() === 'unlimited';
  }, []);

  /**
   * Check if user has free evaluations remaining
   * @param {Object} userStats - User statistics
   * @returns {boolean} - Whether user has free evaluations remaining
   */
  const hasFreeEvaluationsRemaining = useCallback((userStats) => {
    if (!userStats) return false;
    return (userStats?.evaluationsUsed || 0) < (userStats?.evaluationsLimit || 0);
  }, []);

  /**
   * Get remaining free evaluations
   * @param {Object} userStats - User statistics
   * @returns {number} - Number of remaining free evaluations
   */
  const getRemainingFreeEvaluations = useCallback((userStats) => {
    if (!userStats) return 0;
    return Math.max(0, (userStats?.evaluationsLimit || 0) - (userStats?.evaluationsUsed || 0));
  }, []);

  /**
   * Check if feature is locked
   * @param {string} feature - The feature to check
   * @param {Object} userStats - User statistics
   * @returns {boolean} - Whether feature is locked
   */
  const isFeatureLocked = useCallback((feature, userStats) => {
    if (!userStats) return true;
    
    switch (feature) {
      case 'analytics':
        return !hasUnlimitedAccess(userStats);
      case 'ai_recommendations':
        return !hasUnlimitedAccess(userStats);
      case 'unlimited_evaluations':
        return !hasUnlimitedAccess(userStats);
      case 'priority_support':
        return !hasUnlimitedAccess(userStats);
      default:
        return false;
    }
  }, [hasUnlimitedAccess]);

  /**
   * Get upgrade type for feature
   * @param {string} feature - The feature to check
   * @param {Object} userStats - User statistics
   * @returns {string|null} - Upgrade type or null if not needed
   */
  const getUpgradeType = useCallback((feature, userStats) => {
    if (!userStats) return 'unlimited';
    
    if (hasUnlimitedAccess(userStats)) return null;
    
    switch (feature) {
      case 'analytics':
      case 'ai_recommendations':
      case 'unlimited_evaluations':
      case 'priority_support':
        return 'unlimited';
      default:
        return null;
    }
  }, [hasUnlimitedAccess]);

  /**
   * Clear subscription data
   */
  const clearSubscription = useCallback(() => {
    setSubscription(null);
    setError(null);
  }, []);

  return {
    subscription,
    loading,
    error,
    fetchSubscription,
    redirectToCheckout,
    hasUnlimitedAccess,
    hasFreeEvaluationsRemaining,
    getRemainingFreeEvaluations,
    isFeatureLocked,
    getUpgradeType,
    clearSubscription,
  };
};
