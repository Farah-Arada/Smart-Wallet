import React, { useState, useEffect } from 'react';
import { KeyRound, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

const API = 'http://localhost:5000/api';
const RESEND_SECONDS = 60;

export default function OTPView({ setView = () => {}, setCurrentUser = () => {}, t = (k) => String(k) }) {
  const safeT = (key) => {
    try {
      const val = typeof t === 'function' ? t(key) : key;
      return (typeof val === 'object' && val !== null) ? String(key) : val;
    } catch (e) {
      return String(key);
    }
  };

  const [otp, setOtp]           = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = sessionStorage.getItem('pendingEmail');
    if (!email) {
      setError('Session expired. Please login again.');
      setLoading(false);
      return setView('login');
    }

    try {
      const res  = await fetch(`${API}/user/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        return setError(data.message || safeT('invalidOTP'));
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      sessionStorage.removeItem('pendingEmail');
      sessionStorage.removeItem('pendingPassword');
      
      setCurrentUser(data.user);
      setView('dashboard');
    } catch {
      setError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const email = sessionStorage.getItem('pendingEmail');
    const password = sessionStorage.getItem('pendingPassword'); 

    if (!email || !password || countdown > 0) return;
    
    setResending(true);
    setResendMsg('');
    setError('');
    
    try {
      const res = await fetch(`${API}/user/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), 
      });
      const data = await res.json();

      if (res.ok) {
        setResendMsg(safeT('otpResent') || 'The code has been re-sent');
        setCountdown(RESEND_SECONDS);
        setOtp('');
      } else {
        setError(data.message || safeT('resendFail') || 'Please go back to login');
      }
    } catch {
      setError('Network error');
    } finally {
      setResending(false);
    }
  };

  const email = sessionStorage.getItem('pendingEmail') || '';
  const maskedEmail = email
    ? (() => {
        const [local, domain] = email.split('@');
        const visible = local.slice(-3);
        const hidden  = '*'.repeat(Math.max(1, local.length - 3));
        return `${hidden}${visible}@${domain}`;
      })()
    : '';

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transition-colors duration-300">
      <div className="inline-flex bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full mb-6">
        <KeyRound className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{safeT('verifyOTP')}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm leading-relaxed">{safeT('otpSent')}</p>
      {maskedEmail && (
        <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-6">{maskedEmail}</p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
          ⚠️ {error}
        </div>
      )}
      {resendMsg && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800">
          {resendMsg}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex gap-3 justify-center" dir="ltr">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={otp[i] || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const arr = otp.split('');
                arr[i] = val;
                const next = arr.join('').slice(0, 4);
                setOtp(next);
                if (val && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !otp[i] && i > 0) {
                  document.getElementById(`otp-${i - 1}`)?.focus();
                }
              }}
              className="w-14 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 dark:text-white transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 4}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-indigo-600/25 flex justify-center items-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> <span>{safeT('verifyBtn')}...</span></>
          ) : (
            <>{safeT('verifyBtn')} <ArrowRight className="w-5 h-5 rtl:rotate-180" /></>
          )}
        </button>
      </form>

      <div className="mt-5 text-sm text-gray-500 dark:text-gray-400">
        {countdown > 0 ? (
          <span>{safeT('resendIn') || 'Resend in'} <span className="font-bold text-indigo-600 dark:text-indigo-400">{countdown}s</span></span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {safeT('resendOTP') || 'Resend OTP'}
          </button>
        )}
      </div>

      <button
        onClick={() => setView('login')}
        className="mt-3 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
         {safeT('login')}
      </button>
    </div>
  );
}