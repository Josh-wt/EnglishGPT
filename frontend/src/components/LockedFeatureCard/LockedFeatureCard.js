import React from 'react';
import { motion } from 'framer-motion';

const LockedFeatureCard = ({ onUpgrade }) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="text-3xl mb-3">🔒</div>
      <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
      <p className="text-purple-100 text-sm mb-4">
        Upgrade to unlock this feature and accelerate your learning
      </p>
      <motion.button
        onClick={onUpgrade}
        className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Upgrade Now
      </motion.button>
    </motion.div>
  );
};

export default LockedFeatureCard;
