import { useState, useEffect, useCallback } from 'react';
import { useUser } from './useUser';
import api from '../services/api';

export const usePreferences = () => {
  const { user } = useUser();
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
  const [loading, setLoading] = useState(false);

  // Load preferences from backend
  const loadPreferences = useCallback(async () => {
    if (!user?.uid && !user?.id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/users/${user?.uid || user?.id}/preferences`);
      if (response.data) {
        setPreferences(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // If backend fails, try to load from localStorage as fallback
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences);
          setPreferences(prev => ({ ...prev, ...parsed }));
        } catch (parseError) {
          console.error('Error parsing saved preferences:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.id]);

  // Save preferences to backend and localStorage
  const updatePreference = useCallback(async (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Save to localStorage immediately for instant feedback
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    
    // Save to backend
    if (user?.uid || user?.id) {
      try {
        await api.put(`/users/${user?.uid || user?.id}/preferences`, {
          [key]: value
        });
      } catch (error) {
        console.error('Error saving preference to backend:', error);
        // Don't revert the change since it's saved locally
      }
    }
  }, [preferences, user?.uid, user?.id]);

  // Load preferences when user changes
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user, loadPreferences]);

  return {
    preferences,
    updatePreference,
    loading,
    loadPreferences
  };
};
