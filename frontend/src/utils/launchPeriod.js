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
 * @returns {Object} - Updated user stats with launch period benefits
 */
export const applyLaunchPeriodBenefits = (userStats) => {
  if (!isLaunchPeriod()) {
    return userStats;
  }

  // Check if user has specifically declined unlimited access
  const userId = userStats?.id || userStats?.user_id;
  const hasDeclinedUnlimited = userId && localStorage.getItem(`declinedUnlimited_${userId}`);
  
  if (hasDeclinedUnlimited) {
    console.log('🔄 Launch period: User declined unlimited, keeping their current plan from database');
    return {
      ...userStats,
      questionsMarked: userStats?.questions_marked || userStats?.questionsMarked || 0,
      evaluationsUsed: userStats?.evaluations_used || userStats?.evaluationsUsed || 0,
    };
  }

  // Check if user is already unlimited or is a new user (0 questions marked)
  const isNewUser = (userStats?.questions_marked || userStats?.questionsMarked || 0) === 0;
  const isAlreadyUnlimited = userStats?.currentPlan === 'unlimited' || 
                            userStats?.current_plan === 'unlimited' ||
                            userStats?.credits === 999999;
  
  if (isNewUser || isAlreadyUnlimited) {
    console.log('🎉 Launch period: User granted/maintaining unlimited plan!', {
      isNewUser,
      isAlreadyUnlimited,
      currentPlan: userStats?.currentPlan || userStats?.current_plan,
      credits: userStats?.credits
    });
    return {
      ...userStats,
      currentPlan: 'unlimited',
      credits: 999999,
      questionsMarked: userStats?.questions_marked || userStats?.questionsMarked || 0,
      evaluationsLimit: '∞',
      evaluationsUsed: userStats?.evaluations_used || userStats?.evaluationsUsed || 0,
    };
  } else {
    // Existing users keep their current plan
    console.log('🔄 Launch period: Existing user keeps current plan');
    return {
      ...userStats,
      questionsMarked: userStats?.questions_marked || userStats?.questionsMarked || 0,
      evaluationsUsed: userStats?.evaluations_used || userStats?.evaluationsUsed || 0,
    };
  }
};
