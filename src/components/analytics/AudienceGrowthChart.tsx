import React from 'react';
import { useLeads } from '../../hooks/useLeads';

export default function AudienceGrowthChart() {
  const { audiences } = useLeads();

  return (
    <div className="space-y-6">
      {audiences.map(audience => (
        <div key={audience.id}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{audience.name}</h3>
              <p className="text-xs text-gray-500">{audience.description || 'No description'}</p>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {audience.leads.length} leads
            </span>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${(audience.leads.length / 100) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      ))}

      {audiences.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No audiences created yet
        </div>
      )}
    </div>
  );
}