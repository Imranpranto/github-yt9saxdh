import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/stripe';
import { supabase } from './supabase';
import { invokeEdgeFunction } from '../utils/edge-functions';
import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || STRIPE_CONFIG.publishableKey;
    if (!key) {
      throw new Error('Stripe publishable key is required');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

interface CheckoutSessionParams {
  priceId: string;
  userId: string;
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutSessionResponse {
  sessionId: string;
  success: boolean;
}

export const createCheckoutSession = async ({
  priceId,
  userId,
  customerEmail,
  successUrl = `${STRIPE_CONFIG.baseUrl}/subscription/success`,
  cancelUrl = `${STRIPE_CONFIG.baseUrl}/pricing`
}: CheckoutSessionParams): Promise<CheckoutSessionResponse> => {
  try {
    // Validate inputs
    if (!priceId || !userId || !customerEmail) {
      throw new Error('Missing required parameters');
    }

    // Validate price ID format
    if (!priceId.startsWith('price_')) {
      throw new Error('Invalid price ID format');
    }

    // Create checkout session using Edge Function
    const response = await invokeEdgeFunction<CheckoutSessionResponse>('create-checkout-session', {
      priceId,
      userId,
      customerEmail,
      successUrl,
      cancelUrl
    });

    if (!response?.sessionId) {
      throw new Error('Invalid response from checkout session creation');
    }

    return response;
  } catch (error) {
    console.error('Checkout Session Error:', error);
    
    // Enhance error object with additional context
    const enhancedError = new Error(
      error instanceof Error ? error.message : 'Failed to create checkout session'
    );
    Object.assign(enhancedError, {
      code: error.code || 'checkout_error',
      type: error.type || 'api_error',
      statusCode: error.statusCode || 500
    });
    
    throw enhancedError;
  }
};

export const createPortalSession = async (customerId: string) => {
  try {
    const { data: { url }, error } = await supabase.functions.invoke('create-portal-session', {
      body: { customerId }
    });

    if (error) throw error;
    window.location.href = url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};