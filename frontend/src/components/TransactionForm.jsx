import { useState, useEffect } from 'react';
import { PlusCircle, MapPin, Landmark, User, Pencil, X } from 'lucide-react';

export default function TransactionForm({ 
  t = (k) => String(k), 
  onAdd = () => {}, 
  onUpdate = () => {}, 
  editingTx = null, 
  setEditingTx = () => {} 
}) {
  

  const safeT = (key) => {
    try {
      const val = typeof t === 'function' ? t(key) : key;
      return (typeof val === 'object' && val !== null) ? String(key) : val;
    } catch (e) {
      return String(key);
    }
  };

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
    if (formData.type === 'income')
      return { title: safeT('income'), loc: safeT('locIncome'), icon: <Landmark className="w-5 h-5" /> };
    if (formData.type === 'debt')
      return { title: safeT('debt'), loc: safeT('locDebt'), icon: <User className="w-5 h-5" /> };
    return { title: safeT('expense'), loc: safeT('locExpense'), icon: <MapPin className="w-5 h-5" /> };
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
          {editingTx ? safeT('editTransaction') || 'Edit Transaction' : safeT('newTransaction')}
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
                    type === 'expense'
                      ? 'text-red-600 dark:text-red-400'
                      : type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {safeT(type)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{safeT('amount')}</label>
          <div className="relative">
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pe-12 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
            />
            <span className="absolute end-4 top-3.5 text-gray-500 font-medium">{safeT('currency')}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{safeT('date')}</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{safeT('details')}</label>
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
              className="w-full ps-10 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
            />
            <span className="absolute start-3 top-3.5 text-gray-400">{labels.icon}</span>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full text-white font-bold py-3.5 rounded-xl shadow-sm flex justify-center items-center gap-2 ${editingTx ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {editingTx ? (safeT('updateBtn') || 'Update') : safeT('addBtn')} {labels.title}
        </button>
      </form>
    </div>
  );
}