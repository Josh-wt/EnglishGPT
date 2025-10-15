import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon, 
  QuestionMarkCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const SupportPage = ({ onBack, darkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supportCategories = [
    { id: 'general', label: 'General Question', icon: '❓' },
    { id: 'technical', label: 'Technical Issue', icon: '🔧' },
    { id: 'billing', label: 'Billing & Payments', icon: '💳' },
    { id: 'feature', label: 'Feature Request', icon: '💡' },
    { id: 'bug', label: 'Bug Report', icon: '🐛' }
  ];

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get detailed help via email',
      icon: <EnvelopeIcon className="w-6 h-6" />,
      contact: 'support@everythingenglish.xyz',
      responseTime: 'Within 24 hours',
      color: 'blue'
    },
    {
      title: 'Discord Community',
      description: 'Join our active community',
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      contact: 'Join Discord Server',
      responseTime: 'Real-time chat',
      color: 'purple',
      link: 'https://discord.gg/xRqB4BWCcJ'
    },
    {
      title: 'FAQ & Documentation',
      description: 'Find answers to common questions',
      icon: <QuestionMarkCircleIcon className="w-6 h-6" />,
      contact: 'Browse Documentation',
      responseTime: 'Instant',
      color: 'green',
      link: '/docs'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setMessage('');
      setEmail('');
    }, 2000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              onClick={onBack}
              className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} flex items-center font-fredoka transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back
            </motion.button>
            
            <h1 className={`text-xl font-bold font-fredoka ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Support Center
            </h1>
            
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Send Another Message
            </button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Methods */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                <p className="text-gray-600 mb-6">
                  Choose the best way to reach us based on your needs.
                </p>
              </div>

              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-${method.color}-100`}>
                      <div className={`text-${method.color}-600`}>
                        {method.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {method.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{method.description}</p>
                      <div className="flex items-center justify-between">
                        {method.link ? (
                          <a
                            href={method.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-${method.color}-600 hover:text-${method.color}-700 font-medium`}
                          >
                            {method.contact} →
                          </a>
                        ) : (
                          <span className={`text-${method.color}-600 font-medium`}>
                            {method.contact}
                          </span>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {method.responseTime}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {supportCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your question or issue in detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Need immediate help?</p>
                    <p>Join our Discord community for real-time support from other users and our team.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
