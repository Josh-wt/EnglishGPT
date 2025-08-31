import React from 'react';
import { motion } from 'framer-motion';
import { IMAGE_URLS } from '../../constants/uiConstants';

const FeatureSection = () => {
  const features = [
    {
      title: "Write with clarity and confidence",
      description: "Draft directly in a distraction‑free editor. Auto‑save, undo/redo, and structured prompts help you start fast and stay focused.",
      image: IMAGE_URLS.WRITE,
      imageAlt: "Write",
      benefits: ['Clean, student‑friendly editor','Keyboard shortcuts for speed','Instant evaluate when ready'],
      imageFirst: false
    },
    {
      title: "Crystal‑clear, criteria‑aligned feedback",
      description: "Understand exactly what worked with strengths pulled straight from exam standards, and know what to do next.",
      image: IMAGE_URLS.ANALYTICS,
      imageAlt: "Strengths",
      benefits: ['Transparent marks across components','Short, actionable strengths','Improvement suggestions that compound'],
      imageFirst: true
    },
    {
      title: "A marking view that builds confidence",
      description: "See where your marks come from and how to reach the next band. Progress tracking keeps you motivated.",
      image: IMAGE_URLS.MARKING,
      imageAlt: "Marking",
      benefits: ['Band descriptors made visual','Trend lines for your progress','Sharable results when you\'re proud'],
      imageFirst: false
    },
    {
      title: "Simple pricing, built for students",
      description: "Unlimited marking with monthly or yearly options. Cancel anytime — no hidden fees.",
      image: IMAGE_URLS.PRICING,
      imageAlt: "Pricing",
      benefits: ['Unlimited submissions','Priority support on yearly','Secure payments'],
      imageFirst: true
    }
  ];

  return (
    <section id="features" className="relative py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            className="grid md:grid-cols-2 gap-8 items-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {feature.imageFirst ? (
              <>
                <motion.div 
                  className="order-2 md:order-1 rounded-3xl p-3 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-xl shadow-purple-600/10"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 25px 50px rgba(147, 51, 234, 0.15)"
                  }}
                >
                  <motion.img 
                    src={feature.image} 
                    alt={feature.imageAlt} 
                    loading="lazy" 
                    className="w-full h-auto rounded-2xl border border-purple-200/60"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                <motion.div 
                  className="order-1 md:order-2"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <FeatureContent feature={feature} />
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <FeatureContent feature={feature} />
                </motion.div>
                <motion.div 
                  className="rounded-3xl p-3 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-xl shadow-purple-600/10"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 25px 50px rgba(147, 51, 234, 0.15)"
                  }}
                >
                  <motion.img 
                    src={feature.image} 
                    alt={feature.imageAlt} 
                    loading="lazy" 
                    className="w-full h-auto rounded-2xl border border-purple-200/60"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const FeatureContent = ({ feature }) => {
  return (
    <>
      <motion.h3 
        className="text-2xl font-fredoka font-bold text-gray-900 mb-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {feature.title}
      </motion.h3>
      <motion.p 
        className="text-gray-700 mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {feature.description}
      </motion.p>
      <motion.ul 
        className="space-y-2 text-sm text-gray-700"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {feature.benefits.map((benefit, i) => (
          <motion.li 
            key={i} 
            className="flex items-start gap-2"
            initial={{ opacity: 0, x: feature.imageFirst ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.0 + i * 0.1, duration: 0.4 }}
            whileHover={{ x: feature.imageFirst ? -5 : 5 }}
          >
            <motion.span 
              className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5"
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              ✓
            </motion.span>
            {benefit}
          </motion.li>
        ))}
      </motion.ul>
    </>
  );
};

export default FeatureSection;
