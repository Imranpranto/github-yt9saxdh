import type Stripe from 'https://esm.sh/stripe@13.11.0';
import { updateSubscriptionInDatabase } from './database.ts';
import { PLAN_MAP } from './config.ts';
import type { SubscriptionData } from './types.ts';

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session & { line_items?: { data: Array<{ price: { id: string } }> } }
) {
  const userId = session.client_reference_id;
  const priceId = session.line_items?.data[0]?.price?.id;

  if (!userId || !priceId) {
    throw new Error('Missing required data in checkout session');
  }

  const data: SubscriptionData = {
    plan: PLAN_MAP[priceId] || 'Trial',
    updated_at: new Date().toISOString()
  };

  await updateSubscriptionInDatabase(userId, data);
}

export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
    throw new Error('Missing userId in subscription metadata');
  }

  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) {
    throw new Error('Invalid subscription data: missing price ID');
  }

  const data: SubscriptionData = {
    plan: PLAN_MAP[priceId] || 'Trial',
    subscription_id: subscription.id,
    subscription_status: subscription.status,
    subscription_start_at: new Date(subscription.current_period_start * 1000).toISOString(),
    subscription_end_at: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };

  await updateSubscriptionInDatabase(userId, data);
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
    throw new Error('Missing userId in subscription metadata');
  }

  const data: SubscriptionData = {
    plan: 'Trial',
    subscription_id: null,
    subscription_status: 'canceled',
    updated_at: new Date().toISOString()
  };

  await updateSubscriptionInDatabase(userId, data);
}