# Supabase Edge Functions Guide

## Overview
Edge Functions are serverless functions that run on Supabase's infrastructure using Deno runtime. They're perfect for:
- Processing webhooks (like Stripe payments)
- Running server-side logic
- Handling API requests
- Background tasks

## Project Structure
```
supabase/
├── functions/
│   ├── create-checkout-session/
│   │   └── index.ts         # Handles Stripe checkout creation
│   ├── stripe-webhook/
│   │   └── index.ts         # Processes Stripe webhook events
│   └── create-portal-session/
│       └── index.ts         # Manages Stripe customer portal
```

## Local Development
1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Start local development:
```bash
supabase start
supabase functions serve
```

## Deployment
1. Link your project:
```bash
supabase link --project-ref wttwdqxijxvzylavmsrw
```

2. Deploy functions:
```bash
supabase functions deploy
```

## Environment Variables
Edge Functions use environment variables from `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Security
- Functions run in isolated environments
- CORS policies are enforced
- JWT verification available
- Secure environment variables

## Best Practices
1. Keep functions small and focused
2. Handle errors properly
3. Use TypeScript for type safety
4. Implement proper logging
5. Add request validation
6. Set appropriate timeouts