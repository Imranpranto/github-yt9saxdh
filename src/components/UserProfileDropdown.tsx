import React, { useEffect, useState } from 'react';
import { LogOut, Settings, CreditCard, User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function UserProfileDropdown() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [displayName, setDisplayName] = useState('');
  const [plan, setPlan] = useState('Trial');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;

      try {
        // First try to fetch existing profile
        let { data, error } = await supabase
          .from('credits_calculation_and_profiles')
          .select('display_name, plan, email')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setDisplayName(data.display_name || user.email?.split('@')[0] || '');
          setPlan(data.plan);
        } else {
          setDisplayName(user.email?.split('@')[0] || '');
          setPlan('Trial');
        }
      } catch (error) {
        console.error('Error fetching display name:', error);
        setDisplayName(user.email?.split('@')[0] || '');
        setPlan('Trial');
      }
    }

    fetchUserProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'credits_calculation_and_profiles',
        filter: `id=eq.${user?.id}`
      }, () => {
        fetchUserProfile();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="hidden md:block text-right">
            <div className="text-sm font-medium text-gray-700">
              {displayName || user.email?.split('@')[0]}
            </div>
            <div className="text-xs text-gray-500">{plan}</div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">{displayName || user.email?.split('@')[0]}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
            <div className="text-xs text-gray-500 mt-0.5">{plan}</div>
          </div>

          <div className="py-2">
            <Link
              to="/my-subscription"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span>My Subscription</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}