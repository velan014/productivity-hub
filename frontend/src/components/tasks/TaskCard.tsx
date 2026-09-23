import React from 'react';
import { Calendar, Clock, Edit2, Trash2, Check } from 'lucide-react';
import { Task } from '../../types';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { formatDate, formatTime } from '../../utils/date';
import { cn } from '../../utils/cn';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  compact = false,
}) => {
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200',
        'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md',
        isCompleted
          ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 opacity-80'
          : 'border-slate-200 dark:border-slate-800 shadow-sm',
        compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Interactive Completion Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task);
          }}
          className={cn(
            'mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shrink-0 min-h-[24px] min-w-[24px]',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-slate-800'
          )}
          aria-label={isCompleted ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as completed`}
          title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Details (Clickable to Edit) */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onEdit(task)}
        >
          {/* Header row: Title */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4
              className={cn(
                'text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 break-words leading-tight transition-all',
                isCompleted && 'line-through text-slate-400 dark:text-slate-500 font-normal'
              )}
            >
              {task.title}
            </h4>
          </div>

          {/* Description (if present and not compact) */}
          {task.description && !compact && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 mb-2.5 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta Information Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <PriorityBadge priority={task.priority} />

            {task.category && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-medium text-[11px]">
                {task.category}
              </span>
            )}

            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span
                  className={cn(
                    formatDate(task.due_date) === 'Today' && 'text-emerald-600 dark:text-emerald-400 font-medium',
                    formatDate(task.due_date).includes('overdue') && !isCompleted && 'text-rose-500 font-medium'
                  )}
                >
                  {formatDate(task.due_date)}
                </span>
              </div>
            )}

            {task.due_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatTime(task.due_time)}</span>
              </div>
            )}

            {task.estimated_minutes && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                ~{task.estimated_minutes}m
              </span>
            )}

            {!compact && (
              <div className="ml-auto hidden sm:block">
                <StatusBadge status={task.status} />
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1 shrink-0 -mr-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Edit task "${task.title}"`}
            title="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Delete task "${task.title}"`}
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
