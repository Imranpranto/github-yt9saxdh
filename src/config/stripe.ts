export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  products: {
    starter: {
      monthly: import.meta.env.VITE_STRIPE_PRODUCT_STARTER_MONTHLY,
      yearly: import.meta.env.VITE_STRIPE_PRODUCT_STARTER_YEARLY
    },
    explorer: {
      monthly: import.meta.env.VITE_STRIPE_PRODUCT_EXPLORER_MONTHLY,
      yearly: import.meta.env.VITE_STRIPE_PRODUCT_EXPLORER_YEARLY
    },
    pro: {
      monthly: import.meta.env.VITE_STRIPE_PRODUCT_PRO_MONTHLY,
      yearly: import.meta.env.VITE_STRIPE_PRODUCT_PRO_YEARLY
    }
  },
  baseUrl: typeof window !== 'undefined' ? window.location.origin : 'https://quiet-strudel-de5633.netlify.app',
  webhookUrl: 'https://wttwdqxijxvzylavmsrw.functions.supabase.co/stripe-webhook',
  successPath: '/subscription/success',
  cancelPath: '/pricing'
};
