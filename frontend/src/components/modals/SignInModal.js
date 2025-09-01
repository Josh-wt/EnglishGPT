import React from 'react';

const SignInModal = ({ isOpen, onClose, darkMode, onDiscord, onGoogle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Sign In Required</h3>
          <p className="text-gray-600 mb-6">Please sign in to access this feature.</p>
          <div className="space-y-3">
            <button
              onClick={() => { onClose(); onGoogle(); }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign in with Google
            </button>
            <button
              onClick={() => { onClose(); onDiscord(); }}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Sign in with Discord
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-4 text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
