import { useState, useEffect, useCallback } from 'react';
import { getQuestionTypes } from '../services/questionTypes';

/**
 * Custom hook for question types state management
 * @returns {Object} - Question types state and functions
 */
export const useQuestionTypes = () => {
  const [questionTypes, setQuestionTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch question types
   */
  const fetchQuestionTypes = useCallback(async () => {
    try {
      console.log('🔄 Fetching question types...');
      setLoading(true);
      setError(null);
      
      const data = await getQuestionTypes();
      console.log('✅ Question types fetched:', data);
      setQuestionTypes(data.question_types || []);
    } catch (err) {
      console.error('❌ Error fetching question types:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize question types on mount
   */
  useEffect(() => {
    fetchQuestionTypes();
  }, [fetchQuestionTypes]);

  /**
   * Get question types by level
   */
  const getQuestionTypesByLevel = useCallback((level) => {
    return questionTypes.filter(type => 
      type.toLowerCase().includes(level.toLowerCase())
    );
  }, [questionTypes]);

  /**
   * Refresh question types
   */
  const refreshQuestionTypes = useCallback(() => {
    fetchQuestionTypes();
  }, [fetchQuestionTypes]);

  return {
    questionTypes,
    loading,
    error,
    fetchQuestionTypes,
    getQuestionTypesByLevel,
    refreshQuestionTypes,
  };
};
