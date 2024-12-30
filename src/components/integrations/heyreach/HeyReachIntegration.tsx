import React from 'react';
import { useHeyReach } from '../../../hooks/useHeyReach';
import ApiKeyManager from './ApiKeyManager';
import LeadListsDashboard from './LeadListsDashboard';

interface HeyReachIntegrationProps {
  view: string;
}

export default function HeyReachIntegration({ view }: HeyReachIntegrationProps) {
  const { connected } = useHeyReach();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/logos/heyreach-logo.png"
            alt="HeyReach"
            className="w-8 h-8"
          />
          <div>
            <h3 className="font-medium text-gray-900">HeyReach</h3>
            <p className="text-sm text-gray-500">Manage your HeyReach campaigns</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <ApiKeyManager />
        {connected && view === 'lists' && <LeadListsDashboard />}
      </div>
    </div>
  );
}
