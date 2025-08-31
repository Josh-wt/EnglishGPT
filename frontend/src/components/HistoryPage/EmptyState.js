import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ onStartQuestion }) => {
  return (
    <motion.div 
      className="text-center py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-6xl mb-6">📝</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">No essays yet</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Start writing your first essay to see your evaluation history and track your progress over time.
      </p>
      <motion.button
        onClick={onStartQuestion}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Write Your First Essay
      </motion.button>
    </motion.div>
  );
};

export default EmptyState;
