import React from 'react';
import { motion } from 'framer-motion';

const CTASection = ({ onGetStarted, onStartMarking }) => {
  return (
    <section className="relative py-14">
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="rounded-3xl p-8 md:p-12 bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-300/40 backdrop-blur-xl shadow-xl shadow-purple-600/20 flex flex-col md:flex-row items-center justify-between"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 30px 60px rgba(147, 51, 234, 0.2)"
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.h3 
              className="font-bold text-2xl mb-2 text-gray-900"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Ready to improve faster?
            </motion.h3>
            <motion.p 
              className="text-gray-700"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Sign in and start marking in under a minute.
            </motion.p>
          </motion.div>
          <motion.div 
            className="mt-6 md:mt-0 flex gap-3"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.button 
              onClick={onGetStarted} 
              className="px-6 py-3 rounded-xl text-white bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.4 }}
              />
              <span className="relative z-10">Get Started</span>
            </motion.button>
            <motion.button 
              onClick={onStartMarking} 
              className="px-6 py-3 rounded-xl border border-purple-300/60 text-purple-700 hover:bg-purple-50/70 backdrop-blur-md relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="absolute inset-0 bg-purple-50"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">Start Marking</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTASection;
