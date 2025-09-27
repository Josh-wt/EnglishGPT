import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LOGO_URL } from '../../constants/uiConstants';
import Footer from '../ui/Footer';

const RefundPolicy = () => {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-3-3 3-3" />
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
            Refund Policy
          </motion.h1>

          <motion.p
            className="text-gray-600 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Last updated: September 2025
          </motion.p>

          <motion.div
            className="prose prose-lg max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Quick Summary */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Summary</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>3-day window:</strong> Full refunds within 3 days of subscription</li>
                  <li><strong>Valid reason required:</strong> Must explain dissatisfaction</li>
                  <li><strong>Full refund only:</strong> Get back exactly what you paid</li>
                  <li><strong>No exceptions:</strong> No refunds after 3-day period</li>
                  <li><strong>Fast processing:</strong> 24-hour response, 3-5 days refund</li>
                </ul>
              </div>
            </section>

            {/* General Refund Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. General Refund Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                EnglishGPT offers a straightforward 3-day refund policy. If you're not satisfied with our service for any valid reason, you can request a full refund within 3 days of your subscription start date.
              </p>
            </section>

            {/* Refund Eligibility */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Refund Eligibility</h2>
              <p className="text-gray-700 mb-4">Clear, simple rules:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>3-Day Window:</strong> Full refunds available for any subscription within 3 days of purchase</li>
                <li><strong>Valid Reason Required:</strong> Must provide a legitimate reason for dissatisfaction</li>
                <li><strong>Full Refund Only:</strong> No partial or pro-rated refunds - you get back exactly what you paid</li>
                <li><strong>After 3 Days:</strong> No refunds available under any circumstances</li>
              </ul>
            </section>

            {/* What Qualifies for Refunds */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. What Qualifies for Refunds</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">✓ Acceptable reasons include:</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>AI feedback quality doesn't meet expectations</li>
                    <li>Technical problems preventing service use</li>
                    <li>Service doesn't match advertised features</li>
                    <li>Billing errors or unauthorized charges</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">✗ What doesn't qualify:</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Simply changing your mind without trying the service</li>
                    <li>Requests after the 3-day period</li>
                    <li>Wanting to switch to a different service</li>
                    <li>General dissatisfaction with service quality</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Free Plan Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Free Plan Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                The Free Plan involves no payment, so no refunds are applicable. Users receive 3 complimentary credits to evaluate our service quality.
              </p>
            </section>

            {/* Unlimited Plan Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Unlimited Plan Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                For the $4.99 Unlimited Plan: request a full $4.99 refund within 3 days of subscription start if dissatisfied for any valid reason. After 3 days, no refunds are available.
              </p>
            </section>

            {/* Simple Refund Process */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Simple Refund Process</h2>
              <p className="text-gray-700 mb-4">Easy 3-step process:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <ol className="list-decimal pl-6 text-gray-700 space-y-3">
                  <li>Email <a href="mailto:refund@everythingenglish.xyz" className="text-blue-600 hover:text-blue-800 font-semibold">refund@everythingenglish.xyz</a> within 3 days</li>
                  <li>Subject line: <code className="bg-gray-100 px-2 py-1 rounded text-sm">"Refund Request - [Your Email]"</code></li>
                  <li>Include: Subscription date, reason for refund request, account email</li>
                </ol>
                <p className="text-gray-700 mt-4">
                  <strong>Response:</strong> 24-hour review and response, 3-5 business days processing for approved requests.
                </p>
              </div>
            </section>

            {/* No Exceptions Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. No Exceptions Policy</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  We do not make exceptions to the 3-day refund window. Please ensure you evaluate our service thoroughly within this timeframe if you have any concerns.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> <a href="mailto:refund@everythingenglish.xyz" className="text-blue-600 hover:text-blue-800">refund@everythingenglish.xyz</a>
                </p>
                <p className="text-gray-700">
                  <strong>Subject Line:</strong> "Refund Request - [Your Email]"
                </p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-gray-700 text-center">
                By using EnglishGPT, you acknowledge that you have read and understood this Refund Policy and agree to be bound by its terms.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
