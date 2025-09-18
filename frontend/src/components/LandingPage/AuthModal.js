import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_URL } from '../../constants/uiConstants';

const AuthModal = ({ isOpen, onClose, onDiscord, onGoogle, onAuthSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleAuthSuccess = async () => {
    setIsProcessing(true);
    
    try {
      // Call the custom auth success handler if provided
      if (onAuthSuccess) {
        console.log('📝 Using custom onAuthSuccess callback');
        await onAuthSuccess();
      } else {
        // Fallback behavior - check for saved essay
        const savedEssay = localStorage.getItem('landingPageEssay');
        
        if (savedEssay) {
          console.log('📝 Found saved essay, redirecting to write page');
          window.location.href = '/write';
        } else {
          console.log('📝 No saved essay, redirecting to dashboard');
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error('❌ Error processing auth success:', error);
      // Fallback to write page on error
      window.location.href = '/write';
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/40" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div 
            className="relative w-full max-w-xl mx-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-purple-200/60 shadow-2xl p-0 overflow-hidden auth-modal"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          >
            {/* Decorative header */}
            <div className="px-6 pt-6 pb-4 border-b border-purple-200/60 bg-gradient-to-br from-white/60 to-purple-50/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={LOGO_URL} alt="EnglishGPT logo" className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <div className="font-fredoka font-semibold text-gray-900">Welcome</div>
                    <div className="text-xs text-gray-600">Sign in to continue to your dashboard</div>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
              </div>
            </div>
            {/* Body */}
            <div className="px-6 py-5 grid md:grid-cols-2 gap-6 relative">
              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                  <div className="text-center">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-700 font-medium">Processing your essay...</p>
                    <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
                  </div>
                </div>
              )}
              
              <div className="order-2 md:order-1">
                <div className="text-sm text-gray-700 mb-3 font-medium">Why sign in?</div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">✓</span>Save your results and track progress</li>
                  <li className="flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">✓</span>Unlock analytics and recommendations</li>
                  <li className="flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">✓</span>Switch devices seamlessly</li>
                </ul>
                <div className="text-[11px] text-gray-500 mt-4">By continuing you agree to our terms and privacy policy.</div>
              </div>
              <div className="order-1 md:order-2 space-y-3">
                {/* Discord button */}
                <button 
                  className="discord-btn" 
                  disabled={isProcessing}
                  onClick={() => { onDiscord(); handleAuthSuccess(); }}
                >
                  Continue with Discord
                  <span aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.258 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"></path>
                    </svg>
                  </span>
                </button>
                {/* Google button */}
                <button 
                  className="google-btn" 
                  disabled={isProcessing}
                  onClick={() => { onGoogle(); handleAuthSuccess(); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" className="svg">
                    <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" className="blue"></path>
                    <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" className="green"></path>
                    <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" className="yellow"></path>
                    <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" className="red"></path>
                  </svg>
                  <span className="text">Sign in with Google</span>
                </button>
              </div>
            </div>
            {/* Modal-scoped styles for custom buttons */}
            <style>{`
              .auth-modal .discord-btn {
                max-width: 320px;
                display: flex;
                overflow: hidden;
                position: relative;
                padding: 0.875rem 72px 0.875rem 1.75rem;
                background-color: rgba(88,101,242,1);
                background-image: linear-gradient(to top right,rgb(46,56,175),rgb(82,93,218));
                color: #ffffff;
                font-size: 15px;
                line-height: 1.25rem;
                font-weight: 700;
                text-align: center;
                text-transform: uppercase;
                vertical-align: middle;
                align-items: center;
                border-radius: 0.5rem;
                gap: 0.75rem;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                border: none;
                transition: all .6s ease;
                width: 100%;
              }
              .auth-modal .discord-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
              }
              .auth-modal .discord-btn span{background-color: rgb(82,93,218);display:grid;position:absolute;right:0;place-items:center;width:3rem;height:100%;}
              .auth-modal .discord-btn span svg{width:1.5rem;height:1.5rem;color:#fff}
              .auth-modal .discord-btn:hover{box-shadow:0 4px 30px rgba(4,175,255,.1),0 2px 30px rgba(11,158,255,.06)}

              .auth-modal .google-btn{padding:10px;font-weight:bold;display:flex;position:relative;overflow:hidden;border-radius:35px;align-items:center;border:2px solid black;outline:none;width:100%;max-width:320px;background:#fff}
              .auth-modal .google-btn:disabled{opacity:0.6;cursor:not-allowed}
              .auth-modal .google-btn .svg{height:25px;margin-right:10px}
              .auth-modal .google-btn .text{z-index:10;font-size:14px}
              .auth-modal .google-btn:hover .text{animation:text 0.3s forwards}
              @keyframes text{from{color:black}to{color:white}}
              .auth-modal .google-btn .svg{z-index:6}
              .auth-modal .google-btn:hover::before{content:"";display:block;position:absolute;top:50%;left:9%;transform:translate(-50%,-50%);width:0;height:0;opacity:0;border-radius:300px;animation:wave1 2.5s ease-in-out forwards}
              .auth-modal .google-btn:hover::after{content:"";display:block;position:absolute;top:50%;left:9%;transform:translate(-50%,-50%);width:0;height:0;opacity:0;border-radius:300px;animation:wave2 2.5s ease-in-out forwards}
              @keyframes wave1{0%{z-index:1;background:#EB4335;width:0;height:0;opacity:1}1%{z-index:1;background:#EB4335;width:0;height:0;opacity:1}25%{z-index:1;background:#EB4335;width:800px;height:800px;opacity:1}26%{z-index:3;background:#34A853;width:0;height:0;opacity:1}50%{z-index:3;background:#34A853;width:800px;height:800px;opacity:1}70%{z-index:3;background:#34A853;width:800px;height:800px;opacity:1}100%{z-index:3;background:#34A853;width:800px;height:800px;opacity:1}}
              @keyframes wave2{0%{z-index:2;background:#FBBC05;width:0;height:0;opacity:1}11%{z-index:2;background:#FBBC05;width:0;height:0;opacity:1}35%{z-index:2;background:#FBBC05;width:800px;height:800px;opacity:1}39%{z-index:2;background:#FBBC05;width:800px;height:800px;opacity:1}40%{z-index:4;background:#4285F4;width:0;height:0;opacity:1}64%{z-index:4;background:#4285F4;width:800px;height:800px;opacity:1}100%{z-index:4;background:#4285F4;width:800px;height:800px;opacity:1}}
              .auth-modal .google-btn:hover .red{animation:disappear 0.1s forwards;animation-delay:0.1s}
              .auth-modal .google-btn:hover .yellow{animation:disappear 0.1s forwards;animation-delay:0.3s}
              .auth-modal .google-btn:hover .green{animation:disappear 0.1s forwards;animation-delay:0.7s}
              .auth-modal .google-btn:hover .blue{animation:disappear 0.1s forwards;animation-delay:1.1s}
              @keyframes disappear{from{filter:brightness(1)}to{filter:brightness(100)}}
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
