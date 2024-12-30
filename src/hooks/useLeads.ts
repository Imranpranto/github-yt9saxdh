import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Lead, Audience, LeadLimit } from '../types/leads';
import { toast } from '../utils/toast';
import React from 'react';
import type { Database } from '../types/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];
type DBLead = Tables['leads']['Row'];
type DBAudience = Tables['audiences']['Row'];
type AudienceWithLeads = DBAudience & { leads?: DBLead[] };

type AudienceInsert = Tables['audiences']['Insert'];
type LeadInsert = Tables['leads']['Insert'];

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [leadLimit, setLeadLimit] = useState<LeadLimit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Implement optimistic updates cache
  const leadsCache = React.useRef<Map<string, Lead>>(new Map());
  const audiencesCache = React.useRef<Map<string, Audience>>(new Map());

  const fetchLeadLimit = async () => {
    if (!user) return null;
    
    const LEAD_LIMITS = {
      Trial: 3000,
      Starter: 5000,
      Explorer: 10000,
      Pro: 15000
    };
    
    try {
      const { data, error } = await supabase
        .from('credits_calculation_and_profiles')
        .select('plan')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (!data?.plan) throw new Error('Unable to fetch user profile');

      const plan = data.plan as keyof typeof LEAD_LIMITS;
      const maxLeads = LEAD_LIMITS[plan] || LEAD_LIMITS.Trial;

      // Get current lead count
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      const usedLeads = count || 0;

      return {
        plan,
        used: usedLeads,
        total: maxLeads,
        remaining: maxLeads - usedLeads
      };
    } catch (error) {
      console.error('Error fetching lead limit:', error);
      return null;
    }
  };

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const abortController = new AbortController();
    let channels: ReturnType<typeof supabase.channel>[] = [];

    // Parallel data fetching with retry logic
    const fetchData = async () => {
      const maxRetries = 3;
      const retryDelay = 1000;
      let attempts = maxRetries;

      while (attempts > 0) {
        try {
          const [_, audiencesResponse, leadsResponse] = await Promise.all([
            supabase
              .from('credits_calculation_and_profiles')
              .select('plan')
              .eq('id', user?.id)
              .single(),
            
            supabase
              .from('audiences')
              .select(`
                id,
                name,
                description,
                created_at,
                leads (
                  id,
                  full_name,
                  profile_url,
                  headline,
                  source_operation,
                  created_at
                )
              `)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .abortSignal(abortController.signal),

            supabase
              .from('leads')
              .select(`
                id,
                audience_id,
                full_name,
                profile_url,
                headline,
                source_operation,
                created_at
              `)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .abortSignal(abortController.signal)
          ]);

          if (!mounted) return;

          // Process and cache the data
          if (audiencesResponse.data && Array.isArray(audiencesResponse.data)) {
            const processedAudiences = audiencesResponse.data.map((audience: AudienceWithLeads) => ({
              id: audience.id,
              name: audience.name,
              description: audience.description || undefined,
              createdAt: audience.created_at,
              leads: (audience.leads || []).map(lead => ({
                id: lead.id,
                audienceId: lead.audience_id,
                fullName: lead.full_name,
                profileUrl: lead.profile_url,
                headline: lead.headline || undefined,
                sourceOperation: lead.source_operation,
                createdAt: lead.created_at
              })),
              totalLeads: (audience.leads || []).length
            }));

            setAudiences(processedAudiences);
            processedAudiences.forEach(audience => {
              audiencesCache.current.set(audience.id, audience);
            });
          }

          if (leadsResponse.data && Array.isArray(leadsResponse.data)) {
            const processedLeads = leadsResponse.data.map(lead => ({
              id: lead.id,
              audienceId: lead.audience_id,
              fullName: lead.full_name,
              profileUrl: lead.profile_url,
              headline: lead.headline || undefined,
              sourceOperation: lead.source_operation,
              createdAt: lead.created_at
            }));

            setLeads(processedLeads);
            processedLeads.forEach(lead => {
              leadsCache.current.set(lead.id, lead);
            });
          }

          setLoading(false);
          setError(null);
          break;
        } catch (error) {
          attempts--;
          if (attempts === 0) {
            if (mounted) {
              console.error('Failed to fetch leads data:', error);
              setError('Failed to load leads data. Please try again.');
              setLoading(false);
            }
          } else {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
    };

    fetchData();

    // Set up realtime subscriptions
    const setupRealtimeSubscriptions = async () => {
      try {
        // Audience changes channel
        const audiencesChannel = supabase.channel('audiences_changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'audiences',
            filter: `user_id=eq.${user.id}`
          }, (payload: RealtimePostgresChangesPayload<DBAudience>) => {
            if (!mounted) return;
            console.log('Audience change:', payload);
            handleAudienceChange(payload);
          });

        // Leads changes channel  
        const leadsChannel = supabase.channel('leads_changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'leads',
            filter: `user_id=eq.${user.id}`
          }, (payload: RealtimePostgresChangesPayload<DBLead>) => {
            if (!mounted) return;
            console.log('Lead change:', payload);
            handleLeadChange(payload);
          });

        // Subscribe to channels
        await Promise.all([
          audiencesChannel.subscribe(),
          leadsChannel.subscribe()
        ]);

        channels = [audiencesChannel, leadsChannel];
      } catch (error) {
        console.error('Error setting up realtime subscriptions:', error);
        toast.error('Failed to set up realtime updates');
      }
    };

    setupRealtimeSubscriptions();

    return () => {
      mounted = false;
      abortController.abort();
      channels.forEach(channel => {
        if (channel) channel.unsubscribe();
      });
    };
  }, [user?.id]);

  // Optimistic update handlers
  const handleAudienceChange = (payload: RealtimePostgresChangesPayload<DBAudience>) => {
    if (!payload) return;

    const mapDBAudienceToAudience = (dbAudience: AudienceWithLeads): Audience => ({
      id: dbAudience.id,
      name: dbAudience.name,
      description: dbAudience.description || undefined,
      createdAt: dbAudience.created_at,
      leads: (dbAudience.leads || []).map(lead => ({
        id: lead.id,
        audienceId: lead.audience_id,
        fullName: lead.full_name,
        profileUrl: lead.profile_url,
        headline: lead.headline || undefined,
        sourceOperation: lead.source_operation,
        createdAt: lead.created_at
      })),
      totalLeads: (dbAudience.leads || []).length
    });

    if (payload.eventType === 'INSERT' && payload.new) {
      console.log('Handling audience insert:', payload.new);
      const newAudience = mapDBAudienceToAudience({
        ...payload.new,
        leads: []
      });
      setAudiences(prev => [newAudience, ...prev]);
      audiencesCache.current.set(newAudience.id, newAudience);
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      console.log('Handling audience update:', payload.new);
      const updatedAudience = mapDBAudienceToAudience(payload.new);
      setAudiences(prev => prev.map(a => a.id === updatedAudience.id ? updatedAudience : a));
      audiencesCache.current.set(updatedAudience.id, updatedAudience);
    } else if (payload.eventType === 'DELETE' && payload.old) {
      console.log('Handling audience delete:', payload.old);
      setAudiences(prev => prev.filter(a => a.id !== payload.old?.id));
      audiencesCache.current.delete(payload.old.id);
    }
  };

  const handleLeadChange = (payload: RealtimePostgresChangesPayload<DBLead>) => {
    if (!payload) return;

    const mapDBLeadToLead = (dbLead: DBLead): Lead => ({
      id: dbLead.id,
      audienceId: dbLead.audience_id,
      fullName: dbLead.full_name,
      profileUrl: dbLead.profile_url,
      headline: dbLead.headline || undefined,
      sourceOperation: dbLead.source_operation,
      createdAt: dbLead.created_at
    });

    if (payload.eventType === 'INSERT' && payload.new) {
      console.log('Handling lead insert:', payload.new);
      const newLead = mapDBLeadToLead(payload.new);
      setLeads(prev => [newLead, ...prev]);
      leadsCache.current.set(newLead.id, newLead);
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      console.log('Handling lead update:', payload.new);
      const updatedLead = mapDBLeadToLead(payload.new);
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      leadsCache.current.set(updatedLead.id, updatedLead);
    } else if (payload.eventType === 'DELETE' && payload.old) {
      console.log('Handling lead delete:', payload.old);
      setLeads(prev => prev.filter(l => l.id !== payload.old?.id));
      leadsCache.current.delete(payload.old.id);
    }
  };

  // Fetch all lead data
  const fetchLeadData = async () => {
    if (!user) return;
    
    setError(null);
    setLoading(true);
    
    try {
      // Get user's plan and current lead count
      const limit = await fetchLeadLimit();
      if (limit) {
        setLeadLimit(limit);
      }

      // Fetch audiences with lead counts in a single query
      const { data: audienceData, error: audienceError } = await supabase
        .from('audiences')
        .select(`
          id,
          name,
          description,
          created_at,
          leads (
            id,
            full_name,
            profile_url,
            headline,
            source_operation,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (audienceError) throw audienceError;

      if (audienceData && Array.isArray(audienceData)) {
        const processedAudiences = audienceData.map((audience: AudienceWithLeads) => ({
          id: audience.id,
          name: audience.name,
          description: audience.description || undefined,
          createdAt: audience.created_at,
          leads: (audience.leads || []).map(lead => ({
            id: lead.id,
            audienceId: lead.audience_id,
            fullName: lead.full_name,
            profileUrl: lead.profile_url,
            headline: lead.headline || undefined,
            sourceOperation: lead.source_operation,
            createdAt: lead.created_at
          })),
          totalLeads: (audience.leads || []).length
        }));
        setAudiences(processedAudiences);
      }

      // Fetch all leads in a single query
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          id,
          audience_id,
          full_name,
          profile_url,
          headline,
          source_operation,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      if (leadsData && Array.isArray(leadsData)) {
        const processedLeads = leadsData.map(lead => ({
          id: lead.id,
          audienceId: lead.audience_id,
          fullName: lead.full_name,
          profileUrl: lead.profile_url,
          headline: lead.headline || undefined,
          sourceOperation: lead.source_operation,
          createdAt: lead.created_at
        }));
        setLeads(processedLeads);
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load lead data';
      setError(message);
      toast.error('Failed to load lead data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createAudience = async (name: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Validate inputs
      if (!name.trim()) {
        throw new Error('Audience name is required');
      }

      if (name.length > 100) {
        throw new Error('Audience name must be less than 100 characters');
      }

      const { data, error } = await supabase
        .from('audiences')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description?.trim() || null
        } satisfies Omit<AudienceInsert, 'id' | 'created_at'>)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('An audience with this name already exists');
        }
        throw error;
      }

      // No need to update state manually - subscription will handle it
      toast.success('Audience created successfully');
      return data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create audience');
      throw error;
    }
  };

  const addLeadsToAudience = async (audienceId: string, newLeads: Partial<Lead>[]) => {
    if (!user) {
      toast.error('Please sign in to save leads');
      return;
    }

    try {
      // Insert leads with proper validation
      const { error } = await supabase
        .from('leads')
        .insert(
          newLeads.map(lead => ({
            audience_id: audienceId,
            user_id: user.id,
            full_name: lead.fullName || '',
            profile_url: lead.profileUrl || '',
            headline: lead.headline || null,
            source_operation: lead.sourceOperation || ''
          } satisfies Omit<LeadInsert, 'id' | 'created_at'>))
        );

      if (error) {
        throw error;
      }

      // No need to fetch manually - subscription will handle it
      toast.success('Leads added successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add leads');
    }
  };

  const deleteAudience = async (id: string) => {
    const { error } = await supabase
      .from('audiences')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // No need to update state manually - subscription will handle it
    toast.success('Audience deleted successfully');
  };

  return {
    leads,
    audiences,
    leadLimit,
    error,
    loading,
    createAudience,
    deleteAudience,
    addLeadsToAudience,
    refreshLeads: fetchLeadData
  };
}
