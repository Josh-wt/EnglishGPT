import React from 'react';
import { createPortal } from 'react-dom';
import { useUserDetail } from '../../../hooks/admin/useUsers';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="absolute top-3 right-3">
          <button onClick={onClose} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">Close</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

const UserDetailModal = ({ userId, open, onClose }) => {
  const { data, isLoading, isError } = useUserDetail(userId);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">User Details</h2>
        {isLoading && <div>Loading…</div>}
        {isError && <div className="text-red-600">Failed to load user.</div>}
        {data && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">UID</div>
                <div className="font-mono text-sm">{data.uid}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-sm">{data.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Display Name</div>
                <div className="text-sm">{data.display_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Academic Level</div>
                <div className="text-sm">{data.academic_level}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Subscription</div>
                <div className="text-sm">{data.subscription_status}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Credits</div>
                <div className="text-sm">{data.credits}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Evaluations ({data.evaluations?.length || 0})</h3>
              <div className="rounded border overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left">short_id</th>
                      <th className="px-3 py-2 text-left">question_type</th>
                      <th className="px-3 py-2 text-left">grade</th>
                      <th className="px-3 py-2 text-left">created_at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.evaluations || []).map(ev => (
                      <tr key={ev.id} className="border-t">
                        <td className="px-3 py-2 font-mono">{ev.short_id || ev.id}</td>
                        <td className="px-3 py-2">{ev.question_type}</td>
                        <td className="px-3 py-2">{ev.grade}</td>
                        <td className="px-3 py-2">{ev.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Feedback Given ({data.feedback?.length || 0})</h3>
              <div className="rounded border overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left">evaluation_id</th>
                      <th className="px-3 py-2 text-left">category</th>
                      <th className="px-3 py-2 text-left">accurate</th>
                      <th className="px-3 py-2 text-left">created_at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.feedback || []).map(fb => (
                      <tr key={fb.id} className="border-t">
                        <td className="px-3 py-2 font-mono">{fb.evaluation_id}</td>
                        <td className="px-3 py-2">{fb.category}</td>
                        <td className="px-3 py-2">{fb.accurate ? 'Yes' : 'No'}</td>
                        <td className="px-3 py-2">{fb.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailModal;

