import { corsHeaders } from './cors.ts';

export const STRIPE_CONFIG = {
  apiVersion: '2023-10-16' as const,
  successUrlPath: '/my-subscription?success=true',
  cancelUrlPath: '/pricing',
  paymentMethods: ['card'] as const,
};

export function getStripeKey(): string {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return key;
}

export function getErrorResponse(error: unknown) {
  console.error('Checkout Session Error:', error);
  
  let statusCode = 500;
  let errorMessage = 'Unknown error occurred';
  let errorCode = 'checkout_error';
  let errorType = 'api_error';

  if (error instanceof Error) {
    errorMessage = error.message;
    if ('statusCode' in error) {
      statusCode = (error as any).statusCode;
    }
    if ('code' in error) {
      errorCode = (error as any).code;
    }
    if ('type' in error) {
      errorType = (error as any).type;
    }
  }

  return new Response(
    JSON.stringify({
      error: errorMessage,
      code: errorCode,
      type: errorType,
      statusCode
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode,
    }
  );
}