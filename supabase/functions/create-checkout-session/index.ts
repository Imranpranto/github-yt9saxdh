import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.11.0';
import { corsHeaders } from './cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, userId, customerEmail, successUrl, cancelUrl } = await req.json();

    if (!priceId || !userId || !customerEmail) {
      throw new Error('Missing required fields');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || 'https://app.lienrich.com/subscription/success',
      cancel_url: cancelUrl || 'https://app.lienrich.com/pricing',
      customer_email: customerEmail,
      metadata: { userId, priceId },
      subscription_data: {
        metadata: { userId },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      client_reference_id: userId,
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Checkout Session Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
        code: 'checkout_error',
        type: 'api_error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});