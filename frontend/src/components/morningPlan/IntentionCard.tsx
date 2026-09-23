import React from 'react';
import { Compass, Timer, BookOpen } from 'lucide-react';
import { Textarea } from '../common/Input';

interface IntentionCardProps {
  intention: string;
  onIntentionChange: (val: string) => void;
  plannedFocusMinutes: number;
  onPlannedFocusChange: (val: number) => void;
  plannedStudyMinutes: number;
  onPlannedStudyChange: (val: number) => void;
  notes: string;
  onNotesChange: (val: string) => void;
}

export const IntentionCard: React.FC<IntentionCardProps> = ({
  intention,
  onIntentionChange,
  plannedFocusMinutes,
  onPlannedFocusChange,
  plannedStudyMinutes,
  onPlannedStudyChange,
  notes,
  onNotesChange,
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-500" />
          <span>Daily Focus & Intentions</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Anchor your day with a clear focus mindset and time targets
        </p>
      </div>

      {/* Intention statement */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Today's Guiding Intention
        </label>
        <input
          type="text"
          value={intention}
          onChange={(e) => onIntentionChange(e.target.value)}
          placeholder='e.g. "Complete database module and study 2 hours."'
          className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium italic"
        />
      </div>

      {/* Target Focus & Study Minutes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40 space-y-2">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Timer className="w-4 h-4" />
            <span>Target Focus Sprints (min)</span>
          </div>
          <input
            type="number"
            min="0"
            step="15"
            value={plannedFocusMinutes || ''}
            onChange={(e) => onPlannedFocusChange(Number(e.target.value) || 0)}
            placeholder="e.g. 90 mins"
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <p className="text-[11px] text-slate-400">
            {plannedFocusMinutes > 0 ? `${Math.floor(plannedFocusMinutes / 60)}h ${plannedFocusMinutes % 60}m planned` : 'No focus target set'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Target Study Time (min)</span>
          </div>
          <input
            type="number"
            min="0"
            step="15"
            value={plannedStudyMinutes || ''}
            onChange={(e) => onPlannedStudyChange(Number(e.target.value) || 0)}
            placeholder="e.g. 120 mins"
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400">
            {plannedStudyMinutes > 0 ? `${Math.floor(plannedStudyMinutes / 60)}h ${plannedStudyMinutes % 60}m planned` : 'No study target set'}
          </p>
        </div>
      </div>

      {/* Notes */}
      <Textarea
        label="Day's Strategy Notes (Optional)"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Reminders, schedule details, energy management thoughts..."
        rows={3}
      />
    </div>
  );
};
