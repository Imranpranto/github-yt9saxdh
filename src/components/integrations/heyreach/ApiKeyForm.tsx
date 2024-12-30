import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../utils/toast';

interface ApiKeyFormProps {
  onClose: () => void;
}

export default function ApiKeyForm({ onClose }: ApiKeyFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add API keys');
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    if (!formData.apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('heyreach_api_keys')
        .insert([{
          user_id: user.id,
          name: formData.name.trim(),
          api_key: formData.apiKey.trim(),
          description: formData.description?.trim(),
          created_at: new Date().toISOString()
        }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('An API key with this name already exists');
        }
        throw error;
      }

      toast.success('API key added successfully');
      onClose();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Add API Key</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              maxLength={50}
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter a name for this API key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="password"
              required
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your HeyReach API key"
            />
            <p className="mt-1 text-sm text-gray-500">
              Find your API key in{' '}
              <a 
                href="https://app.heyreach.io/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700"
              >
                HeyReach Settings → API Keys
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              maxLength={200}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Optional description for this API key"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add API Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}