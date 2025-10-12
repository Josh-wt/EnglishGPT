import React from 'react';
import { createPortal } from 'react-dom';
import { useEvaluationDetail } from '../../../hooks/admin/useEvaluations';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="absolute top-3 right-3">
          <button onClick={onClose} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">Close</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

const Row = ({ label, value }) => (
  <div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-sm">{value}</div>
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
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Evaluation Details</h2>
        {isLoading && <div>Loading…</div>}
        {isError && <div className="text-red-600">Failed to load evaluation.</div>}
        {evaluation && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Row label="Short ID" value={evaluation.short_id || evaluation.id?.slice(-8) || 'N/A'} />
              <Row label="Question Type" value={evaluation.question_type || 'N/A'} />
              <Row label="Grade" value={evaluation.grade || 'N/A'} />
              <Row label="Timestamp" value={evaluation.timestamp ? new Date(evaluation.timestamp).toLocaleString() : 'N/A'} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Row label="Reading Marks" value={evaluation.reading_marks || 'N/A'} />
              <Row label="Writing Marks" value={evaluation.writing_marks || 'N/A'} />
              <Row label="AO1 Marks" value={evaluation.ao1_marks || 'N/A'} />
              <Row label="AO2 Marks" value={evaluation.ao2_marks || 'N/A'} />
              <Row label="Content Structure" value={evaluation.content_structure_marks || 'N/A'} />
              <Row label="Style Accuracy" value={evaluation.style_accuracy_marks || 'N/A'} />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Student Response</h3>
              <div className="rounded border p-3 whitespace-pre-wrap text-sm max-h-64 overflow-auto bg-gray-50 dark:bg-gray-800">
                {evaluation.student_response || 'No student response available'}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">AI Feedback</h3>
              <div className="rounded border p-3 whitespace-pre-wrap text-sm max-h-64 overflow-auto bg-gray-50 dark:bg-gray-800">
                {evaluation.feedback || 'No feedback available'}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Strengths</h3>
              <div className="rounded border p-3 whitespace-pre-wrap text-sm max-h-64 overflow-auto bg-gray-50 dark:bg-gray-800">
                {Array.isArray(evaluation.strengths) 
                  ? evaluation.strengths.join('\n• ') 
                  : evaluation.strengths || 'No strengths available'
                }
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Improvement Suggestions</h3>
              <div className="rounded border p-3 whitespace-pre-wrap text-sm max-h-64 overflow-auto bg-gray-50 dark:bg-gray-800">
                {Array.isArray(evaluation.improvement_suggestions) 
                  ? evaluation.improvement_suggestions.join('\n• ') 
                  : evaluation.improvement_suggestions || 'No improvement suggestions available'
                }
              </div>
            </div>

            {evaluation.next_steps && (
              <div>
                <h3 className="font-semibold mb-2">Next Steps</h3>
                <div className="rounded border p-3 whitespace-pre-wrap text-sm max-h-64 overflow-auto bg-gray-50 dark:bg-gray-800">
                  {Array.isArray(evaluation.next_steps) 
                    ? evaluation.next_steps.join('\n• ') 
                    : evaluation.next_steps
                  }
                </div>
              </div>
            )}

            {fullChat && (
              <div>
                <h3 className="font-semibold mb-2">Full Chat Data</h3>
                <div className="rounded border p-3 text-xs max-h-72 overflow-auto bg-gray-50 dark:bg-gray-800 font-mono">
                  {fullChat.error ? (
                    <div className="text-orange-600">{fullChat.error}</div>
                  ) : (
                    <pre>{JSON.stringify(fullChat, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EvaluationDetailModal;

