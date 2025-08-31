import React from 'react';
import { motion } from 'framer-motion';
import SummaryTab from './SummaryTab';
import StrengthsTab from './StrengthsTab';
import ImprovementsTab from './ImprovementsTab';

const ResultsTabs = ({ 
  activeTab, 
  setActiveTab, 
  evaluation, 
  gradeInfo, 
  letterGrade, 
  darkMode, 
  onFeedback 
}) => {
  const tabs = [
    { id: 'Summary', label: 'Summary', icon: '📊' },
    { id: 'Strengths', label: 'Strengths', icon: '✅' },
    { id: 'Improvements', label: 'Improvements', icon: '💡' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Summary':
        return (
          <SummaryTab 
            evaluation={evaluation} 
            gradeInfo={gradeInfo} 
            letterGrade={letterGrade}
            darkMode={darkMode}
            onFeedback={onFeedback}
          />
        );
      case 'Strengths':
        return (
          <StrengthsTab 
            evaluation={evaluation} 
            darkMode={darkMode}
            onFeedback={onFeedback}
          />
        );
      case 'Improvements':
        return (
          <ImprovementsTab 
            evaluation={evaluation} 
            darkMode={darkMode}
            onFeedback={onFeedback}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === tab.id
                ? `${darkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'}`
                : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default ResultsTabs;
