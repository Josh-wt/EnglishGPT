import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { supabase } from '../../supabaseClient';
import AuthModal from './AuthModal';

const HeroSection = ({ onGetStarted, onStartMarking, onDiscord, onGoogle }) => {
  const [selectedLevel, setSelectedLevel] = useState('IGCSE');
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [studentResponse, setStudentResponse] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Question types data (removing marking scheme required tags)
  const questionTypes = {
    IGCSE: [
      {
        id: 'igcse_summary',
        name: 'Summary',
        description: 'Summarize the key points from a given text',
        icon: '📄'
      },
      {
        id: 'igcse_narrative',
        name: 'Narrative',
        description: 'Create an engaging narrative story',
        icon: '📚'
      },
      {
        id: 'igcse_descriptive',
        name: 'Descriptive',
        description: 'Write a vivid descriptive piece',
        icon: '🖼️'
      },
      {
        id: 'igcse_writers_effect',
        name: "Writer's Effect",
        description: 'Analyze the writer\'s use of language and its effects',
        icon: '⚡'
      },
      {
        id: 'igcse_directed',
        name: 'Directed Writing',
        description: 'Transform text into specific formats for different audiences',
        icon: '✍️'
      }
    ],
    'A Level': [
      {
        id: 'alevel_comparative',
        name: 'Comparative Analysis 1(b)',
        description: 'Compare and analyze different texts',
        icon: '📊'
      },
      {
        id: 'alevel_directed',
        name: 'Directed Writing 1(a)',
        description: 'Transform text into a specific format for audience',
        icon: '✍️'
      },
      {
        id: 'alevel_text_analysis',
        name: 'Text Analysis Q2',
        description: 'Analyze form, structure, and language in texts',
        icon: '🔍'
      },
      {
        id: 'alevel_language_change',
        name: 'Language Change Analysis (P3, Section A)',
        description: 'Analyze historical prose extract demonstrating English language change using quantitative data',
        icon: '🔍'
      }
    ]
  };

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

        {/* Interactive Writing Modal - 20% wider and 25% vertically longer */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-200/60 mx-auto"
          style={{ 
            width: '120%', // 20% wider
            maxWidth: '1400px', // Increased max width
            marginLeft: '-10%', // Center the wider modal
            marginRight: '-10%'
          }}
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
                  onClick={() => {
                    setSelectedLevel('IGCSE');
                    setSelectedQuestionType(null);
                  }}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    selectedLevel === 'IGCSE'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  IGCSE
                </button>
                <button
                  onClick={() => {
                    setSelectedLevel('A Level');
                    setSelectedQuestionType(null);
                  }}
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

          <div className="grid lg:grid-cols-2 gap-0" style={{ gridTemplateColumns: '45% 55%' }}>
            {/* Question Types Panel - Left Side */}
            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-r border-purple-200/40">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Question Types</h3>
                <div className={`bg-gradient-to-r ${selectedLevel === 'IGCSE' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-green-500'} text-white px-3 py-1 rounded-lg shadow-md inline-block`}>
                  <span className="font-bold text-sm">{selectedLevel}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {questionTypes[selectedLevel].map((question) => (
                  <button
                    key={question.id}
                    onClick={() => setSelectedQuestionType(question)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 border group hover:scale-[1.02] ${
                      selectedQuestionType?.id === question.id
                        ? 'border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 shadow-lg ring-2 ring-pink-200'
                        : 'border-gray-200 bg-white hover:border-pink-200 hover:shadow-md hover:bg-gradient-to-r hover:from-gray-50 hover:to-pink-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                        selectedQuestionType?.id === question.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-pink-100 group-hover:to-purple-100'
                      }`}>
                        <span className="text-xl">{question.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-base truncate">{question.name}</h4>
                          {selectedQuestionType?.id === question.id && (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">{question.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Writing Interface - Right Side */}
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Write Your Essay</h3>
                {selectedQuestionType ? (
                  <div className={`bg-gradient-to-r ${selectedLevel === 'IGCSE' ? 'from-blue-500 to-green-500' : 'from-purple-500 to-pink-500'} text-white px-3 py-1 rounded-lg shadow-md inline-block`}>
                    <span className="font-bold text-sm">{selectedQuestionType.name}</span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Select a question type to start writing</div>
                )}
              </div>

              {selectedQuestionType ? (
                <>
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-2 mb-4">
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      B
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      /
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      "
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      ¶
                    </button>
                    <div className="ml-auto text-sm text-gray-500">
                      {studentResponse.split(/\s+/).filter(word => word.length > 0).length} words
                    </div>
                  </div>

                  {/* Text Editor */}
                  <textarea
                    value={studentResponse}
                    onChange={(e) => setStudentResponse(e.target.value)}
                    placeholder="Start writing your essay here... Use the toolbar above for formatting."
                    className="w-full h-80 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ minHeight: '320px' }} // 25% vertically longer
                  />
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={() => setSelectedQuestionType(null)}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
                    >
                      Change Question Type
                    </button>
                    
                    <motion.button
                      onClick={handleGetAIFeedback}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get AI Feedback Now!
                    </motion.button>
                  </div>
                </>
              ) : (
                /* Placeholder when no question type selected */
                <div className="flex flex-col items-center justify-center h-80 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">✍️</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to Write?</h4>
                  <p className="text-gray-600">Select a question type from the left to start your essay</p>
                </div>
              )}
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
            {label:'Avg. improvement', value:'+57%'},
            {label:'Marking speed', value:'< 20s'},
            {label:'Simple Pricing', value:'Just $4.99/m (Free for launch period!)'}
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