import { usePreferences } from './usePreferences';

export const usePrivacy = () => {
  const { preferences } = usePreferences();
  
  const isPrivacyMode = preferences.privacy_mode;
  
  // Function to mask sensitive information
  const maskSensitiveInfo = (text, type = 'email') => {
    if (!isPrivacyMode || !text) return text;
    
    switch (type) {
      case 'email':
        const [username, domain] = text.split('@');
        if (username && domain) {
          const maskedUsername = username.length > 2 
            ? username.substring(0, 2) + '*'.repeat(username.length - 2)
            : '*'.repeat(username.length);
          return `${maskedUsername}@${domain}`;
        }
        return text;
      
      case 'name':
        if (text.length > 2) {
          return text.substring(0, 1) + '*'.repeat(text.length - 1);
        }
        return '*'.repeat(text.length);
      
      case 'id':
        if (text.length > 8) {
          return text.substring(0, 4) + '*'.repeat(text.length - 8) + text.substring(text.length - 4);
        }
        return '*'.repeat(text.length);
      
      default:
        return text;
    }
  };
  
  // Function to limit data collection
  const shouldCollectData = (dataType) => {
    if (!isPrivacyMode) return true;
    
    // In privacy mode, limit certain data collection
    const restrictedTypes = ['analytics', 'usage_stats', 'performance_metrics'];
    return !restrictedTypes.includes(dataType);
  };
  
  // Function to hide progress indicators
  const shouldShowProgress = () => {
    return !isPrivacyMode || preferences.show_progress;
  };
  
  return {
    isPrivacyMode,
    maskSensitiveInfo,
    shouldCollectData,
    shouldShowProgress
  };
};
