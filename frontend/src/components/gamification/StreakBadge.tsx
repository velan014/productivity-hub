import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, className }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs shadow-xs transition-transform duration-150',
        streak > 0
          ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
        className
      )}
    >
      <Flame
        className={cn(
          'w-3.5 h-3.5',
          streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-400'
        )}
      />
      <span>{streak} Day Streak</span>
    </div>
  );
};
