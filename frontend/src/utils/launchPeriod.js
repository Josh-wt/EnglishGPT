/**
 * Launch period utility functions
 * Manages the launch period logic across the application
 */

/**
 * Check if we're currently in the launch period
 * @returns {boolean} - True if in launch period, false otherwise
 */
export const isLaunchPeriod = () => {
  // Launch period: Extended until March 1st, 2025
  const launchEndDate = new Date('2025-03-01');
  return new Date() < launchEndDate;
};

/**
 * Get the launch period end date
 * @returns {Date} - The end date of the launch period
 */
export const getLaunchEndDate = () => {
  return new Date('2025-03-01');
};

/**
 * Get the number of days remaining in the launch period
 * @returns {number} - Days remaining (0 if launch period has ended)
 */
export const getDaysRemaining = () => {
  if (!isLaunchPeriod()) return 0;
  
  const now = new Date();
  const endDate = getLaunchEndDate();
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Get launch period message for display
 * @returns {string} - Formatted message about the launch period
 */
export const getLaunchPeriodMessage = () => {
  if (!isLaunchPeriod()) {
    return 'Launch period has ended. Choose your plan below.';
  }
  
  const daysRemaining = getDaysRemaining();
  if (daysRemaining === 0) {
    return 'Last day of launch period! Get unlimited access today!';
  } else if (daysRemaining === 1) {
    return 'Only 1 day left in launch period! Get unlimited access now!';
  } else {
    return `${daysRemaining} days left in launch period! Get unlimited access now!`;
  }
};

/**
 * Apply launch period benefits to user stats
 * @param {Object} userStats - User statistics object
 * @returns {Object} - User stats without any modifications (launch period benefits removed)
 */
export const applyLaunchPeriodBenefits = (userStats) => {
  // Launch period benefits have been removed - return user stats as-is
  return {
    ...userStats,
    questionsMarked: userStats?.questions_marked || userStats?.questionsMarked || 0,
    evaluationsUsed: userStats?.evaluations_used || userStats?.evaluationsUsed || 0,
  };
};
