import { useState, useCallback, useEffect } from 'react';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { WebhookConfig, WebhookDelivery } from '../types/webhook';
import type { Database } from '../types/supabase';
import { toast } from '../utils/toast';

type Tables = Database['public']['Tables'];
type DBWebhook = Tables['webhooks']['Row'];

const DEFAULT_CONFIG: WebhookConfig = {
  url: '',
  name: '',
  authType: 'none',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  },
  retryAttempts: 3,
  retryDelay: 1000
};

export function useWebhook() {
  const { user } = useAuth();
  const [config, setConfig] = useState<WebhookConfig>(DEFAULT_CONFIG);
  const [savedWebhooks, setSavedWebhooks] = useState<WebhookConfig[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);

  // Fetch saved webhooks on mount
  useEffect(() => {
    if (!user?.id) return;
    
    async function fetchWebhooks() {
      try {
        const { data, error } = await supabase
          .from('webhooks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data) return;

        const webhooks = data.map(webhook => ({
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          description: webhook.description ?? undefined,
          authType: webhook.auth_type,
          authValue: webhook.auth_value ?? undefined,
          method: webhook.method,
          headers: webhook.headers,
          retryAttempts: webhook.retry_attempts,
          retryDelay: webhook.retry_delay,
          createdAt: webhook.created_at,
          updatedAt: webhook.updated_at
        }));

        setSavedWebhooks(webhooks);
        if (webhooks.length > 0) {
          setSelectedWebhook(webhooks[0]);
        }
      } catch (error) {
        console.error('Error fetching webhooks:', error);
        toast.error('Failed to load saved webhooks');
      }
    }

    fetchWebhooks();
  }, [user?.id]);

  const selectWebhook = useCallback((webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setConfig(webhook);
  }, []);

  const updateConfig = useCallback(async (newConfig: WebhookConfig) => {
    if (!user?.id) {
      toast.error('Please sign in to save webhooks');
      return;
    }

    // Validate webhook name
    if (!newConfig.name?.trim()) {
      toast.error('Webhook name is required');
      return;
    }

    try {
      // Check for existing webhook with same name
      const { data: existingWebhook } = await supabase
        .from('webhooks')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', newConfig.name.trim())
        .single();

      if (existingWebhook && (!newConfig.id || existingWebhook.id !== newConfig.id)) {
        toast.error('A webhook with this name already exists. Please choose a different name.');
        return;
      }

      const now = new Date().toISOString();

      // If updating existing webhook, include the ID
      if (newConfig.id) {
        const { data: existing } = await supabase
          .from('webhooks')
          .select('id')
          .eq('id', newConfig.id)
          .single();

        if (existing) {
          // Update existing webhook
          const { data, error } = await supabase
            .from('webhooks')
            .update({
              name: newConfig.name.trim(),
              url: newConfig.url,
              description: newConfig.description ?? null,
              auth_type: newConfig.authType,
              auth_value: newConfig.authValue ?? null,
              method: newConfig.method,
              headers: newConfig.headers,
              retry_attempts: newConfig.retryAttempts,
              retry_delay: newConfig.retryDelay,
              updated_at: now
            })
            .eq('id', newConfig.id)
            .select()
            .single();

          if (error) throw error;
          if (!data) throw new Error('Failed to update webhook');
          return mapWebhookData(data);
        }
      }

      // Insert new webhook
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          user_id: user.id,
          name: newConfig.name.trim(),
          url: newConfig.url,
          description: newConfig.description ?? null,
          auth_type: newConfig.authType,
          auth_value: newConfig.authValue ?? null,
          method: newConfig.method,
          headers: newConfig.headers,
          retry_attempts: newConfig.retryAttempts,
          retry_delay: newConfig.retryDelay,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create webhook');
      
      const savedWebhook = mapWebhookData(data);

      setSavedWebhooks(prev => {
        // If webhook exists, update it, otherwise add new
        const exists = prev.some(w => w.id === savedWebhook.id);
        if (exists) {
          return prev.map(w => w.id === savedWebhook.id ? savedWebhook : w);
        }
        return [savedWebhook, ...prev];
      });
      setConfig({ ...savedWebhook });
      toast.success('Webhook saved successfully');
      return savedWebhook;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save webhook';
      console.error('Error saving webhook:', error);
      toast.error(message);
      throw error;
    }
  }, [user?.id]);

  // Helper function to map database webhook to WebhookConfig
  const mapWebhookData = (data: DBWebhook): WebhookConfig => ({
    id: data.id,
    name: data.name,
    url: data.url,
    description: data.description ?? undefined,
    authType: data.auth_type,
    authValue: data.auth_value ?? undefined,
    method: data.method,
    headers: data.headers,
    retryAttempts: data.retry_attempts,
    retryDelay: data.retry_delay,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  });

  // Add delivery to history
  const addDelivery = useCallback((delivery: WebhookDelivery) => {
    setDeliveries(prev => [delivery, ...prev].slice(0, 10));
  }, []);

  const sendWebhook = useCallback(async (data: Record<string, unknown>, webhookConfig: WebhookConfig) => {
    const delivery: WebhookDelivery = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      responseStatus: 0,
      message: 'Initiating webhook request'
    };
    addDelivery(delivery);

    try {
      if (!webhookConfig.url) {
        throw new Error('Webhook URL is required');
      }

      if (!data || (Array.isArray(data) && data.length === 0)) { 
        throw new Error('No data available to send');
      }

      // Validate URL format
      try {
        new URL(webhookConfig.url);
      } catch {
        throw new Error('Invalid webhook URL format');
      }

      let attempt = 0;
      while (attempt <= webhookConfig.retryAttempts) {
        try { 
          const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Origin': window.location.origin,
            ...webhookConfig.headers
          };

          // Add Content-Type for POST/PUT requests
          if (webhookConfig.method !== 'GET') {
            headers['Content-Type'] = 'application/json';
          }
          
          if (webhookConfig.authType === 'basic' && webhookConfig.authValue) {
            headers['Authorization'] = `Basic ${btoa(webhookConfig.authValue)}`;
          } else if (webhookConfig.authType === 'bearer' && webhookConfig.authValue) {
            headers['Authorization'] = `Bearer ${webhookConfig.authValue}`;
          }

          let url = webhookConfig.url;
          const requestOptions: RequestInit = {
            method: webhookConfig.method,
            headers,
            credentials: 'omit',
            mode: 'cors'
          };

          // For GET requests, append data as query parameters
          if (webhookConfig.method === 'GET' && data) {
            const params = new URLSearchParams();
            const flatData = Array.isArray(data) ? data[0] : data;
            
            // Flatten nested objects for query params
            const flattenObject = (obj: Record<string, unknown>, prefix = ''): void => {
              Object.entries(obj).forEach(([key, value]) => {
                const paramKey = prefix ? `${prefix}[${key}]` : key;
                
                if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                  flattenObject(value as Record<string, unknown>, paramKey);
                } else if (Array.isArray(value)) {
                  value.forEach((item, index) => {
                    if (item !== undefined && item !== null) {
                      params.append(`${paramKey}[${index}]`, String(item));
                    }
                  });
                } else if (value !== undefined && value !== null) {
                  params.append(paramKey, String(value));
                }
              });
            };

            flattenObject(flatData);
            url = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
          } else {
            // For POST/PUT requests, include body
            const payload = {
              data: Array.isArray(data) ? data : [data],
              source: 'LiEnrich',
              timestamp: new Date().toISOString()
            };
            requestOptions.body = JSON.stringify(payload);
          }

          const response = await fetch(url, requestOptions);
          const responseStatus = response.status;
          const responseText = await response.text();
          
          let responseData: unknown;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          if (responseStatus >= 200 && responseStatus < 300) {
            delivery.status = 'success';
            delivery.responseData = String(responseData);
            addDelivery({ ...delivery });
            return delivery;
          }

          throw new Error(`Request failed with status ${responseStatus}: ${responseText}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error occurred';
          const errorDetails = {
            message,
            type: error instanceof Error ? error.name : 'UnknownError',
            attempt: attempt + 1,
            timestamp: new Date().toISOString()
          };
          console.error('Webhook request error:', errorDetails);

          if (attempt === webhookConfig.retryAttempts) {
            const finalError = message === 'Failed to fetch' 
              ? 'Unable to reach endpoint. Please verify the URL and server accessibility.'
              : message;
              
            delivery.status = 'error';
            delivery.message = finalError;
            addDelivery({ ...delivery });
            throw new Error(finalError);
          }
          
          delivery.status = 'retrying'; 
          delivery.message = `Retrying... Attempt ${attempt + 1}/${webhookConfig.retryAttempts}`;
          addDelivery({ ...delivery });

          await new Promise(resolve => setTimeout(resolve, webhookConfig.retryDelay));
          attempt++;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      delivery.status = 'error'; 
      delivery.message = message;
      addDelivery({ ...delivery });
      throw error;
    }
  }, [addDelivery]);

  const testWebhook = useCallback(async () => {
    const testData = { test: true, timestamp: new Date().toISOString(), message: 'Test webhook request' };
    try {
      if (!config.url) {
        throw new Error('Please enter a webhook URL before testing');
      }
      
      try {
        new URL(config.url);
      } catch {
        throw new Error('Invalid webhook URL format');
      }

      await sendWebhook(testData, config);
      toast.success('Webhook test completed successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Webhook test failed';
      toast.error(`Webhook test failed: ${message}`);
      throw error;
    }
  }, [sendWebhook, config]);

  const deleteWebhook = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedWebhooks(prev => prev.filter(webhook => webhook.id !== id));
      toast.success('Webhook deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete webhook';
      console.error('Error deleting webhook:', error);
      toast.error(message);
    }
  }, [user?.id]);

  return {
    config,
    savedWebhooks,
    selectedWebhook,
    selectWebhook,
    updateConfig,
    deleteWebhook,
    testWebhook,
    sendWebhook,
    deliveries
  };
}
