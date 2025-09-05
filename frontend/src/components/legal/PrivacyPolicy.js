import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LOGO_URL } from '../../constants/uiConstants';
import Footer from '../ui/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-fredoka"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <div className="flex items-center space-x-2">
              <img src={LOGO_URL} alt="EnglishGPT logo" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-fredoka font-semibold text-gray-900">EnglishGPT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl font-bold text-gray-900 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Privacy Policy
          </motion.h1>

          <motion.p
            className="text-gray-600 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Last updated: August 2025
          </motion.p>

          <motion.div
            className="prose prose-lg max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* AI Training Data Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI Training Data Policy</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  By default, EverythingEnglish uses submitted essays and AI feedback to improve our AI models. You can disable this feature in your account settings at any time. When disabled, your content is only used to provide feedback services.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information:</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Email address and account credentials</li>
                    <li>Payment and billing information</li>
                    <li>Account preferences and settings</li>
                    <li>Discord login details (if using Discord authentication)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">Content Information:</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Essays and writing submissions</li>
                    <li>AI feedback and grading data</li>
                    <li>Usage analytics and interaction data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">Technical Information:</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>IP addresses and browser information</li>
                    <li>Device and operating system data</li>
                    <li>Performance and error logs</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Data */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Data</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Service delivery and AI-powered feedback generation</li>
                <li>Account management and customer support</li>
                <li>Analytics and service improvement</li>
                <li>Communication about your account and service updates</li>
                <li>Technical operations and security monitoring</li>
                <li>AI model improvement and training (when enabled)</li>
              </ul>
            </section>

            {/* Analytics */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Analytics</h2>
              <p className="text-gray-700 leading-relaxed">
                We use Google Analytics to understand website usage patterns and improve user experience. This helps us optimize our platform and identify areas for enhancement.
              </p>
            </section>

            {/* Training Data Usage */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Training Data Usage</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Default Setting:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    By default, your essays and AI feedback are used to improve our AI models. This data is processed in anonymized form to protect your privacy while helping us enhance our service quality.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Opt-Out Process:</h3>
                  <p className="text-gray-700 mb-3">You can disable training data usage at any time by:</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                      <li>Logging into your account</li>
                      <li>Going to account settings</li>
                      <li>Toggling off "Use my data for AI training"</li>
                      <li>Saving your preferences</li>
                    </ol>
                  </div>
                  <p className="text-gray-700 mt-3">
                    When training data usage is disabled, your content is only used to provide direct feedback services.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
              <p className="text-gray-700 mb-3">We do not sell your personal data. We may share information with:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Service providers who assist in platform operations</li>
                <li>Payment processors for billing purposes</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            {/* Security Measures */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Security Measures</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure servers with limited personnel access</li>
                <li>Regular security audits and monitoring</li>
                <li>Training data anonymization processes</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Training Data Opt-Out:</strong> Disable AI training data usage in account settings</li>
                <li><strong>Data Access:</strong> Request copies of your personal data</li>
                <li><strong>Data Correction:</strong> Update inaccurate information</li>
                <li><strong>Data Deletion:</strong> Request removal of your account and data</li>
                <li><strong>Data Portability:</strong> Export your data in standard formats</li>
                <li><strong>Marketing Opt-Out:</strong> Unsubscribe from promotional communications</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services. After account deletion, data is removed within 30 days, except where retention is required by law.
              </p>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                We use essential cookies for platform functionality and analytics cookies to understand usage patterns. You can manage cookie preferences through your browser settings.
              </p>
            </section>

            {/* Policy Updates */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this policy periodically. Material changes will be communicated via email and prominently displayed on our platform. Continued use after changes constitutes acceptance.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2"><strong>Jerry Kurian</strong></p>
                <p className="text-gray-700 mb-2">
                  <a href="mailto:support@everythingenglish.xyz" className="text-blue-600 hover:text-blue-800">
                    support@everythingenglish.xyz
                  </a>
                </p>
                <p className="text-gray-700">
                  For privacy inquiries, please email with "Privacy Question" in the subject line.
                </p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-gray-700 text-center">
                By using EverythingEnglish, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
