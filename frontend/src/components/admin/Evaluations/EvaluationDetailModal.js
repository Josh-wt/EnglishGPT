import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useEvaluationDetail } from '../../../hooks/admin/useEvaluations';
import { Copy, Check, ExternalLink, X } from 'lucide-react';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Evaluation Details</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

const CopyableText = ({ text, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 whitespace-pre-wrap text-sm max-h-64 overflow-auto bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        {text || 'No content available'}
      </div>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>
    </div>
  );
};

const Row = ({ label, value, isShortId = false }) => (
  <div>
    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</div>
    <div className="text-sm font-medium text-gray-900 dark:text-white">
      {isShortId && value && value !== 'N/A' ? (
        <div className="flex items-center space-x-2">
          <span className="font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs">
            {value}
          </span>
          <a
            href={`https://englishgpt.everythingenglish.xyz/results/${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="View results page"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-xs">View Results</span>
          </a>
        </div>
      ) : (
        value
      )}
    </div>
  </div>
);

const EvaluationDetailModal = ({ evaluationId, open, onClose }) => {
  const { data, isLoading, isError } = useEvaluationDetail(evaluationId);

  // Debug logging
  React.useEffect(() => {
    if (data) {
      console.log('EvaluationDetailModal received data:', data);
      console.log('Evaluation:', data?.evaluation);
      console.log('Full chat:', data?.full_chat);
    }
  }, [data]);

  // Extract evaluation data from the response structure
  const evaluation = data?.evaluation || data;
  const fullChat = data?.full_chat;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 space-y-8">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="ml-4 text-gray-600 dark:text-gray-400">Loading evaluation details...</div>
          </div>
        )}
        
        {isError && (
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 mb-4">Failed to load evaluation details</div>
          </div>
        )}
        
        {evaluation && (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Basic Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Row 
                  label="Short ID" 
                  value={evaluation.short_id || evaluation.id?.slice(-8) || 'N/A'} 
                  isShortId={true}
                />
                <Row label="Question Type" value={evaluation.question_type || 'N/A'} />
                <Row label="Grade" value={evaluation.grade ? `${evaluation.grade}%` : 'N/A'} />
                <Row label="Timestamp" value={evaluation.timestamp ? new Date(evaluation.timestamp).toLocaleString() : 'N/A'} />
              </div>
            </div>

            {/* Marks Breakdown */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Marks Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Row label="Reading Marks" value={evaluation.reading_marks || 'N/A'} />
                <Row label="Writing Marks" value={evaluation.writing_marks || 'N/A'} />
                <Row label="AO1 Marks" value={evaluation.ao1_marks || 'N/A'} />
                <Row label="AO2 Marks" value={evaluation.ao2_marks || 'N/A'} />
                <Row label="Content Structure" value={evaluation.content_structure_marks || 'N/A'} />
                <Row label="Style Accuracy" value={evaluation.style_accuracy_marks || 'N/A'} />
              </div>
            </div>

            {/* Student Response */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Student Response
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Click to copy)</span>
              </h3>
              <CopyableText text={evaluation.student_response || 'No student response available'} />
            </div>

            {/* AI Feedback */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                AI Feedback
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Click to copy)</span>
              </h3>
              <CopyableText text={evaluation.feedback || 'No feedback available'} />
            </div>

            {/* Strengths */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Strengths
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Click to copy)</span>
              </h3>
              <CopyableText 
                text={Array.isArray(evaluation.strengths) 
                  ? evaluation.strengths.map(s => `• ${s}`).join('\n')
                  : evaluation.strengths || 'No strengths available'
                } 
              />
            </div>

            {/* Improvement Suggestions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Improvement Suggestions
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Click to copy)</span>
              </h3>
              <CopyableText 
                text={Array.isArray(evaluation.improvement_suggestions) 
                  ? evaluation.improvement_suggestions.map(s => `• ${s}`).join('\n')
                  : evaluation.improvement_suggestions || 'No improvement suggestions available'
                } 
              />
            </div>

            {/* Next Steps */}
            {evaluation.next_steps && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                  Next Steps
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Click to copy)</span>
                </h3>
                <CopyableText 
                  text={Array.isArray(evaluation.next_steps) 
                    ? evaluation.next_steps.map(s => `• ${s}`).join('\n')
                    : evaluation.next_steps
                  } 
                />
              </div>
            )}

            {/* Full Chat Data */}
            {fullChat && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                  Full Chat Data
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Click to copy JSON)</span>
                </h3>
                <CopyableText 
                  text={fullChat.error ? fullChat.error : JSON.stringify(fullChat, null, 2)}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EvaluationDetailModal;

