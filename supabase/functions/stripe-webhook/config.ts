export const PLAN_MAP = {
  'price_1QSVTyClmigcXiKN3g2F7KUQ': 'Starter', // Monthly
  'price_1QUhvPClmigcXiKNwfuRxOpI': 'Starter', // Yearly
  'price_1QSVWoClmigcXiKNsjgTPayL': 'Explorer', // Monthly
  'price_1QUiFfClmigcXiKNmoImgSMU': 'Explorer', // Yearly
  'price_1QSVXqClmigcXiKNyYZtcj2p': 'Pro', // Monthly
  'price_1QUiGKClmigcXiKNpTnTz6aM': 'Pro' // Yearly
} as const;

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Max-Age': '86400',
};