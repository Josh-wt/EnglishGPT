import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { isLaunchPeriod, getLaunchPeriodMessage } from '../../utils/launchPeriod';
import Footer from '../ui/Footer';

// Enhanced Pricing Page Component with Launch Offer
const PricingPage = ({ onBack, user }) => {

  const [showLaunchModal, setShowLaunchModal] = useState(true);



  const handlePlanSelect = async (planType) => {
    if (!user?.id) {
      toast.error('Please sign in to subscribe');
      return;
    }

    // TODO: Implement new payment system
    toast.success(`Selected ${planType} plan - Payment system to be implemented`);
  };
  
  const sharedFeatures = [
    "Unlimited essay marking",
    "Advanced analytics and insights", 
    "Detailed feedback and suggestions",
    "Progress tracking",
    "Priority support"
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced Header with back button */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 shadow-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              onClick={onBack}
              className="text-white hover:text-purple-200 flex items-center font-fredoka transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </motion.button>
            
            <motion.h1 
              className="text-xl font-bold text-white font-fredoka"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Choose Your Plan
            </motion.h1>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </motion.div>

      {/* Launch Offer Modal */}
      <AnimatePresence>
        {showLaunchModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", bounce: 0.3 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">🚀 Launch Period Active!</h3>
                <p className="text-gray-600 mb-6">
                  During our launch period, <strong>every new user automatically gets the Unlimited plan</strong> with all premium features at no cost!
                </p>
                <motion.button
                  onClick={() => setShowLaunchModal(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue to Plans
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Launch Period Banner */}
        {isLaunchPeriod() && (
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 mb-8 text-white text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-2">Launch Period - Unlimited Access for Everyone!</h3>
            <p className="text-lg opacity-90 mb-4">
              {getLaunchPeriodMessage()}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">✅ Unlimited Essays</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">✅ Advanced Analytics</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">✅ AI Recommendations</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">✅ Priority Support</span>
            </div>
          </motion.div>
        )}

        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-fredoka">
            {isLaunchPeriod() ? 'Launch Period Pricing' : 'Simple, Transparent Pricing'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isLaunchPeriod() 
              ? 'During our launch period, all users get unlimited access. After launch, choose the plan that fits your needs.'
              : 'Choose the plan that fits your needs. All plans include unlimited essay marking and detailed feedback.'
            }
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan (Launch Period - Coming Soon) */}
          <motion.div 
            className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg opacity-60"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <p className="text-gray-600">After Launch</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                3 essays per month
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Basic feedback
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Progress tracking
              </li>
            </ul>
            
            <button 
              className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
              disabled
            >
              Available After Launch
            </button>
          </motion.div>

          {/* Unlimited Plan (Launch Period) */}
          <motion.div 
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            {/* Launch Badge */}
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
              🚀 Launch Offer
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Unlimited</h3>
              <div className="text-4xl font-bold mb-2">FREE</div>
              <p className="text-green-100">During Launch Period</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {sharedFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
              <li className="flex items-center">
                <svg className="w-5 h-5 text-white mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
            </ul>
            
            <motion.button
              className="w-full bg-white text-green-600 py-3 rounded-xl font-semibold cursor-not-allowed"
              disabled
            >
              ✅ Your Current Plan
            </motion.button>
          </motion.div>

          {/* Yearly Plan (Launch Period - Coming Soon) */}
          <motion.div 
            className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg opacity-60 relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Coming Soon Badge */}
            <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Coming Soon
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Yearly</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$29.99</div>
              <p className="text-gray-600">per year</p>
              <p className="text-sm text-gray-500 mt-1">$2.50/month</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              {sharedFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
            </ul>
            
            <button 
              className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
              disabled
            >
              Available After Launch
            </button>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and PayPal. All payments are processed securely."
              },
              {
                q: "Is there a free trial?",
                a: "Yes! You get 3 free essays every month to try out our service before subscribing."
              },
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </motion.div>
  );
};

export default PricingPage;
