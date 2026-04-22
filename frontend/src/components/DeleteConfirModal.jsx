import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ onConfirm, onCancel, t }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
          <AlertTriangle className="w-8 h-8" />
          <h3 className="text-xl font-bold">{t('confirmDeleteTitle')}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{t('confirmDeleteMsg')}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold"
          >
            {t('yesDelete')}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2.5 rounded-xl font-bold"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
