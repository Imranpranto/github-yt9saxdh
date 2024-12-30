import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { createCheckoutSession } from '../lib/stripe';
import { STRIPE_CONFIG } from '../config/stripe';
import { toast } from '../utils/toast';

interface SubscriptionError extends Error {
  code?: string;
  type?: string;
  statusCode?: number;
}

export function useSubscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const validatePriceId = (priceId: string): boolean => {
    return priceId.startsWith('price_') && priceId.length > 10;
  };

  const subscribe = useCallback(async (
    planName: 'starter' | 'explorer' | 'pro',
    billingCycle: 'monthly' | 'yearly'
  ) => {
    if (!user?.email) {
      toast.error('Please sign in to continue with subscription');
      return;
    }

    setLoading(true);
    try {
      const priceId = STRIPE_CONFIG.products[planName]?.[billingCycle];
      
      if (!priceId || !validatePriceId(priceId)) {
        throw new Error('Invalid price configuration');
      }

      const { sessionId } = await createCheckoutSession({
        priceId,
        userId: user.id,
        customerEmail: user.email,
        successUrl: `${STRIPE_CONFIG.baseUrl}/my-subscription?success=true`,
        cancelUrl: `${STRIPE_CONFIG.baseUrl}/pricing`
      });

      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(m => m.loadStripe(STRIPE_CONFIG.publishableKey));
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Subscription error:', {
        error,
        planName,
        billingCycle,
        userId: user?.id
      });
      
      let errorMessage = 'Failed to start subscription';
      if (error instanceof Error) {
        if (error.message.includes('price configuration')) {
          errorMessage = 'Invalid plan configuration. Please try again later.';
        } else if (error.message.includes('checkout session')) {
          errorMessage = 'Unable to start checkout process. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    subscribe,
    loading
  };
}