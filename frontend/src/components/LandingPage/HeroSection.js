import React from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

const HeroSection = ({ onGetStarted, onStartMarking }) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };
  
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
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

  const buttonHoverAnimation = {
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  };



  return (
    <section className="relative">
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 1.2, ease: "easeOut" }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-300/40 text-purple-700 text-xs mb-4 backdrop-blur-md cursor-pointer"
              variants={fadeInUp}
              whileHover={buttonHoverAnimation}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span 
                className="h-2 w-2 rounded-full bg-purple-600"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              IGCSE & A-Level aligned
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900"
              variants={fadeInUp}
            >
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              >
                AI English
              </motion.span>{" "}
              <motion.span
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              >
                Marking
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-700/90 mb-6"
              variants={fadeInUp}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Master English with transparent, AI‑powered marking
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3"
              variants={fadeInUp}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <motion.button 
                onClick={onGetStarted} 
                className="px-6 py-3 rounded-xl text-white bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 relative overflow-hidden group"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.4 }}
                />
                <span className="relative z-10">Get Started</span>
              </motion.button>
              <motion.button 
                onClick={onStartMarking} 
                className="px-6 py-3 rounded-xl border border-purple-300/60 text-purple-700 hover:bg-purple-50/70 backdrop-blur-md relative overflow-hidden group"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <motion.div
                  className="absolute inset-0 bg-purple-50"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">Start Marking</span>
              </motion.button>
            </motion.div>
            
            <motion.p 
              className="text-xs text-gray-500 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              No credit card required. Cheap & Simple.
            </motion.p>
            
            <motion.div 
              className="mt-8 grid grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              {[
                {label:'Avg. improvement', value:'+27%'},
                {label:'Marking speed', value:'< 30s'},
                {label:'Simple Pricing', value:'Just $4.99/m'}
              ].map((s,i)=> (
                <motion.div 
                  key={i} 
                  className="rounded-2xl p-4 bg-purple-400/10 border border-purple-300/40 backdrop-blur-md cursor-pointer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6 + i * 0.1, duration: 0.4 }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 10px 25px rgba(147, 51, 234, 0.15)",
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-sm text-gray-600">{s.label}</div>
                  <motion.div 
                    className="text-xl font-bold text-gray-900 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 + i * 0.1, duration: 0.4 }}
                  >
                    {s.value}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
          >
            <div className="relative h-[420px] md:h-[460px]">
              {/* Strengths (primary) with floating animation */}
              <motion.div 
                className="absolute left-0 top-0 right-6 rounded-3xl p-2 sm:p-4 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-xl shadow-purple-600/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(147, 51, 234, 0.15)",
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
              >
                <animated.img 
                  src="/images/analytics.jpg" 
                  alt="Detailed strengths preview" 
                  loading="lazy" 
                  className="w-full h-auto rounded-2xl border border-purple-200/60" 
                  onError={(e)=>{e.currentTarget.style.display='none';}}
                  style={floatingAnimation}
                />
              </motion.div>
              {/* Marking overlay with rotation animation */}
              <motion.div 
                className="absolute -right-2 md:-right-6 top-24 w-1/2 rounded-2xl p-2 bg-purple-500/10 border border-purple-300/40 backdrop-blur-md shadow-lg shadow-purple-600/10 rotate-3"
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 3 }}
                transition={{ delay: 1.6, duration: 0.8, type: "spring" }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: 6,
                  boxShadow: "0 15px 30px rgba(147, 51, 234, 0.2)"
                }}
              >
                <img src="/images/marking.jpg" alt="Marking interface preview" loading="lazy" className="w-full h-auto rounded-xl border border-purple-200/60" onError={(e)=>{e.currentTarget.style.display='none';}} />
              </motion.div>
              {/* Write overlay with bounce animation */}
              <motion.div 
                className="absolute left-3 bottom-2 w-2/3 rounded-2xl p-2 bg-purple-500/10 border border-purple-300/40 backdrop-blur-md shadow-lg shadow-purple-600/10 -rotate-3"
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: -3 }}
                transition={{ delay: 2.0, duration: 0.8, type: "spring", bounce: 0.4 }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: -6,
                  boxShadow: "0 15px 30px rgba(147, 51, 234, 0.2)"
                }}
              >
                <img src="/images/write.jpg" alt="Write page preview" loading="lazy" className="w-full h-auto rounded-xl border border-purple-200/60" onError={(e)=>{e.currentTarget.style.display='none';}} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
