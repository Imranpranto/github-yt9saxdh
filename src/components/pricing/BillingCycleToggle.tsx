import React from 'react';

interface BillingCycleToggleProps {
  cycle: 'monthly' | 'yearly';
  onChange: (cycle: 'monthly' | 'yearly') => void;
}

export default function BillingCycleToggle({ cycle, onChange }: BillingCycleToggleProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-100 p-1 rounded-xl inline-flex">
        <button
          onClick={() => onChange('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            cycle === 'monthly'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Monthly billing
        </button>
        <button
          onClick={() => onChange('yearly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            cycle === 'yearly'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Yearly billing
          <span className="ml-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            Save 10%
          </span>
        </button>
      </div>
    </div>
  );
}