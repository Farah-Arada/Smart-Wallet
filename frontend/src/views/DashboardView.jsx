import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, AlertCircle, PieChart
} from 'lucide-react';

import API from '../utils/api';

import StatCard           from './components/StatCard';
import UsageBar           from './components/UsageBar';
import DeleteConfirmModal from './components/DeleteConfirModal';
import TransactionForm    from './components/TransactionForm';
import TransactionsTable  from './components/TransactionsTable';

import { CheckCircle, XCircle } from 'lucide-react';

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

const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

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
        method:  'PUT',
        headers: authHeader(),
        body:    JSON.stringify(updatedTx),
      });
      const data = await res.json();
      if (res.ok) {
        const modified = {
          ...data.transaction,
          id:   data.transaction._id,
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
    let income = 0, expense = 0, debt = 0;
    transactions.forEach((tx) => {
      const amt = parseFloat(tx.amount);
      if (tx.type === 'income')  income  += amt;
      if (tx.type === 'expense') expense += amt;
      if (tx.type === 'debt')    debt    += amt;
    });
    return {
      income, expense, debt,
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