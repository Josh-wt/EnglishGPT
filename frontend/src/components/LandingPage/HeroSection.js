import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { supabase } from '../../supabaseClient';
import AuthModal from './AuthModal';

const HeroSection = ({ onGetStarted, onStartMarking, onDiscord, onGoogle }) => {
  const [selectedLevel, setSelectedLevel] = useState('IGCSE');
  const [studentResponse, setStudentResponse] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  
  // Sample questions for the interactive section
  const sampleQuestions = {
    IGCSE: [
      "Describe a place that is special to you. Explain why it holds significance in your life.",
      "Write about a time when you had to make a difficult decision. What did you learn from the experience?",
      "Describe a person who has influenced you greatly. How have they shaped who you are today?"
    ],
    'A Level': [
      "Analyze the theme of identity in a literary work you have studied. How does the author explore this concept?",
      "Compare and contrast two different perspectives on a contemporary social issue.",
      "Evaluate the effectiveness of symbolism in conveying meaning in a text you have studied."
    ]
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = sampleQuestions[selectedLevel][currentQuestionIndex];

  // Rotate questions every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestionIndex((prev) => (prev + 1) % sampleQuestions[selectedLevel].length);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedLevel]);

  // Save draft to localStorage
  useEffect(() => {
    if (studentResponse.trim()) {
      localStorage.setItem('draft_essay', studentResponse);
      localStorage.setItem('draft_question', currentQuestion);
      localStorage.setItem('draft_level', selectedLevel);
    }
  }, [studentResponse, currentQuestion, selectedLevel]);

  const handleGetAIFeedback = async () => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Redirect to write page
      window.location.href = 'https://englishgpt.everythingenglish.xyz/write';
    } else {
      // Show auth modal
      setShowAuthModal(true);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const floatingAnimation = useSpring({
    from: { transform: 'translateY(0px)' },
    to: async (next) => {
      while (true) {
        await next({ transform: 'translateY(-6px)' });
        await next({ transform: 'translateY(0px)' });
      }
    },
    config: { duration: 3000, tension: 120, friction: 15 }
  });

  return (
    <section className="relative">
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 1.2, ease: "easeOut" }}
      >
        {/* Header and Subheader */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-gray-900"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            Accurate AI English Marking
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Instant results. Instant Feedback.
          </motion.p>
        </div>

        {/* Interactive Write Section */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-200/60"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Level Toggle */}
          <div className="bg-purple-50 p-4 border-b border-purple-200/40">
            <div className="flex items-center justify-center gap-4">
              <span className="text-gray-700 font-medium">Select Level:</span>
              <div className="flex bg-white rounded-full p-1 shadow-inner">
                <button
                  onClick={() => setSelectedLevel('IGCSE')}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    selectedLevel === 'IGCSE'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  IGCSE
                </button>
                <button
                  onClick={() => setSelectedLevel('A Level')}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    selectedLevel === 'A Level'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  A Level
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-0">
            {/* Question Section */}
            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-r border-purple-200/40">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample Question:</h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-gray-700 leading-relaxed"
                >
                  {currentQuestion}
                </motion.div>
              </AnimatePresence>
              
              <motion.div 
                className="mt-6 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                {sampleQuestions[selectedLevel].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentQuestionIndex
                        ? 'bg-purple-600 w-8'
                        : 'bg-purple-300 hover:bg-purple-400'
                    }`}
                  />
                ))}
              </motion.div>
            </div>

            {/* Essay Writing Section */}
            <div className="p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Write Your Essay:</h3>
              <textarea
                value={studentResponse}
                onChange={(e) => setStudentResponse(e.target.value)}
                placeholder="Start writing your essay here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {studentResponse.split(/\s+/).filter(word => word.length > 0).length} words
                </span>
                
                <motion.button
                  onClick={handleGetAIFeedback}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get AI Feedback
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="mt-12 grid grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          {[
            {label:'Avg. improvement', value:'+27%'},
            {label:'Marking speed', value:'< 30s'},
            {label:'Simple Pricing', value:'Just $4.99/m'}
          ].map((s,i)=> (
            <motion.div 
              key={i} 
              className="rounded-2xl p-6 bg-white border border-purple-200/60 backdrop-blur-md text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + i * 0.1, duration: 0.4 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(147, 51, 234, 0.15)",
              }}
            >
              <div className="text-sm text-gray-600">{s.label}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{s.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onDiscord={onDiscord}
          onGoogle={onGoogle}
        />
      )}
    </section>
  );
};

export default HeroSection;