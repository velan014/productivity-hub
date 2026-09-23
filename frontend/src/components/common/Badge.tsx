import React from 'react';
import { cn } from '../../utils/cn';
import { TaskPriority, TaskStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
}) => {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    primary: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    danger: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50',
    info: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
    outline: 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 shrink-0 select-none capitalize tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'sm',
}) => {
  const map: Record<TaskPriority, { variant: 'danger' | 'warning' | 'info'; label: string }> = {
    high: { variant: 'danger', label: 'High' },
    medium: { variant: 'warning', label: 'Medium' },
    low: { variant: 'info', label: 'Low' },
  };

  const config = map[priority] || map.medium;
  return (
    <Badge variant={config.variant} size={size}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </Badge>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  const map: Record<TaskStatus, { variant: 'default' | 'info' | 'success'; label: string }> = {
    todo: { variant: 'default', label: 'To Do' },
    in_progress: { variant: 'info', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
  };

  const config = map[status] || map.todo;
  return <Badge variant={config.variant} size={size}>{config.label}</Badge>;
};
