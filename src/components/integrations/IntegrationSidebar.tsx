import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

interface IntegrationSidebarProps {
  items?: SidebarItem[];
  activeItem: string;
  onItemSelect: (id: string) => void;
}

export default function IntegrationSidebar({ items, activeItem, onItemSelect }: IntegrationSidebarProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="w-64 border-r border-gray-100 bg-gray-50">
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && onItemSelect(item.id)}
            disabled={item.disabled}
            className={`
              w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${activeItem === item.id
                ? 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
            {item.disabled && (
              <span className="ml-auto text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                Soon
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}