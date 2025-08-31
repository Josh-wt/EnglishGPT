import React from 'react';
import { motion } from 'framer-motion';

const Header = ({ onBack, selectedForCompare, onOpenCompare }) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 shadow-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <motion.button
            onClick={onBack}
            className="text-white hover:text-purple-100 flex items-center font-fredoka font-semibold"
            whileHover={{ scale: 1.05, x: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              whileHover={{ x: -3 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </motion.svg>
            Back to Dashboard
          </motion.button>
          
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.img 
              src="https://ik.imagekit.io/lqf8a8nmt/logo-modified.png?updatedAt=1752578868143" 
              alt="EnglishGPT logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            />
            <h1 className="text-2xl font-fredoka font-bold text-white">📚 Marking History</h1>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <motion.button
              onClick={onOpenCompare}
              disabled={selectedForCompare.length !== 2}
              className={`px-4 py-2 rounded-xl font-fredoka font-semibold transition-all ${
                selectedForCompare.length === 2 
                  ? 'bg-white text-purple-600 shadow-lg hover:shadow-xl' 
                  : 'bg-white/20 text-white/60 cursor-not-allowed'
              }`}
              whileHover={selectedForCompare.length === 2 ? { scale: 1.05, y: -2 } : {}}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Compare ({selectedForCompare.length}/2)
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
