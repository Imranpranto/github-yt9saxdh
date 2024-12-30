import React from 'react';
import { Settings, Send, AlertCircle } from 'lucide-react';
import type { WebhookConfig, WebhookDelivery } from '../types/webhook';

interface WebhookConfigProps {
  config: WebhookConfig;
  onConfigChange: (config: WebhookConfig) => void;
  onTest: () => Promise<void>;
  deliveries: WebhookDelivery[];
}

export default function WebhookConfig({ config, onConfigChange, onTest, deliveries }: WebhookConfigProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testError, setTestError] = React.useState<string>();

  const handleTest = async () => {
    setIsTesting(true);
    setTestError(undefined);
    try {
      await onTest();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setTestError(message);
    } finally {
      setIsTesting(false);
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Update headers when method changes
  const handleMethodChange = (method: 'GET' | 'POST' | 'PUT') => {
    const headers = { ...config.headers };
    
    // Remove Content-Type for GET requests
    if (method === 'GET') {
      delete headers['Content-Type'];
      headers['Accept'] = 'application/json';
    } else {
      headers['Content-Type'] = 'application/json';
    }

    onConfigChange({ 
      ...config, 
      method,
      headers
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Settings className="h-4 w-4" />
        Webhook Config
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={config.url}
                onChange={(e) => onConfigChange({ ...config, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://your-webhook.com/endpoint"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method
                </label>
                <select
                  value={config.method}
                  onChange={(e) => handleMethodChange(e.target.value as 'GET' | 'POST' | 'PUT')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authentication
                </label>
                <select
                  value={config.authType}
                  onChange={(e) => onConfigChange({ ...config, authType: e.target.value as 'none' | 'basic' | 'bearer' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="none">None</option>
                  <option value="basic">Basic Auth</option>
                  <option value="bearer">Bearer Token</option>
                </select>
              </div>
            </div>

            {config.authType !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {config.authType === 'basic' ? 'Basic Auth Credentials' : 'Bearer Token'}
                </label>
                <input
                  type="password"
                  value={config.authValue || ''}
                  onChange={(e) => onConfigChange({ ...config, authValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={config.authType === 'basic' ? 'username:password' : 'Bearer token'}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Headers
              </label>
              <textarea
                value={Object.entries(config.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
                onChange={(e) => {
                  const headers = Object.fromEntries(
                    e.target.value.split('\n')
                      .map(line => line.split(':').map(s => s.trim()))
                      .filter(([k, v]) => k && v)
                  );
                  onConfigChange({ ...config, headers });
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Accept: application/json"
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500">
                {config.method === 'GET' ? 
                  'For GET requests, data will be sent as query parameters' :
                  'For POST/PUT requests, data will be sent in the request body'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retry Attempts
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={config.retryAttempts}
                  onChange={(e) => onConfigChange({ ...config, retryAttempts: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retry Delay (ms)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={config.retryDelay}
                  onChange={(e) => onConfigChange({ ...config, retryDelay: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={handleTest}
                disabled={!validateUrl(config.url) || isTesting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {isTesting ? 'Testing...' : 'Test Webhook'}
              </button>

              {testError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {testError}
                </div>
              )}
            </div>

            {deliveries.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Deliveries</h4>
                <div className="space-y-2">
                  {deliveries.slice(0, 3).map((delivery) => (
                    <div
                      key={delivery.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-500">
                        {new Date(delivery.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        delivery.status === 'success' 
                          ? 'bg-green-50 text-green-600'
                          : delivery.status === 'retrying'
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {delivery.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}