import React, { useState, useEffect } from 'react';
import { Wallet, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

import API from '../utils/api';

export default function LoginView({ setView = () => {}, setCurrentUser = () => {}, t = (k) => String(k) }) {
  const safeT = (key) => {
    try {
      const val = typeof t === 'function' ? t(key) : key;
      return (typeof val === 'object' && val !== null) ? String(key) : val;
    } catch (e) {
      return String(key);
    }
  };

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('signupSuccess')) {
      setSuccessMsg(safeT('signupSuccess'));
      sessionStorage.removeItem('signupSuccess');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch(`${API}/user/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return setError(data.message || safeT('invalidCreds'));
      }

      sessionStorage.setItem('pendingEmail', data.email || email);
      sessionStorage.setItem('pendingPassword', password);

      setView('otp');
    } catch {
      setError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">

      <div className="text-center mb-8">
        <div className="inline-flex bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{safeT('login')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{safeT('appTitle')}</p>
      </div>

      {successMsg && (
        <div className="mb-5 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-semibold border border-green-200 dark:border-green-800 text-center flex items-center justify-center gap-2">
          <span></span> {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800 text-center">
           {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{safeT('email')}</label>
          <div className="relative">
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full ltr:pl-10 rtl:pr-10 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
            />
            <Mail className="w-5 h-5 text-gray-400 absolute rtl:right-3 ltr:left-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{safeT('password')}</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full ltr:pl-10 rtl:pr-10 ltr:pr-11 rtl:pl-11 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-all"
            />
            <Lock className="w-5 h-5 text-gray-400 absolute rtl:right-3 ltr:left-3 top-3.5 pointer-events-none" />
            <button
              type="button"
              tabIndex="-1"
              onClick={() => setShowPass(!showPass)}
              className="absolute rtl:left-3 ltr:right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() => setView('forgot-password')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
            >
              {safeT('forgotPassword') || 'Forgot Password?'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-blue-600/25 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> <span>{safeT('login')}...</span></>
          ) : safeT('login')}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
        {safeT('noAccount')}{' '}
        <button onClick={() => setView('signup')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline mx-1">
          {safeT('signup')}
        </button>
      </p>
    </div>
  );
}