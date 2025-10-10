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

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Evaluation Details</h2>
        {isLoading && <div>Loading…</div>}
        {isError && <div className="text-red-600">Failed to load evaluation.</div>}
        {data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Row label="short_id" value={data.short_id || data.id} />
              <Row label="question_type" value={data.question_type} />
              <Row label="grade" value={data.grade} />
              <Row label="created_at" value={data.created_at} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Row label="reading_marks" value={data.reading_marks} />
              <Row label="writing_marks" value={data.writing_marks} />
              <Row label="sol_marks" value={data.sol_marks} />
              <Row label="so2_marks" value={data.so2_marks} />
              <Row label="content_structure_marks" value={data.content_structure_marks} />
              <Row label="style_accuracy_marks" value={data.style_accuracy_marks} />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Student Response</h3>
              <div className="rounded border p-3 whitespace-pre-wrap text-sm max-h-64 overflow-auto">{data.student_response}</div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">AI Feedback</h3>
              <div className="rounded border p-3 whitespace-pre-wrap text-sm max-h-64 overflow-auto">{data.feedback}</div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Strengths</h3>
              <div className="rounded border p-3 whitespace-pre-wrap text-sm max-h-64 overflow-auto">{data.strengths}</div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Full Chat</h3>
              <div className="rounded border p-3 whitespace-pre-wrap text-xs max-h-72 overflow-auto">{data.full_chat}</div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EvaluationDetailModal;

