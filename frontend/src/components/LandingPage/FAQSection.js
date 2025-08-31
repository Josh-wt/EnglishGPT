import React from 'react';
import { motion } from 'framer-motion';

const FAQSection = () => {
  const faqs = [
    {
      question: 'Is this aligned to exam criteria?',
      answer: 'Yes. We align to IGCSE and A‑Level descriptors and show transparent marks.'
    },
    {
      question: 'Is my data private?',
      answer: 'Yes. We keep your submissions secure and never sell your data.'
    },
    {
      question: 'How fast is the feedback?',
      answer: 'You usually get marks and guidance in under 10 seconds.'
    },
    {
      question: 'Can teachers use this?',
      answer: 'Yes. Many teachers use it to save time and guide students faster.'
    }
  ];

  return (
    <section id="faq" className="relative py-12">
      <motion.div 
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2 
          className="text-3xl font-fredoka font-bold text-center text-gray-900 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, i) => (
            <motion.details 
              key={i} 
              className="rounded-2xl p-5 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-md shadow-purple-600/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 15px 30px rgba(147, 51, 234, 0.1)"
              }}
            >
              <motion.summary 
                className="cursor-pointer list-none font-semibold text-gray-900"
                whileHover={{ color: "#7c3aed" }}
                transition={{ duration: 0.2 }}
              >
                {faq.question}
              </motion.summary>
              <motion.div 
                className="text-gray-700 text-sm mt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {faq.answer}
              </motion.div>
            </motion.details>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default FAQSection;
