import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { toast } from '../utils/toast';

// Cache duration in milliseconds (5 seconds)
const CACHE_DURATION = 5000;
const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;

// In-memory cache
const statsCache = new Map<string, {
  data: CreditStats;
  timestamp: number;
}>();

interface CreditCalculation {
  plan: string;
  total_credits: number;
  used_credits: number;
  credits_left: number;
  subscription_start_at: string | null;
  subscription_end_at: string | null;
  trial_ends_at: string | null;
}

interface CreditStats {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  plan: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  loading: boolean;
  error: string | null;
}

export function useCreditsStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreditStats>({
    totalCredits: 0,
    usedCredits: 0,
    remainingCredits: 0,
    plan: 'Trial',
    trialEndsAt: null,
    subscriptionEndsAt: null,
    loading: true,
    error: null
  });

  const fetchCreditStats = async (signal?: AbortSignal, retries = MAX_RETRIES): Promise<CreditCalculation> => {
    // Check cache first
    if (user?.id) {
      const cached = statsCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as CreditCalculation;
      }
    }

    try {
      const { data, error } = await supabase
        .from('credits_calculation_and_profiles')
        .select(`
          plan,
          total_credits,
          used_credits,
          credits_left,
          subscription_start_at,
          subscription_end_at,
          trial_ends_at
        `)
        .eq('id', user.id)
        .abortSignal(signal)
        .single();

      if (error) throw error;
      
      // Cache the result
      if (user?.id) {
        statsCache.set(user.id, {
          data,
          timestamp: Date.now()
        });
      }
      
      return data;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchCreditStats(signal, retries - 1);
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!user) return;

    const abortController = new AbortController();
    let mounted = true;

    const fetchStats = async () => {
      try {
        const stats = await fetchCreditStats(abortController.signal);
        
        // Clear cache on error
        if (user?.id) {
          statsCache.delete(user.id);
        }

        if (!mounted) return;

        if (!stats) {
          throw new Error('No credit data found');
        }

        setStats({
          totalCredits: stats.total_credits || 250,
          usedCredits: stats.used_credits,
          remainingCredits: stats.credits_left,
          plan: stats.plan,
          trialEndsAt: stats.trial_ends_at,
          subscriptionEndsAt: stats.subscription_end_at,
          loading: false,
          error: null
        });
      } catch (error: any) {
        if (!mounted) return;
        
        const errorMessage = error.code === 'PGRST116' 
          ? 'Profile not found. Please try logging in again.'
          : error.message || 'Failed to load credit stats';

        console.error('Error fetching credit stats:', errorMessage);
        
        // Set default values on error
        setStats({
          totalCredits: 250,
          usedCredits: 0,
          remainingCredits: 250,
          plan: 'Trial',
          trialEndsAt: null,
          subscriptionEndsAt: null,
          loading: false,
          error: errorMessage
        });
      }
    };

    fetchStats();

    // Set up realtime subscriptions for both tables
    const channels = [
      supabase.channel('credits_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'credits_calculation_and_profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          console.log('Credits calculation changed, refreshing...');
          // Clear cache on update
          if (user?.id) {
            statsCache.delete(user.id);
          }
          fetchStats().catch(console.error);
        })
    ];

    // Subscribe to all channels
    Promise.all(channels.map(channel => channel.subscribe()))
      .catch(error => {
        console.error('Error subscribing to realtime changes:', error);
        toast.error('Failed to subscribe to realtime updates');
      });

    return () => {
      mounted = false;
      abortController.abort();
      channels.forEach(channel => channel.unsubscribe());
    };
  }, [user]);

  return stats;
}