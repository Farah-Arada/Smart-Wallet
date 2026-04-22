import React from 'react';

const colorMap = {
  blue:   'bg-blue-100   dark:bg-blue-900/40   text-blue-600   dark:text-blue-400',
  green:  'bg-green-100  dark:bg-green-900/40  text-green-600  dark:text-green-400',
  red:    'bg-red-100    dark:bg-red-900/40    text-red-600    dark:text-red-400',
  orange: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
};

const textColorMap = {
  blue:   'text-blue-600   dark:text-blue-400',
  green:  'text-green-600  dark:text-green-400',
  red:    'text-red-600    dark:text-red-400',
  orange: 'text-orange-600 dark:text-orange-400',
};

export default function StatCard({ title, val, icon, color, cur }) {
  const formatted = typeof val === 'number'
    ? val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : val;

  const isNegative = typeof val === 'number' && val < 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">{title}</h3>
        <div className={`p-3 rounded-full ${colorMap[color]}`}>
          {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
      </div>
      <p className={`text-3xl font-bold transition-colors ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
        {formatted}{' '}
        <span className="text-base text-gray-500 dark:text-gray-400 font-normal">{cur}</span>
      </p>
    </div>
  );
}
