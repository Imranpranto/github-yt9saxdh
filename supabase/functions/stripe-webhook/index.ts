import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.11.0';
import { corsHeaders } from './config.ts';
import { 
  handleCheckoutCompleted,
  handleSubscriptionCreated,
  handleSubscriptionDeleted 
} from './handlers.ts';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing required environment variables');
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verify Stripe signature
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.error('Missing Stripe signature');
    return new Response(
      JSON.stringify({ 
        error: 'Missing stripe-signature header',
        message: 'Missing Stripe signature'
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ 
          error: `Webhook Error: ${err.message}`,
          message: 'Invalid Stripe signature'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Received Stripe webhook event: ${event.type}`);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2));

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout.session.completed');
        await handleCheckoutCompleted(event.data.object);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        console.log('Processing subscription event:', event.type);
        await handleSubscriptionCreated(event.data.object);
        break;
      }
      case 'customer.subscription.deleted': {
        console.log('Processing subscription.deleted');
        await handleSubscriptionDeleted(event.data.object);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ 
        received: true,
        type: event.type
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        received: false,
        message: 'Failed to process webhook'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});