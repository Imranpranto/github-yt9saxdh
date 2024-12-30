import type { Stripe } from 'https://esm.sh/stripe@13.11.0';

export interface SubscriptionData {
  plan: string;
  subscription_id?: string | null;
  subscription_status?: string;
  subscription_start_at?: string;
  subscription_end_at?: string;
  updated_at: string;
}

export type PlanId = keyof typeof PLAN_MAP;

export interface DatabaseError {
  message: string;
  code?: string;
}

export interface WebhookHandlerContext {
  userId: string;
  subscription: Stripe.Subscription;
  priceId: string;
}