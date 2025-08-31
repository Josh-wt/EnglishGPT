import React from 'react';
import { motion } from 'framer-motion';

const AcademicLevelSelector = ({ academicLevel, onLevelChange, showLevelPrompt, error }) => {
  const levels = [
    { value: 'igcse', label: 'IGCSE', description: 'International General Certificate of Secondary Education' },
    { value: 'alevel', label: 'A-Level', description: 'Advanced Level General Certificate of Education' },
    { value: 'ib', label: 'IB', description: 'International Baccalaureate' },
    { value: 'sat', label: 'SAT', description: 'Scholastic Assessment Test' },
    { value: 'ap', label: 'AP', description: 'Advanced Placement' }
  ];

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Academic Level</h2>
        {showLevelPrompt && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            Please select your level
          </div>
        )}
      </div>
      
      {showLevelPrompt && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 text-sm">
            To provide you with the most accurate feedback, please select your academic level.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {levels.map((level) => (
          <motion.button
            key={level.value}
            onClick={() => onLevelChange(level.value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              academicLevel === level.value
                ? 'border-purple-500 bg-purple-50 text-purple-900'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300 hover:bg-purple-25'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="font-semibold">{level.label}</div>
            <div className="text-xs opacity-75 mt-1">{level.description}</div>
          </motion.button>
        ))}
      </div>

      {error && (
        <motion.div 
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {academicLevel && (
        <motion.div 
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✓ Academic level set to: <strong>{levels.find(l => l.value === academicLevel)?.label}</strong>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AcademicLevelSelector;
