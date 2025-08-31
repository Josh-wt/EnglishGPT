import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KeyboardShortcutsHelp = ({ isVisible, onClose }) => {
  const shortcuts = [
    { key: 'Alt + 1', description: 'Go to Dashboard' },
    { key: 'Alt + 2', description: 'Go to Analytics' },
    { key: 'Alt + 3', description: 'Go to History' },
    { key: 'Alt + 4', description: 'Go to Account' },
    { key: 'Ctrl + Z', description: 'Undo (in text areas)' },
    { key: 'Ctrl + Y', description: 'Redo (in text areas)' },
    { key: 'Ctrl + Enter', description: 'Submit form (in text areas)' },
    { key: 'Escape', description: 'Go back or close modals' },
    { key: '?', description: 'Show this help' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", bounce: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid gap-4">
              {shortcuts.map((shortcut, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-gray-700">{shortcut.description}</span>
                  <kbd className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md font-mono text-sm">
                    {shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">?</kbd> anytime to show this help
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsHelp;
