import React from 'react';
import { useCreditsStats } from '../../hooks/useCreditsStats';

export default function CreditUsageChart() {
  const { totalCredits, usedCredits } = useCreditsStats();
  const percentage = Math.round((usedCredits / totalCredits) * 100);

  return (
    <div className="relative pt-1">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
            Usage
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block text-indigo-600">
            {percentage}%
          </span>
        </div>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
        <div
          style={{ width: `${percentage}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>{usedCredits.toLocaleString()} used</span>
        <span>{totalCredits.toLocaleString()} total</span>
      </div>
    </div>
  );
}