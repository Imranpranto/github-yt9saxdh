import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useHeyReach } from '../../../hooks/useHeyReach';
import ListsTable from './ListsTable';

export default function LeadListsDashboard() {
  const { lists, loading, lastUpdated, refreshLists } = useHeyReach();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Lead Lists</h4>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refreshLists}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <ListsTable
        lists={lists}
        loading={loading}
      />
    </div>
  );
}