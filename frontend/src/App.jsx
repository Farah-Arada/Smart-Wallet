import { useState, useEffect } from 'react';

import translations from './utils/translations';
import TopBar from './components/TopBar';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import OTPView from './views/OTPView';
import DashboardView from './views/DashboardView';
import ForgotPasswordView from './views/ForgotPasswordView';
import ResetPasswordView from './views/ResetPasswordView';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');
  const [view, setView] = useState(() => {
    const user = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    if (!user || !token) return 'login';

    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      if (Date.now() / 1000 > exp) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        return 'login';
      }
    } catch {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      return 'login';
    }

    return 'dashboard';
  });
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')) || null);

  const t = (key) => translations[lang][key] || key;

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('lang', lang);
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('bg-gray-900');
      document.body.classList.remove('bg-gray-50');
    } else {
      root.classList.remove('dark');
      document.body.classList.add('bg-gray-50');
      document.body.classList.remove('bg-gray-900');
    }
  }, [theme, lang]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setView('login');
  };

  return (
    <div className="min-h-screen font-sans bg-transparent" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-300">

        <TopBar
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
          currentUser={currentUser}
          view={view}
          onLogout={handleLogout}
          t={t}
        />

          <div className="pt-20 pb-10">
          {view === 'login'           && <LoginView           setView={setView} setCurrentUser={setCurrentUser} t={t} />}
          {view === 'signup'          && <SignupView          setView={setView} t={t} />}
          {view === 'otp'             && <OTPView             setView={setView} setCurrentUser={setCurrentUser} t={t} />}
          {view === 'forgot-password' && <ForgotPasswordView  setView={setView} t={t} />}
          {view === 'reset-password'  && <ResetPasswordView   setView={setView} setCurrentUser={setCurrentUser} t={t} />}
          {view === 'dashboard'       && <DashboardView       user={currentUser} t={t} lang={lang} />}
        </div>

      </div>
    </div>
  );
}
