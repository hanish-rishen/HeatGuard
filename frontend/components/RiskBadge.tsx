import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

const STYLES = {
  [RiskLevel.LOW]: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  [RiskLevel.MODERATE]: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/50',
  [RiskLevel.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700/50',
  [RiskLevel.EXTREME]: 'bg-red-500 text-white border-red-600 dark:bg-red-600 dark:text-white dark:border-red-500 shadow-sm shadow-red-500/20',
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center font-bold rounded-lg border ${STYLES[level]} ${sizeClasses[size]}`}>
      {level}
    </span>
  );
};