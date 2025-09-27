import React from 'react';
import { formatQuestionTypeName } from '../../utils/questionTypeFormatter';

const ExampleModal = ({ isOpen, onClose, selectedQuestionType, getExampleForType, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-black border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} rounded-2xl max-w-2xl w-full p-6 border`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Example {formatQuestionTypeName(selectedQuestionType?.id)}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-xl p-4 text-sm leading-6`}>
          {getExampleForType(selectedQuestionType?.id)}
        </div>
      </div>
    </div>
  );
};

export default ExampleModal;
