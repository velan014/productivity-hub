import React from 'react';
import { Check, Clock } from 'lucide-react';
import { AiTaskSuggestion } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { cn } from '../../utils/cn';

interface TaskSuggestionCardProps {
  suggestion: AiTaskSuggestion;
  onToggleSelect: () => void;
  onTitleChange: (newTitle: string) => void;
}

export const TaskSuggestionCard: React.FC<TaskSuggestionCardProps> = ({
  suggestion,
  onToggleSelect,
  onTitleChange,
}) => {
  return (
    <div
      onClick={onToggleSelect}
      className={cn(
        'p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex items-start gap-3 cursor-pointer select-none',
        suggestion.selected
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
          suggestion.selected
            ? 'bg-indigo-600 border-indigo-600 text-white'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
        )}
      >
        {suggestion.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <input
          type="text"
          value={suggestion.title}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full text-sm font-bold text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
        />

        {suggestion.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {suggestion.description}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] text-slate-500">
          <PriorityBadge priority={suggestion.priority} />
          {suggestion.category && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              {suggestion.category}
            </span>
          )}
          {suggestion.estimated_minutes && (
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" />
              {suggestion.estimated_minutes} mins
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
