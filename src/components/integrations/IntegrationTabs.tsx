import React from 'react';
import { Cable, Webhook } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: typeof Cable;
  disabled?: boolean;
}

interface IntegrationTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { id: 'webhook', label: 'Webhook', icon: Webhook },
  { id: 'heyreach', label: 'HeyReach', icon: Cable, disabled: false }
];

export default function IntegrationTabs({ activeTab, onTabChange }: IntegrationTabsProps) {
  return (
    <div className="relative border-b border-gray-200">
      {/* Background line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100" />
      
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                group relative px-6 py-3 transition-all duration-200
                ${isActive 
                  ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
                {tab.disabled && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                    Soon
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}