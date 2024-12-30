import React from 'react';
import { LOGO_CONFIG, LogoSize, LogoVariant } from '../config/logos';

interface LogoProps {
  theme?: 'light' | 'dark';
  showText?: boolean;
}

export default function Logo({ theme = 'light', showText = true }: LogoProps) {
  const isDark = theme === 'dark';
  const size: LogoSize = 'medium';  // Always use medium size for consistency
  const logoVariant: LogoVariant = isDark ? 'dark' : 'light';
  const { width, height } = LOGO_CONFIG.sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="group">
        <div className={`p-2 rounded-lg transition-colors duration-200 
          ${isDark ? 'bg-gray-800' : 'bg-indigo-50/50'} 
          ${isDark ? 'group-hover:bg-gray-700' : 'group-hover:bg-indigo-100/50'}`}>
          <img
            src={LOGO_CONFIG.variants[logoVariant]}
            alt={LOGO_CONFIG.defaults.alt}
            width={width}
            height={height}
            className="transition-opacity duration-200 group-hover:opacity-90"
          />
        </div>
      </div>
      {showText && <div className="flex items-center gap-2">
        <span className={`font-bold text-xl
          ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
          LiEnrich
        </span>
      </div>}
    </div>
  );
}
