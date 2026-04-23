import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Wallet } from 'lucide-react';

const API = 'https://smart-wallet-cftx.onrender.com/api';

function PasswordStrength({ password, t }) {
  if (!password) return null;
  const strong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const medium = password.length >= 6;
  const level  = strong ? 3 : medium ? 2 : 1;
  const labels = ['', t('passWeak') || 'Weak', t('passFair') || 'Movable', t('passStrong') || 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-yellow-400', 'bg-green-500'];
  const textColors = ['', 'text-red-500', 'text-yellow-500', 'text-green-600'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= level ? colors[level] : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[level]}`}>{labels[level]}</p>
    </div>
  );
}

export default function SignupView({ setView = () => {}, t = (k) => String(k) }) {
  const safeT = (key) => {
    try {
      const val = typeof t === 'function' ? t(key) : key;
      return (typeof val === 'object' && val !== null) ? String(key) : val;
    } catch (e) {
      return String(key);
    }
  };

  const [username, setUsername]     = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError(safeT('passMismatch'));
    if (password.length < 6)  return setError(safeT('passShort') || 'Password must be at least 6 characters long');
    if (!/\S+@\S+\.\S+/.test(email)) return setError(safeT('invalidEmail') || 'Invalid email address');
    if (!/[A-Z]/.test(password)) return setError('Password must contain at least one uppercase letter');
    if (!/[0-9]/.test(password)) return setError('Password must contain at least one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return setError('Password must contain at least one special character');


    setLoading(true);
    try {
      const res  = await fetch(`${API}/user/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400) return setError(safeT('userExists'));
        const errMsg = data.message || 'Server error';
        return setError(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
      }

      sessionStorage.setItem('signupSuccess', 'true');
      setView('login');
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{safeT('signup')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{safeT('appTitle')}</p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium text-center border border-red-200 dark:border-red-800">
           {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4" autoComplete="off">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{safeT('email')}</label>
          <div className="relative">
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full ps-10 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-all"
            />
            <Mail className="w-5 h-5 text-gray-400 absolute start-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{safeT('username')}</label>
          <div className="relative">
            <input
              type="text"
              required
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full ps-10 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-all"
            />
            <User className="w-5 h-5 text-gray-400 absolute start-3 top-3.5 pointer-events-none" />
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
              className="w-full ps-10 pe-11 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-all"
            />

            <div className="text-xs mt-2">
              <p className={password.length >= 6 ? 'text-green-500' : 'text-gray-500'}>
                • At least 6 characters
              </p>

              <p className={/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-500'}>
                • One uppercase letter
              </p>

              <p className={/[0-9]/.test(password) ? 'text-green-500' : 'text-gray-500'}>
                • One number
              </p>

              <p className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : 'text-gray-500'}>
                • One special character (@, #, $, etc.)
              </p>

            </div>
            <Lock className="w-5 h-5 text-gray-400 absolute start-3 top-3.5 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute end-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <PasswordStrength password={password} t={safeT} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{safeT('confirmPass')}</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full ps-10 pe-11 p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-all ${
                confirm && password !== confirm
                  ? 'border-red-400 dark:border-red-600'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            <Lock className="w-5 h-5 text-gray-400 absolute start-3 top-3.5 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute end-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirm && password !== confirm && (
            <p className="text-xs text-red-500 mt-1 font-medium">{safeT('passMismatch')}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-blue-600/25 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> <span>{safeT('signup')}...</span></>
          ) : safeT('signup')}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
        {safeT('haveAccount')}{' '}
        <button onClick={() => setView('login')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline mx-1">
          {safeT('login')}
        </button>
      </p>
    </div>
  );
}