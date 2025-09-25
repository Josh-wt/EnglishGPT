import { apiHelpers } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Create a new user record
 * @param {string} userId - The user ID
 * @param {Object} userData - The user data
 * @returns {Promise} - API response
 */
export const createUser = async (userId, userData = {}) => {
  const startTime = Date.now();
  try {
    console.log('🆕 Creating new user record for:', userId, {
      timestamp: new Date().toISOString()
    });
    const response = await apiHelpers.post(`${API_ENDPOINTS.USERS}`, {
      user_id: userId, // Backend expects user_id, not uid
      email: userData.email || '',
      name: userData.name || '',
      academic_level: userData.academic_level || 'N/A'
    });
    const duration = Date.now() - startTime;
    console.log('✅ User created successfully in', duration, 'ms:', response.data);
    
    // Backend returns {user: {...}}, so extract the user data
    const userInfo = response.data.user || response.data;
    
    // Note: Launch period benefits are applied in applyLaunchPeriodBenefits function
    // Don't modify data here to avoid conflicts
    
    return userInfo;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Error creating user after', duration, 'ms:', error);
    throw error;
  }
};

/**
 * Get user profile
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getUserProfile = async (userId, options = {}) => {
  const startTime = Date.now();
  try {
    console.log('🔍 Fetching user profile for:', userId, {
      timestamp: new Date().toISOString()
    });
    
    const apiCallStartTime = Date.now();
    console.log(`🚀 Starting user profile API call at ${new Date().toISOString()}`);
    
    // Use caching with longer cache time for user profiles (5 minutes)
    const response = await apiHelpers.get(`${API_ENDPOINTS.USERS}/${userId}`, {}, {
      cache: true,
      cacheTime: 300000, // 5 minutes
      deduplicate: true,
      ...options
    });
    
    const apiCallTime = Date.now() - apiCallStartTime;
    console.log(`📊 User profile API call completed in ${apiCallTime}ms`);
    
    const duration = Date.now() - startTime;
    console.log(`📊 User profile response received in ${duration}ms:`, response.data);
    
    // Handle both response structures: {user: {...}} and direct user data
    const userData = response.data.user || response.data;
    
    // Note: Launch period benefits are applied in applyLaunchPeriodBenefits function
    // Don't modify data here to avoid conflicts
    
    return userData;
  } catch (error) {
    const duration = Date.now() - startTime;
    const apiCallDuration = Date.now() - (startTime + (Date.now() - startTime - duration));
    
    console.error(`❌ Error fetching user profile after ${duration}ms:`, {
      error: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      timeout: error.config?.timeout,
      isCanceled: error.name === 'CanceledError' || error.code === 'ERR_CANCELED',
      isTimeout: error.code === 'ECONNABORTED',
      apiCallDuration,
      timestamp: new Date().toISOString()
    });
    
    // If user doesn't exist (404), create them
    if (error.response?.status === 404) {
      console.log('🔄 User not found, creating new user record...');
      try {
        const createStartTime = Date.now();
        const newUser = await createUser(userId);
        const createDuration = Date.now() - createStartTime;
        console.log('✅ New user created in', createDuration, 'ms');
        return newUser;
      } catch (createError) {
        console.error('❌ Failed to create user:', createError);
        throw createError;
      }
    }
    
    // If backend is having issues (400, 500, etc.), return fallback data
    if (error.response?.status >= 400) {
      console.warn('⚠️ Backend error detected, returning fallback user data');
      console.warn('⚠️ Error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // Return fallback data that indicates backend issues
      return {
        id: userId,
        email: 'backend-error@fallback.user',
        name: 'Backend Error',
        current_plan: 'backend_error',
        credits: 0,
        questions_marked: 0,
        academic_level: 'N/A',
        backend_error: true,
        error_message: `Backend error: ${error.response.status} ${error.response.statusText}`
      };
    }
    
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - The user ID
 * @param {Object} userData - The user data to update
 * @returns {Promise} - API response
 */
export const updateUserProfile = async (userId, userData) => {
  const startTime = Date.now();
  try {
    console.log('📝 Updating user profile for:', userId, {
      updates: userData,
      timestamp: new Date().toISOString()
    });
    const response = await apiHelpers.put(`${API_ENDPOINTS.USERS}/${userId}`, userData);
    const duration = Date.now() - startTime;
    console.log('✅ User profile updated in', duration, 'ms:', response.data);
    return response.data.user || response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Error updating user profile after', duration, 'ms:', error);
    throw error;
  }
};

