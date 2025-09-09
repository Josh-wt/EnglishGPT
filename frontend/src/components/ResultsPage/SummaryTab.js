import React from 'react';

const SummaryTab = ({ evaluation, darkMode, onFeedback }) => {
  // Function to parse and format the AI feedback content
  const formatFeedback = (feedback) => {
    if (!feedback) return [];
    
    // Split by bullet points or line breaks
    const lines = feedback.split(/\n+/).filter(line => line.trim());
    
    // Process each line to format it properly
    return lines.map((line, index) => {
      // Clean up the line
      let cleanLine = line.trim();
      
      // Remove common bullet point patterns
      cleanLine = cleanLine.replace(/^[•\-\*\+]\s*/, '');
      cleanLine = cleanLine.replace(/^\d+\.\s*/, '');
      
      return cleanLine;
    }).filter(line => line.length > 0);
  };

  const feedbackPoints = formatFeedback(evaluation.feedback);

  return (
    <div className="space-y-6">
      {/* AI Summary Content */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📝 Essay Evaluation Summary
        </h2>
        
        {feedbackPoints.length > 0 ? (
          <div className="space-y-4">
            {feedbackPoints.map((point, index) => (
              <div key={index} className="flex items-start">
                <span className="mr-3 text-blue-500 font-bold">•</span>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>
            <p>No detailed feedback available for this evaluation.</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 Quick Stats
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {evaluation.grade || 'N/A'}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Grade</p>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {evaluation.student_response ? evaluation.student_response.split(/\s+/).filter(word => word.length > 0).length : 0}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Words</p>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {evaluation.question_type ? evaluation.question_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</p>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {evaluation.timestamp ? new Date(evaluation.timestamp).toLocaleDateString() : 'N/A'}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</p>
          </div>
        </div>
      </div>

      {/* Feedback Button */}
      <div className="text-center">
        <button
          onClick={() => onFeedback('overall')}
          className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
            darkMode 
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
          }`}
        >
          💬 Provide Feedback on This Evaluation
        </button>
      </div>
    </div>
  );
};

export default SummaryTab;
