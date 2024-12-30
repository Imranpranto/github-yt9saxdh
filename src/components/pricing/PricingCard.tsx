import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import type { PricingTier } from '../../types/pricing';

interface PricingCardProps {
  plan: PricingTier;
  currentPlan: string;
  billingCycle: 'monthly' | 'yearly';
  onSelect: (planName: string) => void;
  loading: boolean;
}

export default function PricingCard({ 
  plan, 
  currentPlan, 
  billingCycle,
  onSelect,
  loading 
}: PricingCardProps) {
  const isCurrentPlan = plan.name === currentPlan;
  const isUpgrade = !isCurrentPlan && getPlanPriority(plan.name) > getPlanPriority(currentPlan);
  
  const yearlyPrice = Math.round(plan.price * 12 * 0.9);
  const displayPrice = billingCycle === 'monthly' ? plan.price : Math.round(yearlyPrice / 12);
  
  return (
    <div className={`relative bg-white rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl border-2 ${
      isCurrentPlan ? 'border-indigo-600' : 'border-gray-200'
    }`}>
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Current Plan
          </div>
        </div>
      )}

      <div className="p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-500 mb-4">{plan.description}</p>

        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">
              ${displayPrice}
            </span>
            <span className="text-gray-500 ml-2">/month</span>
          </div>
          {billingCycle === 'yearly' && (
            <div className="text-green-600 text-sm mt-1">
              Save ${Math.round(plan.price * 12 * 0.1)} yearly
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="font-medium">
              {plan.credits.toLocaleString()} credits
            </span>
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSelect(plan.name.toLowerCase())}
          disabled={isCurrentPlan || loading}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isCurrentPlan ? (
                'Current Plan'
              ) : (
                <>
                  {isUpgrade ? 'Upgrade to ' : 'Downgrade to '} {plan.name}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function getPlanPriority(planName: string): number {
  const priorities = {
    trial: 0,
    starter: 1,
    explorer: 2,
    pro: 3
  };
  return priorities[planName.toLowerCase()] || 0;
}