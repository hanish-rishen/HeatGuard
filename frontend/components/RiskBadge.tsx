import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

const COLORS = {
  [RiskLevel.LOW]: 'bg-green-100 text-green-800 border-green-200',
  [RiskLevel.MODERATE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [RiskLevel.HIGH]: 'bg-orange-100 text-orange-800 border-orange-200',
  [RiskLevel.EXTREME]: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${COLORS[level]} ${sizeClasses[size]}`}>
      {level}
    </span>
  );
};