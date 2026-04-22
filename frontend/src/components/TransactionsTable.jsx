import { Wallet, Trash2, Pencil } from 'lucide-react';

export default function TransactionsTable({ 
  transactions = [], 
  onEdit = () => {}, 
  onDelete = () => {}, 
  onDeleteAll = () => {}, 
  t = (k) => String(k), 
  lang = 'ar' 
}) {
  
  const safeT = (key) => {
    try {
      const val = typeof t === 'function' ? t(key) : key;
      return (typeof val === 'object' && val !== null) ? String(key) : val;
    } catch (e) {
      return String(key);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{safeT('history')}</h2>
        {transactions.length > 0 && (
          <button
            onClick={onDeleteAll}
            className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" /> {safeT('deleteAll')}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm">
            <tr>
              <th className="px-6 py-4">{safeT('type')}</th>
              <th className="px-6 py-4">{safeT('details')}</th>
              <th className="px-6 py-4">{safeT('locationPerson')}</th>
              <th className="px-6 py-4">{safeT('date')}</th>
              <th className="px-6 py-4">{safeT('amount')}</th>
              <th className="px-6 py-4 text-center">{safeT('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/20">
                  <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-lg font-medium">{safeT('noData')}</p>
                  <p className="text-sm mt-1">{safeT('startAdding')}</p>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id || tx._id || Math.random()} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'income'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : tx.type === 'expense'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
                      }`}
                    >
                      {safeT(tx.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{tx.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{tx.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">{tx.date}</td>
                  <td
                    className={`px-6 py-4 text-sm font-bold ${
                      tx.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : tx.type === 'expense'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {tx.amount} {safeT('currency')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => typeof onEdit === 'function' && onEdit(tx)}
                        className="text-gray-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title={safeT('editBtn') || 'edit'}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => typeof onDelete === 'function' && onDelete(tx.id || tx._id)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title={safeT('deleteBtn') || 'delete'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}