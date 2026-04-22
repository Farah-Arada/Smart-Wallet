import { Moon, Sun, Globe, LogOut } from 'lucide-react';

export default function TopBar({ theme, setTheme, lang, setLang, currentUser, view, onLogout, t }) {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
      <div className="pointer-events-auto flex gap-2">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-bold"
        >
          <Globe className="w-5 h-5" />
          <span className="text-sm">{lang === 'ar' ? 'EN' : 'عربي'}</span>
        </button>
      </div>

      {currentUser && view === 'dashboard' && (
        <button
          onClick={onLogout}
          className="pointer-events-auto p-2.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm hidden sm:block">{t('logout')}</span>
        </button>
      )}
    </div>
  );
}
