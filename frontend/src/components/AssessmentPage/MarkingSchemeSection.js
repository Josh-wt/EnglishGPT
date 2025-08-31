import React from 'react';

const MarkingSchemeSection = ({ 
  markingScheme, 
  setMarkingScheme, 
  uploadOption, 
  onUploadOptionChange, 
  onFileUpload, 
  onSubmit, 
  isLoading, 
  darkMode 
}) => {
  return (
    <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 mb-6 shadow-sm border`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Marking Scheme</h2>
        <span className="text-sm px-3 py-1 rounded-full font-medium bg-red-100 text-red-700">
          Required
        </span>
      </div>
      
      <div className="flex mb-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-1 flex`}>
          <button
            onClick={() => onUploadOptionChange('text')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              uploadOption === 'text'
                ? `${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600'} shadow-sm`
                : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
            }`}
          >
            Paste Text
          </button>
          <button
            onClick={() => onUploadOptionChange('file')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              uploadOption === 'file'
                ? `${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600'} shadow-sm`
                : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
            }`}
          >
            Upload File
          </button>
        </div>
      </div>
      
      {uploadOption === 'text' ? (
        <textarea
          value={markingScheme}
          onChange={(e) => setMarkingScheme(e.target.value)}
          placeholder="Paste your marking scheme here..."
          className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) onFileUpload(file);
            }}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Choose File
          </label>
          <p className="text-gray-600 mt-2">Supports PDF, JPG, PNG files</p>
        </div>
      )}
      
      {markingScheme && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800 font-medium">✓ Marking scheme loaded successfully</p>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <button
          onClick={onSubmit}
          disabled={isLoading || !markingScheme.trim()}
          className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🚀 Get AI Feedback
        </button>
      </div>
    </div>
  );
};

export default MarkingSchemeSection;
