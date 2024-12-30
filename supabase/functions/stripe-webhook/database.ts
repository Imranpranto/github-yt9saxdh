import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import type { SubscriptionData } from './types.ts';
import { PLAN_MAP } from './config.ts';

export const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

export async function getPlanFromPriceId(priceId: string): Promise<string> {
  return PLAN_MAP[priceId] || 'Trial';
}

export async function updateSubscriptionInDatabase(userId: string, data: SubscriptionData) {
  console.log('Updating subscription for user:', userId, 'with data:', data);

  const { error } = await supabase
    .from('credits_calculation_and_profiles')
    .update(data)
    .eq('id', userId);

  if (error) {
    console.error('Database update error:', error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  console.log('Successfully updated subscription');
}