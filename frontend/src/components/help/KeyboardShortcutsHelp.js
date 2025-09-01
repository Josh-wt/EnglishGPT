import React from 'react';

const KeyboardShortcutsHelp = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-fredoka font-bold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">Dashboard</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Alt + 1</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">Analytics</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Alt + 2</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">History</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Alt + 3</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">Account</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Alt + 4</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">Submit Form</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl + Enter</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">Go Back/Close</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Escape</kbd>
          </div>
          <div className="border-t pt-3 mt-3">
            <p className="text-xs text-gray-500 font-fredoka">
              Press <kbd className="px-1 bg-gray-100 rounded">?</kbd> to show this help again
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
