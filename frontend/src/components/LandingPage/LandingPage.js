import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import Footer from './Footer';
import AuthModal from './AuthModal';

const LandingPage = ({ onDiscord, onGoogle }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  const handleStartMarking = () => {
    setShowAuthModal(true);
  };

  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Enhanced Background with animated elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F7F2FF] to-white" />
        <div className="pointer-events-none select-none">
          <motion.div 
            className="absolute -top-16 -left-10 h-72 w-72 rounded-3xl bg-purple-500/20 backdrop-blur-md border border-purple-300/30 shadow-2xl shadow-purple-500/10 rotate-6"
            animate={{ 
              rotate: [6, 8, 6],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-40 left-1/3 h-40 w-40 rounded-2xl bg-purple-400/20 backdrop-blur-md border border-purple-300/30 shadow-xl shadow-purple-400/10 -rotate-6"
            animate={{ 
              rotate: [-6, -4, -6],
              y: [0, -8, 0]
            }}
            transition={{ 
              duration: 16,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -right-12 top-20 h-80 w-80 rounded-3xl bg-purple-600/20 backdrop-blur-md border border-purple-300/30 shadow-2xl shadow-purple-600/10 rotate-12"
            animate={{ 
              rotate: [12, 14, 12],
              scale: [1, 1.005, 1]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-10 right-1/4 h-56 w-56 rounded-3xl bg-purple-500/15 backdrop-blur-md border border-purple-300/30 shadow-2xl shadow-purple-500/10 -rotate-3"
            animate={{ 
              rotate: [-3, -1, -3],
              x: [0, 3, 0]
            }}
            transition={{ 
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Additional floating elements for more visual interest */}
          <motion.div 
            className="absolute top-1/4 left-1/2 h-24 w-24 rounded-full bg-pink-400/15 backdrop-blur-md border border-pink-300/20 shadow-lg"
            animate={{ 
              y: [0, -15, 0],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/3 left-1/4 h-32 w-32 rounded-full bg-blue-400/10 backdrop-blur-md border border-blue-300/20 shadow-lg"
            animate={{ 
              x: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      <Header onGetStarted={handleGetStarted} />
      <HeroSection onGetStarted={handleGetStarted} onStartMarking={handleStartMarking} onDiscord={onDiscord} onGoogle={onGoogle} />
      <FeatureSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection onGetStarted={handleGetStarted} onStartMarking={handleStartMarking} />
      <Footer />
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onDiscord={onDiscord}
        onGoogle={onGoogle}
      />
    </motion.div>
  );
};

export default LandingPage;
