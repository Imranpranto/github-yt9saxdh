export interface PricingTier {
  name: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 20,
    credits: 1000,
    description: 'Getting started with LinkedIn data enrichment',
    features: [
      'CSV data export',
      'Webhook integration',
      'Basic support',
      'Email support',
      'Unlimited exports'
    ]
  },
  {
    name: 'Explorer',
    price: 50,
    credits: 2800,
    description: 'Ideal for growing businesses and teams',
    features: [
      'Everything in Starter',
      'Priority support',
      'Advanced analytics dashboard',
      'Custom webhooks'
    ],
    isPopular: true
  },
  {
    name: 'Pro',
    price: 100,
    credits: 6000,
    description: 'For power users and larger organizations',
    features: [
      'Everything in Explorer',
      'Premium support',
      'API access (Coming soon)',
      'Custom webhooks',
      'Unlimited exports'
    ],
    isPopular: false
  }
];