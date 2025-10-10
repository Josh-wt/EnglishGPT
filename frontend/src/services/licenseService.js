import api from './api';

class LicenseService {
  /**
   * Validate a license key
   * @param {string} licenseKey - The license key to validate
   * @param {string} userId - User ID for validation context
   * @returns {Promise<Object>} Validation result
   */
  async validateLicenseKey(licenseKey, userId = null) {
    try {
      const response = await api.post('/license/validate', {
        license_key: licenseKey,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('License validation error:', error);
      throw error;
    }
  }

  /**
   * Activate a license key for a user
   * @param {string} licenseKey - The license key to activate
   * @param {string} userId - User ID to activate the license for
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Activation result
   */
  async activateLicenseKey(licenseKey, userId, deviceInfo = {}) {
    try {
      const response = await api.post('/license/activate', {
        license_key: licenseKey,
        user_id: userId,
        device_info: deviceInfo
      });
      return response.data;
    } catch (error) {
      console.error('License activation error:', error);
      throw error;
    }
  }

  /**
   * Get user's license status
   * @param {string} userId - User ID
   * @returns {Promise<Object>} License status
   */
  async getUserLicenseStatus(userId) {
    try {
      const response = await api.get(`/license/user/${userId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting user license status:', error);
      throw error;
    }
  }

  /**
   * Check if user has license access for a specific action
   * @param {string} userId - User ID
   * @param {string} action - Action to check access for
   * @returns {Promise<Object>} Access check result
   */
  async checkLicenseAccess(userId, action = 'evaluation') {
    try {
      const response = await api.post('/license/check-access', {
        user_id: userId,
        action: action
      });
      return response.data;
    } catch (error) {
      console.error('License access check error:', error);
      throw error;
    }
  }

  /**
   * Get user's license usage history
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Usage history
   */
  async getUserLicenseUsage(userId) {
    try {
      const response = await api.get(`/license/user/${userId}/usage`);
      return response.data;
    } catch (error) {
      console.error('Error getting user license usage:', error);
      throw error;
    }
  }

  /**
   * Create a new license key (admin only)
   * @param {Object} licenseData - License key data
   * @returns {Promise<Object>} Created license key
   */
  async createLicenseKey(licenseData) {
    try {
      const response = await api.post('/license/create', licenseData);
      return response.data;
    } catch (error) {
      console.error('Error creating license key:', error);
      throw error;
    }
  }

  /**
   * List license keys (admin only)
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of license keys
   */
  async listLicenseKeys(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/license/list?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error listing license keys:', error);
      throw error;
    }
  }

  /**
   * Get a specific license key (admin only)
   * @param {string} licenseKeyId - License key ID
   * @returns {Promise<Object>} License key details
   */
  async getLicenseKey(licenseKeyId) {
    try {
      const response = await api.get(`/license/${licenseKeyId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting license key:', error);
      throw error;
    }
  }

  /**
   * Revoke a license key (admin only)
   * @param {string} licenseKeyId - License key ID
   * @param {string} reason - Reason for revocation
   * @returns {Promise<Object>} Revocation result
   */
  async revokeLicenseKey(licenseKeyId, reason = 'Revoked by admin') {
    try {
      const response = await api.put(`/license/${licenseKeyId}/revoke`, {
        reason: reason
      });
      return response.data;
    } catch (error) {
      console.error('Error revoking license key:', error);
      throw error;
    }
  }

  /**
   * Format license key for display
   * @param {string} licenseKey - Raw license key
   * @returns {string} Formatted license key
   */
  formatLicenseKey(licenseKey) {
    if (!licenseKey) return '';
    return licenseKey.toUpperCase().replace(/(.{4})/g, '$1-').replace(/-$/, '');
  }

  /**
   * Validate license key format
   * @param {string} licenseKey - License key to validate
   * @returns {boolean} Whether the format is valid
   */
  isValidLicenseKeyFormat(licenseKey) {
    if (!licenseKey) return false;
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return pattern.test(licenseKey.toUpperCase());
  }

  /**
   * Get license type display name
   * @param {string} licenseType - License type
   * @returns {string} Display name
   */
  getLicenseTypeDisplayName(licenseType) {
    const types = {
      'trial': 'Trial',
      'basic': 'Basic',
      'premium': 'Premium',
      'enterprise': 'Enterprise',
      'lifetime': 'Lifetime'
    };
    return types[licenseType] || licenseType;
  }

  /**
   * Get license type color classes
   * @param {string} licenseType - License type
   * @returns {string} CSS classes
   */
  getLicenseTypeColor(licenseType) {
    const colors = {
      'trial': 'text-blue-600 bg-blue-100 border-blue-200',
      'basic': 'text-green-600 bg-green-100 border-green-200',
      'premium': 'text-purple-600 bg-purple-100 border-purple-200',
      'enterprise': 'text-orange-600 bg-orange-100 border-orange-200',
      'lifetime': 'text-yellow-600 bg-yellow-100 border-yellow-200'
    };
    return colors[licenseType] || 'text-gray-600 bg-gray-100 border-gray-200';
  }

  /**
   * Check if license is expired
   * @param {string} expiresAt - Expiration date
   * @returns {boolean} Whether license is expired
   */
  isLicenseExpired(expiresAt) {
    if (!expiresAt) return false; // Never expires
    return new Date(expiresAt) < new Date();
  }

  /**
   * Get days until expiration
   * @param {string} expiresAt - Expiration date
   * @returns {number} Days until expiration (negative if expired)
   */
  getDaysUntilExpiration(expiresAt) {
    if (!expiresAt) return null; // Never expires
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate device info for license activation
   * @returns {Object} Device information
   */
  generateDeviceInfo() {
    return {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      colorDepth: window.screen?.colorDepth || 24,
      timestamp: new Date().toISOString()
    };
  }
}

// Create and export a singleton instance
const licenseService = new LicenseService();
export default licenseService;
