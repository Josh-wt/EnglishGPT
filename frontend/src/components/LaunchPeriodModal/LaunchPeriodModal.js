import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  SparklesIcon, 
  GiftIcon, 
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';

const LaunchPeriodModal = ({ darkMode, getApiUrl }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const handleShowModal = (event) => {
      console.log('🎉 Launch period modal triggered:', event.detail);
      setUserId(event.detail.userId);
      setIsVisible(true);
    };

    window.addEventListener('show-launch-modal', handleShowModal);
    return () => window.removeEventListener('show-launch-modal', handleShowModal);
  }, []);

  const handleAcceptOffer = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      console.log('🎁 User accepted launch period offer');
      
      // Grant unlimited access for launch period
      const response = await axios.put(`${getApiUrl()}/users/${userId}`, {
        current_plan: 'unlimited',
        launch_period_granted: true,
        launch_period_granted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      console.log('✅ Launch period unlimited access granted:', response.data);
      
      // Mark modal as shown
      localStorage.setItem(`launch-modal-shown-${userId}`, 'true');
      
      // Close modal
      setIsVisible(false);
      
      // Show success toast
      toast.success('🎉 Unlimited access granted! Welcome to the launch period!', {
        duration: 5000,
        icon: '🚀',
      });
      
      // Reload to refresh user data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Failed to grant launch period access:', error);
      toast.error('Failed to grant unlimited access. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineOffer = () => {
    console.log('⏭️ User declined launch period offer');
    
    // Mark modal as shown (so it doesn't appear again)
    if (userId) {
      localStorage.setItem(`launch-modal-shown-${userId}`, 'true');
    }
    
    setIsVisible(false);
    
    toast.success('You can always upgrade to unlimited later from the pricing page!', {
      duration: 4000,
      icon: '💡',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-2xl`}>
        <CardHeader className="text-center relative">
          <button
            onClick={handleDeclineOffer}
            className={`absolute top-4 right-4 p-2 rounded-full ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            } transition-colors`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <div className="flex justify-center mb-4">
            <div className="relative">
              <SparklesIcon className="w-16 h-16 text-yellow-500" />
              <GiftIcon className="w-8 h-8 text-red-500 absolute -top-2 -right-2" />
            </div>
          </div>
          
          <CardTitle className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🚀 Launch Period Special!
          </CardTitle>
          
          <CardDescription className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Welcome to EnglishGPT! As a new user, you're eligible for our exclusive launch offer.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Offer Details */}
          <div className={`p-6 rounded-lg border-2 border-dashed ${
            darkMode ? 'border-yellow-400 bg-yellow-900/20' : 'border-yellow-500 bg-yellow-50'
          }`}>
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1">
                <StarIcon className="w-4 h-4 mr-1" />
                Limited Time Offer
              </Badge>
              
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                FREE Unlimited Access
              </h3>
              
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Get everything EnglishGPT has to offer, completely free during our launch period!
              </p>
            </div>
          </div>

          {/* Features Included */}
          <div className="space-y-3">
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              What's Included:
            </h4>
            
            <div className="grid gap-3">
              {[
                'Unlimited AI-powered markings',
                'Advanced writing analysis',
                'Personalized feedback',
                'All question types and levels',
                'Premium writing suggestions',
                'Detailed performance analytics'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg ${
            darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
          }`}>
            <ClockIcon className="w-5 h-5" />
            <span className="text-sm font-medium">
              Launch period offer - Available for new users only!
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleAcceptOffer}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Activating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <GiftIcon className="w-5 h-5" />
                  <span>Yes, Give Me Free Unlimited Access! 🎉</span>
                </div>
              )}
            </Button>
            
            <Button
              onClick={handleDeclineOffer}
              variant="outline"
              className={`w-full ${
                darkMode 
                  ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              No thanks, I'll upgrade later
            </Button>
          </div>

          {/* Footer Note */}
          <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            This offer is exclusively for new users during our launch period. 
            You can always upgrade to unlimited later from the pricing page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaunchPeriodModal;