/**
 * Update academic level
 * @param {string} userId - The user ID
 * @param {string} academicLevel - The academic level
 * @returns {Promise} - API response
 */
export const updateAcademicLevel = async (userId, academicLevel) => {
  const startTime = Date.now();
  try {
    console.log('📝 Updating academic level for:', userId, {
      level: academicLevel,
      timestamp: new Date().toISOString()
    });
    const response = await apiHelpers.put(`${API_ENDPOINTS.USERS}/${userId}`, {
      academic_level: academicLevel
    });
    const duration = Date.now() - startTime;
    console.log('✅ Academic level updated in', duration, 'ms:', response.data);
    return response.data.user || response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Error updating academic level after', duration, 'ms:', error);
    throw error;
  }
};

/**
 * Get user stats
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getUserStats = async (userId, options = {}) => {
  const startTime = Date.now();
  try {
    console.log('📊 Fetching user stats for:', userId, {
      timestamp: new Date().toISOString()
    });
    
    const apiCallStartTime = Date.now();
    console.log(`🚀 Starting user stats API call at ${new Date().toISOString()}`);
    
    // Use caching with longer cache time for user stats (5 minutes)
    const response = await apiHelpers.get(`${API_ENDPOINTS.USERS}/${userId}`, {}, {
      cache: true,
      cacheTime: 300000, // 5 minutes
      deduplicate: true,
      ...options
    });
    
    const apiCallTime = Date.now() - apiCallStartTime;
    console.log(`📊 User stats API call completed in ${apiCallTime}ms`);
    
           const duration = Date.now() - startTime;
           console.log(`📈 User stats received in ${duration}ms:`, response.data);

           // Handle both response structures: {user: {...}} and direct user data
           const userData = response.data.user || response.data;
           
           console.log('🔍 DEBUG user.js - getUserStats response analysis:', {
             'response.data': response.data,
             'response.data.user': response.data.user,
             'final userData': userData,
             'userData.current_plan': userData?.current_plan,
             'userData.credits': userData?.credits,
             'userData.questions_marked': userData?.questions_marked
           });
    
    // Note: Launch period benefits are applied in applyLaunchPeriodBenefits function
    // Don't modify data here to avoid conflicts
    
    return userData;
  } catch (error) {
    const duration = Date.now() - startTime;
    const apiCallDuration = Date.now() - (startTime + (Date.now() - startTime - duration));
    
    console.error(`❌ Error fetching user stats after ${duration}ms:`, {
      error: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      timeout: error.config?.timeout,
      isCanceled: error.name === 'CanceledError' || error.code === 'ERR_CANCELED',
      isTimeout: error.code === 'ECONNABORTED',
      apiCallDuration,
      timestamp: new Date().toISOString()
    });
    
    // If user doesn't exist (404), create them
    if (error.response?.status === 404) {
      console.log('🔄 User not found, creating new user record...');
      try {
        const createStartTime = Date.now();
        const newUser = await createUser(userId);
        const createDuration = Date.now() - createStartTime;
        console.log('✅ New user created in', createDuration, 'ms');
        return newUser;
      } catch (createError) {
        console.error('❌ Failed to create user:', createError);
        throw createError;
      }
    }
    
    // If backend is having issues (400, 500, etc.), return fallback data
    if (error.response?.status >= 400) {
      console.warn('⚠️ Backend error detected, returning fallback user stats');
      console.warn('⚠️ Error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // Return fallback data that indicates backend issues
      return {
        id: userId,
        current_plan: 'backend_error',
        credits: 0,
        questions_marked: 0,
        academic_level: 'N/A',
        backend_error: true,
        error_message: `Backend error: ${error.response.status} ${error.response.statusText}`
      };
    }
    
    throw error;
  }
};


/**
 * Delete user account
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const deleteUserAccount = async (userId) => {
  try {
    const response = await apiHelpers.delete(`${API_ENDPOINTS.USERS}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

/**
 * Export user data
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const exportUserData = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.USERS}/${userId}/export`);
    return response.data;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

export default {
  createUser,
  getUserProfile,
  updateUserProfile,
  updateAcademicLevel,
  getUserStats,
  deleteUserAccount,
  exportUserData,
};
