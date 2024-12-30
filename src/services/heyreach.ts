import { ApiKey, LeadsList } from '../types/heyreach';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_HEYREACH_API_URL;
const CACHE_KEY = 'heyreach_lists_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

type HeyReachApiKey = Database['public']['Tables']['heyreach_api_keys']['Row'];

export async function validateApiKey(apiKey: string, name: string): Promise<{ isValid: boolean; message: string }> {
  try {
    const response = await axios.get(`${API_URL}/auth/CheckApiKey`, {
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'text/plain'
      }
    });

    if (response.status === 200) {
      // Save API key to Supabase if validation successful
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      const insertData: Database['public']['Tables']['heyreach_api_keys']['Insert'][] = [{
        user_id: userData.user.id,
        name,
        api_key: apiKey
      }];

      const { error } = await supabase
        .from('heyreach_api_keys')
        .insert(insertData);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { 
            isValid: true, 
            message: 'API key is valid but a key with this name already exists. Please use a different name.' 
          };
        }
        throw error;
      }

      return { isValid: true, message: 'API key is valid and has been saved successfully.' };
    } else {
      return { isValid: false, message: 'Invalid API key. Please check your credentials.' };
    }
  } catch (error) {
    console.error('Error validating HeyReach API key:', error);
    throw new Error('Failed to validate API key. Please try again later.');
  }
}

function getCachedLists(): CacheData | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

function setCachedLists(lists: LeadsList[]) {
  const cacheData: CacheData = {
    timestamp: Date.now(),
    data: lists
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
}

function isCacheValid(cache: CacheData): boolean {
  return Date.now() - cache.timestamp < CACHE_DURATION;
}

interface CacheData {
  timestamp: number;
  data: LeadsList[];
}

export async function fetchLeadLists(apiKey: string, forceRefresh = false): Promise<LeadsList[]> {
  try {
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cache = getCachedLists();
      if (cache && isCacheValid(cache)) {
        return cache.data;
      }
    }

    const requestBody = {
      offset: 0,
      keyword: "",
      listType: null,
      campaignIds: [],
      limit: 100
    };

    const response = await axios.post<{ items: LeadsList[] }>(`${API_URL}/list/GetAll`, requestBody, {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'text/plain'
      }
    });

    const lists = response.data.items || [];
    
    // Cache the results
    setCachedLists(lists);
    
    return lists;
  } catch (error) {
    console.error('Error fetching HeyReach lists:', error);
    // Try to return cached data if available, even if expired
    const cache = getCachedLists();
    if (cache) {
      console.log('Returning cached data due to API error');
      return cache.data;
    }
    throw error;
  }
}

export async function getUserApiKeys(): Promise<ApiKey[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('heyreach_api_keys')
    .select('*')
    .eq('user_id', userData.user.id)
    .returns<HeyReachApiKey[]>();

  if (error) {
    throw error;
  }

  return (data || []).map(key => ({
    id: key.id,
    userId: key.user_id,
    name: key.name,
    apiKey: key.api_key,
    description: key.description || undefined,
    created_at: key.created_at,
    updated_at: key.updated_at
  }));
}
