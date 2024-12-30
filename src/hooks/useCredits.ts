import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { toast } from '../utils/toast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface UseCreditsResult {
  deductCredits: (amount: number, operation: string, details?: any) => Promise<boolean>;
  loading: boolean;
}

async function updateCreditsCalculation(
  userId: string, 
  amount: number,
  retries = MAX_RETRIES
): Promise<boolean> {
  try {
    const { data: currentStats, error: fetchError } = await supabase
      .from('credits_calculation_and_profiles')
      .select(`
        total_credits,
        used_credits,
        credits_left,
        trial_ends_at,
        plan
      `)
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    if (!currentStats) {
      throw new Error('User profile not found');
    }

    // Check if trial has ended
    if (currentStats.trial_ends_at && new Date(currentStats.trial_ends_at) < new Date()) {
      throw new Error('Trial period has ended. Please upgrade your plan to continue.');
    }

    // Check if user has enough credits
    const newCreditsLeft = currentStats.credits_left - amount;
    if (newCreditsLeft < 0) {
      throw new Error(`Insufficient credits. You need ${amount} credits but have ${currentStats.credits_left} remaining.`);
    }
    
    // Update credits
    const { error: updateError } = await supabase
      .from('credits_calculation_and_profiles')
      .update({
        used_credits: currentStats.used_credits + amount,
        credits_left: newCreditsLeft,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    if (retries > 0 && (
      error.code === '40001' || // Retry on serialization failures
      error.code === '42P01'    // Retry on relation not found
    )) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return updateCreditsCalculation(userId, amount, retries - 1);
    }
    throw error;
  }
}

export function useCredits(): UseCreditsResult {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const deductCredits = async (amount: number, operation: string, details: any = {}) => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    if (amount <= 0) return true;

    setLoading(true);
    try {
      const success = await updateCreditsCalculation(user.id, amount);
      return success;
    } catch (error) {
      console.error('Error deducting credits:', error);

      let errorMessage = 'Failed to deduct credits';
      if (error?.message?.includes('Insufficient credits')) {
        errorMessage = 'You do not have enough credits for this operation';
      } else if (error?.code === 'PGRST116') {
        errorMessage = 'Profile not found. Please try logging in again.';
      } else if (error?.message?.includes('Trial period has ended')) {
        errorMessage = 'Your trial period has ended. Please upgrade your plan to continue.';
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deductCredits, loading };
}