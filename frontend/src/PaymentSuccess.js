import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import subscriptionService from './services/subscriptionService';
import toast, { Toaster } from 'react-hot-toast';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120000; // 2 minutes

const PaymentSuccess = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState(null);
  const [verifying, setVerifying] = useState(true);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState(null);
  const [startedAt] = useState(Date.now());

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const paymentId = queryParams.get('payment_id');
  const subscriptionId = queryParams.get('subscription_id');
  const redirectStatus = queryParams.get('status');

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id || null;
      if (!uid) {
        toast.error('Please sign in to complete activation');
        navigate('/', { replace: true });
        return;
      }
      setUserId(uid);

      // Poll backend status while webhooks finalize
      const poll = async () => {
        try {
          const result = await subscriptionService.getSubscriptionStatus(uid);
          setStatus(result);
          if (result?.hasActiveSubscription) {
            setActive(true);
            setVerifying(false);
            toast.success('Unlimited access enabled');
            return;
          }
        } catch (e) {
          // Non-fatal: keep polling briefly
        }

        if (!cancelled && Date.now() - startedAt < POLL_TIMEOUT_MS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          setVerifying(false);
        }
      };

      poll();
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [navigate, startedAt]);

  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
  };

  return (
    <div className={`min-h-screen ${theme.bg} py-10 px-6`}> 
      <div className="max-w-3xl mx-auto">
        <div className={`${theme.card} border rounded-2xl shadow-lg overflow-hidden`}> 
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className={`text-2xl font-bold ${theme.text}`}>Payment Success</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {active ? 'Active' : verifying ? 'Verifying' : 'Pending'}
              </span>
            </div>

            <p className={`${theme.textSecondary} mb-6`}>
              {active
                ? 'Your subscription is now active. Enjoy unlimited access.'
                : verifying
                  ? 'We are verifying your payment and activating your subscription. This usually takes a few seconds.'
                  : 'We could not confirm activation yet. You can refresh or open the customer portal to review payment status.'}
            </p>

            {(paymentId || subscriptionId || redirectStatus) && (
              <div className="mb-6 text-xs opacity-75">
                <div className={`${theme.textSecondary}`}>Reference details:</div>
                <div className="mt-1 space-y-1">
                  {paymentId && <div className="break-all">payment_id: {paymentId}</div>}
                  {subscriptionId && <div className="break-all">subscription_id: {subscriptionId}</div>}
                  {redirectStatus && <div className="break-all">status: {redirectStatus}</div>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center px-4 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Go to Dashboard
              </button>
              <button
                onClick={async () => {
                  if (!userId) return;
                  try {
                    await subscriptionService.openCustomerPortal(userId);
                  } catch (e) {
                    toast.error('Unable to open customer portal');
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-3 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
              >
                Open Customer Portal
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center justify-center px-4 py-3 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
              >
                Back to Home
              </button>
              {!active && (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Refresh Status
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default PaymentSuccess;


