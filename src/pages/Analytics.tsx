import React from 'react';
import { CreditCard, Users, FolderOpen, Activity } from 'lucide-react';
import { useCreditsStats } from '../hooks/useCreditsStats';
import { useLeads } from '../hooks/useLeads';
import AnalyticsCard from '../components/analytics/AnalyticsCard';
import CreditUsageChart from '../components/analytics/CreditUsageChart';
import LeadsOverviewChart from '../components/analytics/LeadsOverviewChart';
import AudienceGrowthChart from '../components/analytics/AudienceGrowthChart';

export default function Analytics() {
  const { totalCredits, usedCredits, remainingCredits, loading: creditsLoading } = useCreditsStats();
  const { leads, audiences, loading: leadsLoading } = useLeads();

  const stats = [
    {
      title: 'Total Credits',
      value: totalCredits.toLocaleString(),
      change: '+250',
      changeType: 'increase',
      icon: CreditCard,
      color: 'blue'
    },
    {
      title: 'Total Leads',
      value: leads.length.toLocaleString(),
      change: `+${leads.length}`,
      changeType: 'increase',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Audiences',
      value: audiences.length.toLocaleString(),
      change: `+${audiences.length}`,
      changeType: 'increase',
      icon: FolderOpen,
      color: 'purple'
    },
    {
      title: 'Credit Usage',
      value: `${Math.round((usedCredits / totalCredits) * 100)}%`,
      change: `${remainingCredits.toLocaleString()} remaining`,
      changeType: 'neutral',
      icon: Activity,
      color: 'indigo'
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analytics Overview</h1>
          <p className="text-gray-500">Monitor your application usage and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <AnalyticsCard key={index} {...stat} loading={creditsLoading || leadsLoading} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Credit Usage Over Time</h2>
            <CreditUsageChart />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Leads Overview</h2>
            <LeadsOverviewChart />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Audience Growth</h2>
          <AudienceGrowthChart />
        </div>
      </div>
    </div>
  );
}