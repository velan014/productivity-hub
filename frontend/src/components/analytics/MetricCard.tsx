import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  theme?: 'indigo' | 'emerald' | 'cyan' | 'blue' | 'amber' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  theme = 'indigo',
}) => {
  const themes = {
    indigo: {
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/40',
      val: 'text-indigo-600 dark:text-indigo-400',
    },
    emerald: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/40',
      val: 'text-emerald-600 dark:text-emerald-400',
    },
    cyan: {
      bg: 'bg-cyan-50/50 dark:bg-cyan-950/20',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-100 dark:border-cyan-900/40',
      val: 'text-cyan-600 dark:text-cyan-400',
    },
    blue: {
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/40',
      val: 'text-blue-600 dark:text-blue-400',
    },
    amber: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/40',
      val: 'text-amber-600 dark:text-amber-400',
    },
    purple: {
      bg: 'bg-purple-50/50 dark:bg-purple-950/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/40',
      val: 'text-purple-600 dark:text-purple-400',
    },
  };

  const currentTheme = themes[theme] || themes.indigo;

  return (
    <div className={cn('p-5 rounded-3xl border shadow-xs flex flex-col justify-between', currentTheme.bg, currentTheme.border)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', currentTheme.iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {value}
        </p>
        {(subtitle || trend) && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {trend && <span className="font-bold mr-1">{trend}</span>}
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
