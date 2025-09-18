import React from 'react';
import { motion } from 'framer-motion';
import { LOGO_URL } from '../../constants/uiConstants';

const Header = ({ onGetStarted, user }) => {
  return (
    <motion.header 
      className="relative"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-5 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.img 
            src={LOGO_URL} 
            alt="EnglishGPT logo" 
            className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-purple-600/20" 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          />
          <motion.span 
            className="font-fredoka font-bold text-xl text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            EnglishGPT
          </motion.span>
        </motion.div>
        <motion.nav 
          className="hidden md:flex items-center gap-6 text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {['Features', 'How it works', 'Testimonials', 'FAQ'].map((item, index) => (
            <motion.a 
              key={item}
              href={`#${item.toLowerCase().replace(' ', '')}`} 
              className="hover:text-gray-900 transition-colors relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.1 }}
            >
              {item}
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-500"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          ))}
        </motion.nav>
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <motion.button 
            onClick={onGetStarted} 
            className="px-4 py-2 rounded-xl text-white bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10">{user ? 'Log in' : 'Get Started'}</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
