import React from 'react';

const LevelSelectionModal = ({ isOpen, onClose, onLevelSelect, darkMode }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Your Academic Level</h3>
          <p className="text-gray-600">Select your current academic level to get personalized question types</p>
        </div>
        
        <div className="space-y-3 mb-6">
          <button
            onClick={() => onLevelSelect('igcse')}
            className="w-full p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">IGCSE</h4>
                <p className="text-sm text-gray-600">International General Certificate of Secondary Education</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => onLevelSelect('alevel')}
            className="w-full p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-left group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-red-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">A-Level 9093</h4>
                <p className="text-sm text-gray-600">Advanced Level English Language</p>
              </div>
            </div>
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full text-gray-500 hover:text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
        >
          I'll choose later
        </button>
      </div>
    </div>
  );
};

export default LevelSelectionModal;
