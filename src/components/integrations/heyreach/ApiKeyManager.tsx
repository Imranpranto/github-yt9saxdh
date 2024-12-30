import React, { useState } from 'react';
import { Key, Plus, Check, AlertCircle } from 'lucide-react';
import { useHeyReach } from '../../../hooks/useHeyReach';
import ApiKeyForm from './ApiKeyForm';

export default function ApiKeyManager() {
  const { apiKeys, loading, error, deleteApiKey } = useHeyReach();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">API Keys</h4>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add API Key
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {apiKeys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Key className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{key.name}</p>
                <p className="text-sm text-gray-500">{key.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                <Check className="h-4 w-4" />
                Connected
              </span>
              <button
                onClick={() => deleteApiKey(key.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ApiKeyForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}