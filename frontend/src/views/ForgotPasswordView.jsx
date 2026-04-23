import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react';

import API from '../utils/api';

export default function ForgotPasswordView({ setView = () => {}, t = (k) => String(k) }) {
  const safeT = (key) => {
    try {
      const val = typeof t === 'function' ? t(key) : key;
      return (typeof val === 'object' && val !== null) ? String(key) : val;
    } catch (e) {
      return String(key);
    }
  };

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        return setError(data.message || safeT('emailNotFound') || 'Email not found');
      }

      sessionStorage.setItem('pendingEmail', email);
      setView('reset-password');
    } catch {
      setError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transition-colors duration-300">
      <div className="inline-flex bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full mb-6">
        <KeyRound className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {safeT('forgotPassword') || 'Forgot Password?'}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
        {safeT('enterEmailDesc') || 'Enter your registered email below and we will send you a code to reset your password.'}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-start">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{safeT('email')}</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full ltr:pl-10 rtl:pr-10 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
              dir="ltr"
            />
            <Mail className="w-5 h-5 text-gray-400 absolute rtl:right-3 ltr:left-3 top-3.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 rtl:rotate-180" />}
          <span>{safeT('sendOTP') || 'Send OTP'}</span>
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