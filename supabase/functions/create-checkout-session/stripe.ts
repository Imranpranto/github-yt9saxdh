import Stripe from 'https://esm.sh/stripe@13.11.0';
import { getStripeKey, STRIPE_CONFIG } from './config.ts';

export class StripeError extends Error {
  constructor(
    message: string, 
    public statusCode: number = 500,
    public code: string = 'checkout_error',
    public type: string = 'api_error'
  ) {
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
    throw new StripeError(
      'Failed to initialize Stripe client',
      500,
      'initialization_error',
      'api_error'
    );
  }
}

export interface CheckoutSessionParams {
  priceId: string;
  userId: string;
  customerEmail: string;
  origin: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession(params: CheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const stripe = createStripeClient();
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: STRIPE_CONFIG.paymentMethods,
      mode: 'subscription',
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl || `https://app.lienrich.com${STRIPE_CONFIG.successUrlPath}`,
      cancel_url: params.cancelUrl || `https://app.lienrich.com${STRIPE_CONFIG.cancelUrlPath}`,
      customer_email: params.customerEmail,
      metadata: {
        userId: params.userId,
        priceId: params.priceId
      },
      subscription_data: {
        metadata: {
          userId: params.userId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      client_reference_id: params.userId,
    });

    return session;
  } catch (error) {
    console.error('Stripe API Error:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeError(
        error.message,
        error.statusCode || 500,
        error.code || 'checkout_error',
        error.type || 'api_error'
      );
    }

    // Handle generic errors
    throw new StripeError(
      error instanceof Error ? error.message : 'Failed to create checkout session',
      500,
      'checkout_error',
      'api_error'
    );
  }
}