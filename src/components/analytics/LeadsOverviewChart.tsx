import React from 'react';
import { useLeads } from '../../hooks/useLeads';

export default function LeadsOverviewChart() {
  const { leads } = useLeads();
  
  // Group leads by source operation
  const leadsBySource = leads.reduce((acc, lead) => {
    const source = lead.sourceOperation;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sources = Object.entries(leadsBySource).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      {sources.map(([source, count]) => (
        <div key={source}>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-600 capitalize">
              {source.replace(/_/g, ' ')}
            </span>
            <span className="text-sm font-medium text-gray-900">{count}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(count / leads.length) * 100}%` }}
            />
          </div>
        </div>
      ))}
      
      {sources.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No leads data available yet
        </div>
      )}
    </div>
  );
}