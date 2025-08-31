import { useState, useCallback } from 'react';
import { getEvaluations, submitEvaluation, getEvaluation, deleteEvaluation, updateEvaluation } from '../services/evaluations';

/**
 * Custom hook for evaluations management
 * @returns {Object} - Evaluations state and functions
 */
export const useEvaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch user evaluations
   * @param {string} userId - The user ID
   * @param {Object} filters - Optional filters
   */
  const fetchEvaluations = useCallback(async (userId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getEvaluations(userId, filters);
      setEvaluations(data.evaluations || []);
      
      return data;
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit a new evaluation
   * @param {Object} evaluationData - The evaluation data
   */
  const submitNewEvaluation = useCallback(async (evaluationData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await submitEvaluation(evaluationData);
      
      // Add the new evaluation to the list
      setEvaluations(prev => [result.evaluation, ...prev]);
      
      return result;
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a specific evaluation
   * @param {string} evaluationId - The evaluation ID
   */
  const fetchEvaluation = useCallback(async (evaluationId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getEvaluation(evaluationId);
      return data;
    } catch (err) {
      console.error('Error fetching evaluation:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete an evaluation
   * @param {string} evaluationId - The evaluation ID
   */
  const removeEvaluation = useCallback(async (evaluationId) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteEvaluation(evaluationId);
      
      // Remove the evaluation from the list
      setEvaluations(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
    } catch (err) {
      console.error('Error deleting evaluation:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an evaluation
   * @param {string} evaluationId - The evaluation ID
   * @param {Object} updateData - The data to update
   */
  const updateEvaluationData = useCallback(async (evaluationId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await updateEvaluation(evaluationId, updateData);
      
      // Update the evaluation in the list
      setEvaluations(prev => prev.map(evaluation => 
        eval.id === evaluationId ? { ...eval, ...result.evaluation } : eval
      ));
      
      return result;
    } catch (err) {
      console.error('Error updating evaluation:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear evaluations
   */
  const clearEvaluations = useCallback(() => {
    setEvaluations([]);
    setError(null);
  }, []);

  /**
   * Add evaluation to list (for optimistic updates)
   * @param {Object} evaluation - The evaluation to add
   */
  const addEvaluation = useCallback((evaluation) => {
    setEvaluations(prev => [evaluation, ...prev]);
  }, []);

  /**
   * Update evaluation in list (for optimistic updates)
   * @param {string} evaluationId - The evaluation ID
   * @param {Object} updateData - The data to update
   */
  const updateEvaluationInList = useCallback((evaluationId, updateData) => {
    setEvaluations(prev => prev.map(evaluation => 
      eval.id === evaluationId ? { ...eval, ...updateData } : eval
    ));
  }, []);

  /**
   * Remove evaluation from list (for optimistic updates)
   * @param {string} evaluationId - The evaluation ID
   */
  const removeEvaluationFromList = useCallback((evaluationId) => {
    setEvaluations(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
  }, []);

  return {
    evaluations,
    loading,
    error,
    fetchEvaluations,
    submitNewEvaluation,
    fetchEvaluation,
    removeEvaluation,
    updateEvaluationData,
    clearEvaluations,
    addEvaluation,
    updateEvaluationInList,
    removeEvaluationFromList,
  };
};
