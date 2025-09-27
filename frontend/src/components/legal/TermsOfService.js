import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LOGO_URL } from '../../constants/uiConstants';
import Footer from '../ui/Footer';

const TermsOfService = () => {
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
            Terms of Service
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
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using EverythingEnglish ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 leading-relaxed">
                EverythingEnglish provides AI-powered English essay feedback and grading services. Our platform offers instant feedback, grading, and educational insights to help users improve their English writing skills.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Payment Terms</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Free Plan:</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>3 one-time credits, no recurring charges</li>
                    <li>Basic AI feedback and grading features</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Unlimited Plan:</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>$4.99/month with automatic renewal</li>
                    <li>Unlimited essay evaluations and premium features</li>
                    <li>Cancel anytime through your account settings</li>
                    <li>Refunds are subject to our refund policy</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Share your account credentials with others</li>
                <li>Use the service for commercial purposes without permission</li>
                <li>Submit content that violates intellectual property rights</li>
                <li>Engage in automated abuse or excessive usage that impacts service quality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. AI Disclaimer</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Important:</strong> Our AI-powered feedback may contain errors or inaccuracies. We strongly recommend human review for important assignments, exams, or official submissions. Users should not rely solely on AI feedback for critical academic or professional work.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Usage and Training</h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>Privacy Protection:</strong> Your essays and content are used for AI training purposes. However, we do not sell your personal data. We maintain strict privacy standards and protect your intellectual property and personal data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                EverythingEnglish shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service. Our total liability is limited to the amount you paid in the previous 12 months.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service. Upon termination, your right to use the service will cease immediately. Paid subscriptions remain accessible until the end of the current billing period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of India. Any disputes arising from these terms or your use of the service shall be subject to the jurisdiction of Indian courts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2"><strong>Jerry Kurian</strong></p>
                <p className="text-gray-700 mb-2">
                  <a href="mailto:support@everythingenglish.xyz" className="text-blue-600 hover:text-blue-800">
                    support@everythingenglish.xyz
                  </a>
                </p>
                <p className="text-gray-700">
                  Librety Acers, Attibele, Sarjapur, Karnataka, India
                </p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-gray-700 text-center">
                By using EverythingEnglish, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
