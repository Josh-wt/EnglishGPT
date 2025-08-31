import React from 'react';
import { motion } from 'framer-motion';
import { LOGO_URL } from '../../constants/uiConstants';

const Footer = () => {
  return (
    <motion.footer 
      className="relative border-t border-purple-200/50 bg-white/60 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.img 
            src={LOGO_URL} 
            alt="EnglishGPT logo" 
            className="w-8 h-8 rounded-xl object-cover shadow-md shadow-purple-600/30"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          />
          <span className="font-fredoka font-semibold text-gray-900">EnglishGPT</span>
        </motion.div>
        <motion.div 
          className="text-sm text-gray-600"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          © {new Date().getFullYear()} EnglishGPT. All rights reserved.
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
