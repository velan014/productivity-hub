import React, { useState } from 'react';
import { Sparkles, Plus, CheckSquare, X } from 'lucide-react';
import { AiTaskSuggestion } from '../../types';
import { TaskSuggestionCard } from './TaskSuggestionCard';
import { Button } from '../common/Button';

interface AIActionConfirmationProps {
  explanation: string;
  initialSuggestions: AiTaskSuggestion[];
  projectId?: string;
  onConfirm: (tasksToAdd: AiTaskSuggestion[]) => Promise<void>;
  onDismiss: () => void;
}

export const AIActionConfirmation: React.FC<AIActionConfirmationProps> = ({
  explanation,
  initialSuggestions,
  onConfirm,
  onDismiss,
}) => {
  const [suggestions, setSuggestions] = useState<AiTaskSuggestion[]>(
    initialSuggestions.map((s) => ({ ...s, selected: true }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSelect = (index: number) => {
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, title: newTitle } : s))
    );
  };

  const selectedCount = suggestions.filter((s) => s.selected).length;

  const handleCreate = async () => {
    const selected = suggestions.filter((s) => s.selected && s.title.trim());
    if (selected.length === 0) return;
    try {
      setIsSubmitting(true);
      await onConfirm(selected);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectAll = () => {
    const allSelected = suggestions.every((s) => s.selected);
    setSuggestions((prev) => prev.map((s) => ({ ...s, selected: !allSelected })));
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/60 space-y-4 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Suggested Tasks for Your Plan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{explanation}</p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          title="Dismiss suggestions"
          aria-label="Dismiss suggestions"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {suggestions.map((sug, idx) => (
          <TaskSuggestionCard
            key={idx}
            suggestion={sug}
            onToggleSelect={() => toggleSelect(idx)}
            onTitleChange={(title) => handleTitleChange(idx, title)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-indigo-900/50 flex-wrap gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          {suggestions.every((s) => s.selected) ? 'Deselect All' : 'Select All'}
        </button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onDismiss} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreate}
            isLoading={isSubmitting}
            disabled={selectedCount === 0}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Selected ({selectedCount})
          </Button>
        </div>
      </div>
    </div>
  );
};
