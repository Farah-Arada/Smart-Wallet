import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, AlertCircle, PieChart, CheckCircle, XCircle,
  PlusCircle, MapPin, Landmark, User, Pencil, X, Trash2, AlertTriangle
} from 'lucide-react';

import API from '../utils/api';

const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// --- Components ---

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 ltr:right-6 rtl:left-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      {type === 'success'
        ? <CheckCircle className="w-5 h-5 shrink-0" />
        : <XCircle    className="w-5 h-5 shrink-0" />}
      {message}
    </div>
  );
}

function StatCard({ title, val, icon, color, cur }) {
  const formatted = typeof val === 'number'
    ? val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : val;
  const colors = {
    blue:   'bg-blue-100   dark:bg-blue-900/40   text-blue-600   dark:text-blue-400',
    green:  'bg-green-100  dark:bg-green-900/40  text-green-600  dark:text-green-400',
    red:    'bg-red-100    dark:bg-red-900/40    text-red-600    dark:text-red-400',
    orange: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium">{title}</h3>
        <div className={`p-3 rounded-full ${colors[color] || colors.blue}`}>
          {icon && React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {formatted} <span className="text-lg text-gray-500 dark:text-gray-400 font-normal">{cur}</span>
      </p>
    </div>
  );
}

function UsageBar({ percent, t }) {
  const hasIncome = percent > 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('consumption')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('consumptionDesc')}</p>
        </div>
        {hasIncome && (
          <span className={`text-lg font-bold ${
            percent > 85 ? 'text-red-500' : percent > 60 ? 'text-orange-400' : 'text-green-500'
          }`}>
            {percent.toFixed(1)}%
          </span>
        )}
      </div>
      {hasIncome && (
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-700 ease-out ${
              percent > 85 ? 'bg-red-500' : percent > 60 ? 'bg-orange-400' : 'bg-green-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

function DeleteConfirmModal({ onConfirm, onCancel, t }) {
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
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2.5 rounded-xl font-bold transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

function TransactionForm({ t, onAdd = () => {}, onUpdate = () => {}, editingTx = null, setEditingTx = () => {} }) {
  const initialForm = {
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    location: '',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editingTx) {
      setFormData({
        type: editingTx.type || 'expense',
        amount: editingTx.amount ? editingTx.amount.toString() : '',
        date: editingTx.date || new Date().toISOString().split('T')[0],
        description: editingTx.description || '',
        location: editingTx.location || '',
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingTx]);

  const getLabels = () => {
    if (formData.type === 'income') return { title: t('income'), loc: t('locIncome'), icon: <Landmark className="w-5 h-5" /> };
    if (formData.type === 'debt') return { title: t('debt'), loc: t('locDebt'), icon: <User className="w-5 h-5" /> };
    return { title: t('expense'), loc: t('locExpense'), icon: <MapPin className="w-5 h-5" /> };
  };

  const labels = getLabels();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.location) return;
    
    if (editingTx) {
      onUpdate(editingTx.id || editingTx._id, { ...formData, amount: parseFloat(formData.amount) });
    } else {
      onAdd({ ...formData, amount: parseFloat(formData.amount) });
    }
    
    setFormData(initialForm); 
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {editingTx ? <Pencil className="w-6 h-6 text-orange-500" /> : <PlusCircle className="w-6 h-6 text-blue-600" />}
          {editingTx ? t('editTransaction') || 'تعديل الحركة' : t('newTransaction')}
        </h2>
        {editingTx && (
          <button 
            type="button"
            onClick={() => typeof setEditingTx === 'function' && setEditingTx(null)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
        {['expense', 'income', 'debt'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFormData({ ...formData, type })}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              formData.type === type
                ? `bg-white dark:bg-gray-800 shadow-sm ${
                    type === 'expense' ? 'text-red-600 dark:text-red-400' : 
                    type === 'income' ? 'text-green-600 dark:text-green-400' : 
                    'text-orange-600 dark:text-orange-400'
                  }`
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t(type)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
          <div className="relative">
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full ltr:pl-12 rtl:pr-12 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
            />
            <span className="absolute rtl:left-4 ltr:right-4 top-3.5 text-gray-500 font-medium">{t('currency')}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('date')}</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('details')}</label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{labels.loc}</label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full ltr:pl-10 rtl:pr-10 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
            />
            <span className="absolute rtl:right-3 ltr:left-3 top-3.5 text-gray-400">{labels.icon}</span>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full text-white font-bold py-3.5 rounded-xl shadow-sm flex justify-center items-center gap-2 ${editingTx ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {editingTx ? (t('updateBtn') || 'تحديث') : t('addBtn')} {labels.title}
        </button>
      </form>
    </div>
  );
}

function TransactionsTable({ transactions = [], onEdit = () => {}, onDelete = () => {}, onDeleteAll = () => {}, t, lang = 'ar' }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('history')}</h2>
        {transactions.length > 0 && (
          <button
            onClick={onDeleteAll}
            className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" /> {t('deleteAll')}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm">
            <tr>
              <th className="px-6 py-4">{t('type')}</th>
              <th className="px-6 py-4">{t('details')}</th>
              <th className="px-6 py-4">{t('locationPerson')}</th>
              <th className="px-6 py-4">{t('date')}</th>
              <th className="px-6 py-4">{t('amount')}</th>
              <th className="px-6 py-4 text-center">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/20">
                  <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-lg font-medium">{t('noData')}</p>
                  <p className="text-sm mt-1">{t('startAdding')}</p>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id || tx._id || Math.random()} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 
                        tx.type === 'expense' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 
                        'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
                      }`}
                    >
                      {t(tx.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{tx.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{tx.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">{tx.date}</td>
                  <td
                    className={`px-6 py-4 text-sm font-bold ${
                      tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 
                      tx.type === 'expense' ? 'text-red-600 dark:text-red-400' : 
                      'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {tx.amount} {t('currency')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => typeof onEdit === 'function' && onEdit(tx)}
                        className="text-gray-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title={t('editBtn') || 'edit'}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => typeof onDelete === 'function' && onDelete(tx.id || tx._id)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title={t('deleteBtn') || 'delete'}
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

// --- Main Component ---

export default function DashboardView({ user, t = (k) => String(k), lang = 'ar' }) {
  const [transactions, setTransactions]        = useState([]);
  const [editingTx, setEditingTx]              = useState(null); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingTx, setLoadingTx]              = useState(true);
  const [toast, setToast]                      = useState(null);

  const safeT = useCallback((key) => {
    try {
      const val = typeof t === 'function' ? t(key) : key;
      return (typeof val === 'object' && val !== null) ? String(key) : val;
    } catch (e) {
      return String(key);
    }
  }, [t]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/transactions/all`, { headers: authHeader() });
      const data = await res.json();
      if (res.ok) {
        setTransactions(
          data.transactions.map((tx) => ({
            ...tx,
            id:   tx._id,
            date: tx.date?.split('T')[0] ?? tx.date,
          }))
        );
      }
    } catch {
      showToast(safeT('fetchError') || 'Failed to load data', 'error');
    } finally {
      setLoadingTx(false);
    }
  }, [showToast, safeT]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleAdd = async (newTx) => {
    try {
      const res  = await fetch(`${API}/transactions/add`, {
        method:  'POST',
        headers: authHeader(),
        body:    JSON.stringify(newTx),
      });
      const data = await res.json();
      if (res.ok) {
        const saved = {
          ...data.transaction,
          id:   data.transaction._id,
          date: data.transaction.date?.split('T')[0],
        };
        setTransactions((prev) => [saved, ...prev]);
        showToast(safeT('addSuccess') || 'Transaction added successfully');
      } else {
        showToast(data.message || (safeT('addError') || 'Failed to add transaction'), 'error');
      }
    } catch {
      showToast(safeT('networkError') || 'Network error', 'error');
    }
  };

  const handleUpdate = async (id, updatedTx) => {
    try {
      const res = await fetch(`${API}/transactions/update/${id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(updatedTx),
      });
      const data = await res.json();
      
      if (res.ok) {
        const modified = {
          ...data.transaction,
          id: data.transaction._id,
          date: data.transaction.date?.split('T')[0],
        };
        setTransactions((prev) => prev.map(tx => tx.id === id ? modified : tx));
        setEditingTx(null); 
        showToast(safeT('updateSuccess') || 'Transaction updated successfully');
      } else {
        showToast(data.message || (safeT('updateError') || 'Failed to update transaction'), 'error');
      }
    } catch {
      showToast(safeT('networkError') || 'Network error', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/transactions/delete/${id}`, {
        method:  'DELETE',
        headers: authHeader(),
      });
      if (res.ok) {
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
        if (editingTx?.id === id) setEditingTx(null); 
        showToast(safeT('deleteSuccess') || 'Transaction deleted successfully');
      } else {
        showToast(safeT('deleteError') || 'Failed to delete transaction', 'error');
      }
    } catch {
      showToast(safeT('networkError') || 'Network error', 'error');
    }
  };

  const handleDeleteAll = async () => {
    try {
      const res = await fetch(`${API}/transactions/clear`, {
        method:  'DELETE',
        headers: authHeader(),
      });
      if (res.ok) {
        setTransactions([]);
        setEditingTx(null);
        setShowConfirmModal(false);
        showToast(safeT('deleteAllSuccess') || 'All transactions deleted successfully');
      } else {
        showToast(safeT('deleteError') || 'Failed to delete transactions', 'error');
      }
    } catch {
      showToast(safeT('networkError') || 'Network error', 'error');
    }
  };

  const stats = useMemo(() => {
    let income = 0, expense = 0, debt = 0, currentBalance = 0;
    transactions.forEach((tx) => {
      const amt = parseFloat(tx.amount);
      if (tx.type === 'income')         income         += amt;
      if (tx.type === 'expense')        expense        += amt;
      if (tx.type === 'debt')           debt           += amt;
      if (tx.type === 'CurrentBalance') currentBalance += amt;
    });
    return {
      income, expense, debt, currentBalance,
      balance: income - expense,
      percent: income > 0 ? Math.min((expense / income) * 100, 100) : 0,
    };
  }, [transactions]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showConfirmModal && (
        <DeleteConfirmModal
          onConfirm={handleDeleteAll}
          onCancel={() => setShowConfirmModal(false)}
          t={safeT}
        />
      )}

      <header className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/20">
          <PieChart className="w-8 h-8 text-white" />
        </div>
        <div>
          <div className="text-blue-600 dark:text-blue-400 font-bold mb-1 flex items-center gap-2">
            {safeT('welcome')} {user?.username}{' '}
            <span className="text-xl animate-wave inline-block origin-bottom-right">👋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{safeT('appTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{safeT('appDesc')}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={safeT('balance')}      val={stats.balance}  icon={<Wallet />}          color="blue"   cur={safeT('currency')} />
        <StatCard title={safeT('totalIncome')}  val={stats.income}   icon={<ArrowDownToLine />} color="green"  cur={safeT('currency')} />
        <StatCard title={safeT('totalExpense')} val={stats.expense}  icon={<ArrowUpFromLine />} color="red"    cur={safeT('currency')} />
        <StatCard title={safeT('totalDebt')}    val={stats.debt}     icon={<AlertCircle />}     color="orange" cur={safeT('currency')} />
      </div>

      <UsageBar percent={stats.percent} t={safeT} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <TransactionForm 
            t={safeT} 
            onAdd={handleAdd} 
            onUpdate={handleUpdate} 
            editingTx={editingTx} 
            setEditingTx={setEditingTx} 
          />
        </div>
        <div className="lg:col-span-2">
          {loadingTx ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400 dark:text-gray-600">
              <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm">{safeT('loading') || 'Loading...'}</span>
            </div>
          ) : (
            <TransactionsTable
              transactions={transactions}
              onEdit={setEditingTx} 
              onDelete={handleDelete}
              onDeleteAll={() => setShowConfirmModal(true)}
              t={safeT}
              lang={lang}
            />
          )}
        </div>
      </div>

    </div>
  );
}