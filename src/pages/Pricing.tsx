import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { pricingTiers } from '../data/pricingTiers';
import { useSubscription } from '../hooks/useSubscription';
import { toast } from '../utils/toast';
import PricingCard from '../components/pricing/PricingCard';
import BillingCycleToggle from '../components/pricing/BillingCycleToggle';
import type { PricingState } from '../types/pricing';

export default function Pricing() {
  const [state, setState] = useState<PricingState>({
    currentPlan: 'Trial',
    selectedPlan: null,
    billingCycle: 'monthly',
    loading: false,
    error: null
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribe } = useSubscription();

  const handlePlanSelect = async (planName: string) => {
    if (!user) {
      toast.error('Please sign in to change plans');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await subscribe(planName as 'starter' | 'explorer' | 'pro', state.billingCycle);
      setState(prev => ({ ...prev, selectedPlan: planName }));
    } catch (error) {
      console.error('Error changing plan:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to change plan' 
      }));
      toast.error(error instanceof Error ? error.message : 'Failed to change plan');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleBillingCycleChange = (cycle: 'monthly' | 'yearly') => {
    setState(prev => ({ ...prev, billingCycle: cycle }));
  };


  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {state.error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg">
            {state.error}
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your needs. All plans include immediate credit delivery.
          </p>
        </div>

        <BillingCycleToggle
          cycle={state.billingCycle}
          onChange={handleBillingCycleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.name}
              plan={tier}
              currentPlan={state.currentPlan}
              billingCycle={state.billingCycle}
              onSelect={handlePlanSelect}
              loading={state.loading}
            />
          ))}
        </div>

        <div className="text-center mb-16">
          <p className="text-gray-600">
            Need custom solutions?{' '}
            <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}