import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'indigo';
  loading?: boolean;
}

const colorMap = {
  blue: 'from-blue-500 to-indigo-600 bg-blue-50 text-blue-600',
  green: 'from-emerald-500 to-teal-600 bg-emerald-50 text-emerald-600',
  purple: 'from-violet-500 to-purple-600 bg-violet-50 text-violet-600',
  indigo: 'from-indigo-500 to-purple-600 bg-indigo-50 text-indigo-600'
};

export default function AnalyticsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  loading = false
}: AnalyticsCardProps) {
  const gradientClasses = `${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`;

  return (
    <div className="relative group">
      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r opacity-[0.05] blur-sm transition duration-300 group-hover:opacity-[0.1] rounded-xl ${gradientClasses}`}
        style={{ background: 'linear-gradient(to right, var(--tw-gradient-stops))' }}
      />
      <div className="relative bg-white p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorMap[color].split(' ')[2]} ${colorMap[color].split(' ')[3]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className={`text-sm font-medium ${
            changeType === 'increase' ? 'text-green-600' :
            changeType === 'decrease' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {change}
          </div>
        </div>
        
        {loading ? (
          <>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </>
        )}
      </div>
    </div>
  );
}
