import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useUserDetail } from '../../../hooks/admin/useUsers';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">User Details</h2>
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
  const user = data?.user || null;

  const info = useMemo(() => ([
    { label: 'UID', value: user?.uid },
    { label: 'Email', value: user?.email },
    { label: 'Display Name', value: user?.display_name },
    { label: 'Academic Level', value: user?.academic_level },
    { label: 'Subscription', value: user?.subscription_status },
    { label: 'Credits', value: user?.credits },
  ]), [user]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 space-y-6">
        {isLoading && <div>Loading…</div>}
        {isError && <div className="text-red-600">Failed to load user.</div>}
        {user && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {info.map((row) => (
                <div key={row.label}>
                  <div className="text-xs uppercase text-gray-500">{row.label}</div>
                  <div className="text-sm break-all font-mono">{row.value || '—'}</div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Evaluations ({user.evaluations?.length || 0})</h3>
              <div className="rounded border overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="px-3 py-2 text-left">short_id</th>
                      <th className="px-3 py-2 text-left">question_type</th>
                      <th className="px-3 py-2 text-left">grade</th>
                      <th className="px-3 py-2 text-left">timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(user.evaluations || []).map(ev => (
                      <tr key={ev.id} className="border-t">
                        <td className="px-3 py-2 font-mono">{ev.short_id || ev.id}</td>
                        <td className="px-3 py-2">{ev.question_type}</td>
                        <td className="px-3 py-2">{ev.grade}</td>
                        <td className="px-3 py-2">{ev.timestamp}</td>
                      </tr>
                    ))}
                    {!user.evaluations?.length && (
                      <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">No evaluations</td></tr>
                    )}
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

