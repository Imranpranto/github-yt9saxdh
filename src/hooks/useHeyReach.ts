import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { ApiKey, LeadsList } from '../types/heyreach';
import { toast } from '../utils/toast';
import { Database } from '../types/supabase';
import { fetchLeadLists } from '../services/heyreach';

type HeyReachApiKey = Database['public']['Tables']['heyreach_api_keys']['Row'];

export function useHeyReach() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [lists, setLists] = useState<LeadsList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchApiKeys = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('heyreach_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .returns<HeyReachApiKey[]>();

      if (error) throw error;

      // Map database response to ApiKey type
      const mappedKeys: ApiKey[] = (data || []).map(key => ({
        id: key.id,
        userId: key.user_id,
        name: key.name,
        apiKey: key.api_key,
        description: key.description || undefined,
        created_at: key.created_at,
        updated_at: key.updated_at
      }));

      setApiKeys(mappedKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch API keys');
    }
  }, [user]);

  const fetchLists = useCallback(async (forceRefresh = false) => {
    if (!user || apiKeys.length === 0) return;

    const validKey = apiKeys[0];
    if (!validKey?.apiKey) return;

    setLoading(true);
    try {
      const lists = await fetchLeadLists(validKey.apiKey, forceRefresh);
      setLists(lists);
      setLastUpdated(new Date());
      setError(null);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch lists');
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [user, apiKeys]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  useEffect(() => {
    if (apiKeys.length > 0) {
      // Initial fetch without force refresh to use cache if available
      fetchLists(false);
    }
  }, [apiKeys, fetchLists]);

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('heyreach_api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setApiKeys(prev => prev.filter(key => key.id !== id));
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const refreshLists = async () => {
    // Force refresh when manually triggered
    await fetchLists(true);
  };

  return {
    apiKeys,
    lists,
    loading,
    error,
    lastUpdated,
    connected: apiKeys.length > 0,
    deleteApiKey,
    refreshLists
  };
}
