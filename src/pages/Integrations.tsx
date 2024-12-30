import React from 'react';
import { useState, useEffect } from 'react';
import { Save, Plus } from 'lucide-react';
import IntegrationTabs from '../components/integrations/IntegrationTabs';
import IntegrationSidebar from '../components/integrations/IntegrationSidebar';
import WebhookCard from '../components/sidebar/WebhookCard';
import HeyReachIntegration from '../components/integrations/heyreach/HeyReachIntegration';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../utils/toast';

const SIDEBAR_ITEMS = {
  webhook: [
    { id: 'saved', label: 'Saved Webhooks', icon: Save },
    { id: 'new', label: 'New Webhook', icon: Plus }
  ],
  heyreach: [
    { id: 'api-keys', label: 'API Keys', icon: Save },
    { id: 'lists', label: 'Lead Lists', icon: Plus }
  ]
};

export default function Integrations() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('webhook');
  const [activeSidebarItem, setActiveSidebarItem] = useState('saved');

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access integrations');
      return;
    }
  }, [user]);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Integrations</h1>
          <p className="text-gray-500">Manage your external integrations and webhooks</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <IntegrationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="flex">
            <IntegrationSidebar
              items={SIDEBAR_ITEMS[activeTab]}
              activeItem={activeSidebarItem}
              onItemSelect={setActiveSidebarItem}
            />

            <div className="flex-1 p-6">
              {activeTab === 'webhook' && (
                <WebhookCard view={activeSidebarItem} />
              )}
              {activeTab === 'heyreach' && (
                <HeyReachIntegration view={activeSidebarItem} />
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-gray-50 rounded-xl text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Need More Integrations?</h3>
          <p className="text-gray-600">We're constantly adding new integration options.</p>
          <p className="text-gray-600">Contact support to request specific integrations for your needs.</p>
        </div>
      </div>
    </div>
  );
}