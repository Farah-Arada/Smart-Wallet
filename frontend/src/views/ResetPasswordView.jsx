import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function ResetPasswordView({ setView = () => {}, setCurrentUser = () => {}, t = (k) => String(k) }) {
  const safeT = (key) => {
    try {
      const val = typeof t === 'function' ? t(key) : key;
      return (typeof val === 'object' && val !== null) ? String(key) : val;
    } catch (e) {
      return String(key);
    }
  };

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const email = sessionStorage.getItem('pendingEmail');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError(safeT('passMismatch') || 'passwords do not match');
    }
    if (newPassword.length < 6) {
      return setError(safeT('passShort') || 'Password must be at least 6 characters long.');
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        return setError(data.message || safeT('invalidOTP') || 'Invalid OTP or expired');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      sessionStorage.removeItem('pendingEmail');
      
      setCurrentUser(data.user);
      setView('dashboard');
    } catch {
      setError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="inline-flex bg-green-100 dark:bg-green-900/50 p-4 rounded-full mb-6">
        <Lock className="w-12 h-12 text-green-600 dark:text-green-400" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {safeT('resetPassword') || 'New Password'}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
        {safeT('enterNewPassDesc') || `Enter the 4-digit code we sent to your email, then choose a new password.`}
      </p>

      {maskedEmail && (
        <p className="text-green-600 dark:text-green-400 font-semibold text-sm mb-6" dir="ltr">{maskedEmail}</p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-5 text-start">
        
        <div className="flex gap-3 justify-center mb-6" dir="ltr">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              id={`reset-otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={otp[i] || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const arr = otp.split('');
                arr[i] = val;
                setOtp(arr.join('').slice(0, 4));
                if (val && i < 3) document.getElementById(`reset-otp-${i + 1}`)?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !otp[i] && i > 0) {
                  document.getElementById(`reset-otp-${i - 1}`)?.focus();
                }
              }}
              className="w-14 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900 dark:text-white transition-all"
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{safeT('newPassword') || 'New Password'}</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full ltr:pl-10 rtl:pr-10 ltr:pr-11 rtl:pl-11 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white transition-all"
            />
            <Lock className="w-5 h-5 text-gray-400 absolute rtl:right-3 ltr:left-3 top-3.5 pointer-events-none" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute rtl:left-3 ltr:right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{safeT('confirmPass')}</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full ltr:pl-10 rtl:pr-10 ltr:pr-11 rtl:pl-11 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white transition-all"
            />
            <Lock className="w-5 h-5 text-gray-400 absolute rtl:right-3 ltr:left-3 top-3.5 pointer-events-none" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute rtl:left-3 ltr:right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 4}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 rtl:rotate-180" />}
          <span>{safeT('confirmChange') || 'Confirm Change and Login'}</span>
        </button>
      </form>

      <button
        onClick={() => setView('login')}
        className="mt-6 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium"
      >
        {safeT('cancel') || 'Cancel and Go Back'}
      </button>
    </div>
  );
}