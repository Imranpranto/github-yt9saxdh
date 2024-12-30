import Stripe from 'https://esm.sh/stripe@13.11.0';
import { getStripeKey, STRIPE_CONFIG } from './config.ts';

export class StripeError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'StripeError';
  }
}

export function createStripeClient(): Stripe {
  try {
    return new Stripe(getStripeKey(), {
      apiVersion: STRIPE_CONFIG.apiVersion,
      httpClient: Stripe.createFetchHttpClient(),
    });
  } catch (error) {
    throw new StripeError('Failed to initialize Stripe client', 500);
  }
}