export default function UsageBar({ percent, t }) {
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

      {hasIncome ? (
        <>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-700 ease-out ${
                percent > 85 ? 'bg-red-500' : percent > 60 ? 'bg-orange-400' : 'bg-green-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          {percent > 85 && (
            <p className="text-xs text-red-500 font-medium mt-2">
              ⚠️ {t('highSpending') || 'too much spending! Consider reviewing your expenses.'}
            </p>
          )}
        </>
      ) : (
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden flex items-center justify-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t('noIncomeYet') || 'add some income transactions to see your consumption level'}
          </p>
        </div>
      )}
    </div>
  );
}
