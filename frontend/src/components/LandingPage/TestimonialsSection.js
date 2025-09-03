import React from 'react';
import { motion } from 'framer-motion';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: 'I tried it out on a high level writers effect and it turned out to be really accurate',
      name: 'Student, IGCSE'
    },
    {
      quote: 'It can definitely mark low level essays accurately. This is good, something I\'ve seen other AI\'s struggle with',
      name: 'Teacher, A‑Level'
    },
    {
      quote: 'Turned out to be really accurate, better than ChatGPT',
      name: 'Student, A‑Level'
    }
  ];

  return (
    <section id="testimonials" className="relative py-12">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
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
          What our users say
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div 
              key={i} 
              className="rounded-2xl p-6 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-md shadow-purple-600/10"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.2, duration: 0.6 }}
              whileHover={{ 
                y: -10,
                scale: 1.03,
                boxShadow: "0 20px 40px rgba(147, 51, 234, 0.15)"
              }}
            >
              <motion.div 
                className="flex items-center gap-1 text-yellow-500 mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.2, duration: 0.4 }}
              >
                {Array.from({length:5}).map((_,s)=> (
                  <motion.span 
                    key={s}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + i * 0.2 + s * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.3 }}
                  >
                    ★
                  </motion.span>
                ))}
              </motion.div>
              <motion.p 
                className="text-gray-800"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.0 + i * 0.2, duration: 0.6 }}
              >
                "{testimonial.quote}"
              </motion.p>
              <motion.div 
                className="text-xs text-gray-500 mt-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2 + i * 0.2, duration: 0.4 }}
              >
                {testimonial.name}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;
