export interface PricingTier {
  name: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
}

export interface PricingState {
  currentPlan: string;
  selectedPlan: string | null;
  billingCycle: 'monthly' | 'yearly';
  loading: boolean;
  error: string | null;
}