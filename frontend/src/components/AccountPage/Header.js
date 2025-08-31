import React from 'react';
import { motion } from 'framer-motion';

const Header = ({ onBack }) => {
  return (
    <div className="bg-card shadow-sm border-b border-pink-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 flex items-center font-fredoka transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </motion.button>
          
          <h1 className="text-xl font-bold text-gray-900 font-fredoka">Account Settings</h1>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>
    </div>
  );
};

export default Header;
