import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import AnalyticsOverview from './AnalyticsOverview';
import SearchFilters from './SearchFilters';
import EvaluationsGrid from './EvaluationsGrid';
import EvaluationDetailModal from './EvaluationDetailModal';
import CompareModal from './CompareModal';
import EmptyState from './EmptyState';
import LockedAnalyticsPage from '../LockedAnalyticsPage';

const HistoryPage = ({ onBack, evaluations, userPlan }) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Helper function for unlimited plan checking
  const hasUnlimitedAccess = () => {
    const plan = userPlan?.toLowerCase();
    return plan === 'unlimited';
  };
  
  // Calculate analytics from evaluations
  const getAnalytics = () => {
    if (!evaluations.length) return { avgScore: 0, totalEssays: 0, improvement: 0, recentActivity: [] };
    
    const scores = evaluations.map(e => {
      const match = e.grade.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const recentScores = scores.slice(0, 5);
    const olderScores = scores.slice(5, 10);
    const improvement = recentScores.length > 0 && olderScores.length > 0 
      ? ((recentScores.reduce((a, b) => a + b, 0) / recentScores.length) - 
         (olderScores.reduce((a, b) => a + b, 0) / olderScores.length))
      : 0;
    
    return {
      avgScore: Math.round(avgScore * 10) / 10,
      totalEssays: evaluations.length,
      improvement: Math.round(improvement * 10) / 10,
      recentActivity: evaluations.slice(0, 5)
    };
  };
  
  const analytics = getAnalytics();
  
  // Parse feedback text into bullet points
  const parseFeedbackToBullets = (feedback) => {
    if (!feedback) return [];
    
    // Split by common delimiters
    const sentences = feedback
      .split(/[.!?]+/)
        .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10) // Only meaningful sentences
      .slice(0, 10); // Limit to 10 points
    
    return sentences;
  };

  const getSubmarks = (evaluation) => {
    if (!evaluation) return [];
    const metricsByType = {
      igcse_writers_effect: ['READING'],
      igcse_descriptive: ['READING', 'WRITING'],
      igcse_narrative: ['READING', 'WRITING'],
      igcse_summary: ['READING', 'WRITING'],
      alevel_directed: ['AO1', 'AO2'],
      alevel_directed_writing: ['AO1', 'AO2'],
      alevel_comparative: ['AO1', 'AO3'],
      alevel_text_analysis: ['AO1', 'AO3'],
    };
    const defaultMax = {
      igcse_writers_effect: { READING: 15 },
      igcse_descriptive: { READING: 16, WRITING: 24 },
      igcse_narrative: { READING: 16, WRITING: 24 },
      igcse_summary: { READING: 10, WRITING: 5 },
      alevel_directed: { AO1: 5, AO2: 5 },
      alevel_directed_writing: { AO1: 5, AO2: 5 },
      alevel_comparative: { AO1: 5, AO3: 10 },
      alevel_text_analysis: { AO1: 5, AO3: 20 },
    };
    const formatValue = (raw, fallbackMax) => {
      if (!raw || typeof raw !== 'string') return '';
      const text = raw.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
      const slash = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (slash) return `${slash[1]}/${slash[2]}`;
      const outOf = text.match(/(\d+)\s*(?:out of|of)\s*(\d+)/i);
      if (outOf) return `${outOf[1]}/${outOf[2]}`;
      const firstNum = text.match(/\d+/);
      if (firstNum && fallbackMax) return `${firstNum[0]}/${fallbackMax}`;
      return firstNum ? firstNum[0] : '';
    };
    const type = evaluation.question_type;
    const metrics = metricsByType[type] || [];
    const results = [];
    metrics.forEach((metric) => {
      let raw = '';
      if (metric === 'READING') raw = evaluation.reading_marks || '';
      if (metric === 'WRITING') raw = evaluation.writing_marks || '';
      if (metric === 'AO1') raw = evaluation.ao1_marks || '';
      if (metric === 'AO2') raw = evaluation.ao2_marks || '';
      if (metric === 'AO3') raw = evaluation.ao2_marks || evaluation.ao1_marks || '';
      const value = formatValue(raw, defaultMax[type]?.[metric]);
      if (value) results.push({ label: metric, value });
    });
    return results;
  };

  const toggleSelectForCompare = (evaluation) => {
    setSelectedForCompare((prev) => {
      const exists = prev.find((e) => e.id === evaluation.id);
      if (exists) {
        return prev.filter((e) => e.id !== evaluation.id);
      }
      if (prev.length >= 2) {
        // replace the first selected if already two
        return [prev[1], evaluation];
      }
      return [...prev, evaluation];
    });
  };

  const openCompare = () => {
    if (selectedForCompare.length === 2) setShowCompare(true);
  };
  
  // Filter and search evaluations
  const filteredEvaluations = evaluations.filter(evaluation => {
    // Text search in student response, feedback, and question type
    const matchesSearch = searchTerm === '' || 
      evaluation.student_response.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.question_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.grade.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by question type
    const matchesFilter = filterType === 'all' || 
      evaluation.question_type.includes(filterType);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Sort evaluations
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    
    switch (sortBy) {
      case 'oldest':
        return dateA - dateB;
      case 'newest':
      default:
        return dateB - dateA;
      case 'grade_high':
        const gradeA = parseInt(a.grade.match(/\d+/)?.[0] || 0);
        const gradeB = parseInt(b.grade.match(/\d+/)?.[0] || 0);
        return gradeB - gradeA;
      case 'grade_low':
        const gradeA2 = parseInt(a.grade.match(/\d+/)?.[0] || 0);
        const gradeB2 = parseInt(b.grade.match(/\d+/)?.[0] || 0);
        return gradeA2 - gradeB2;
    }
  });
  
  useEffect(() => {
    const onKey = (e) => {
      if (selectedEvaluation && e.key === 'Escape') {
        e.preventDefault();
        setSelectedEvaluation(null);
      }
      if (showCompare && e.key === 'Escape') {
        e.preventDefault();
        setShowCompare(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEvaluation, showCompare]);

  if (!hasUnlimitedAccess()) {
    return <LockedAnalyticsPage onBack={onBack} upgradeType="unlimited" page="history" />;
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Header 
        onBack={onBack}
        selectedForCompare={selectedForCompare}
        onOpenCompare={openCompare}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsOverview analytics={analytics} />
        
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredEvaluations={filteredEvaluations}
          evaluations={evaluations}
          selectedForCompare={selectedForCompare}
        />

        {filteredEvaluations.length === 0 ? (
          <EmptyState onBack={onBack} />
        ) : (
          <EvaluationsGrid
            evaluations={filteredEvaluations}
            viewMode={viewMode}
            selectedForCompare={selectedForCompare}
            onToggleSelectForCompare={toggleSelectForCompare}
            onSelectEvaluation={setSelectedEvaluation}
            getSubmarks={getSubmarks}
          />
        )}
      </div>

      <EvaluationDetailModal
        evaluation={selectedEvaluation}
        onClose={() => setSelectedEvaluation(null)}
        parseFeedbackToBullets={parseFeedbackToBullets}
      />

      <CompareModal
        isOpen={showCompare}
        evaluations={selectedForCompare}
        onClose={() => setShowCompare(false)}
        getSubmarks={getSubmarks}
      />
    </motion.div>
  );
};

export default HistoryPage;
