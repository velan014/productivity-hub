import React from 'react';
import { Edit2, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { SubjectWithStats } from '../../types';
import { cn } from '../../utils/cn';

interface SubjectCardProps {
  subject: SubjectWithStats;
  onEdit: (subject: SubjectWithStats) => void;
  onDelete: (subject: SubjectWithStats) => void;
  onLogSession: (subject: SubjectWithStats) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onEdit,
  onDelete,
  onLogSession,
}) => {
  const isGoalReached = subject.target_hours > 0 && subject.completed_hours >= subject.target_hours;

  return (
    <div
      className={cn(
        'group p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-xs',
        isGoalReached
          ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/15 dark:bg-emerald-950/10'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
      )}
    >
      <div>
        {/* Top Header: Code Badge & Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {subject.code ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                {subject.code}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Subject
              </span>
            )}

            {isGoalReached && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-200 dark:border-emerald-900">
                <CheckCircle2 className="w-3 h-3" /> Target Reached
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(subject)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Subject"
              aria-label="Edit Subject"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(subject)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Delete Subject"
              aria-label="Delete Subject"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug">
          {subject.name}
        </h3>
      </div>

      {/* Progress Section */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            {subject.completed_hours} hrs / {subject.target_hours > 0 ? `${subject.target_hours} hrs target` : 'No target'}
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {subject.progress}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              isGoalReached
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            )}
            style={{ width: `${Math.min(100, subject.progress)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          <span>{subject.total_sessions} logged {subject.total_sessions === 1 ? 'session' : 'sessions'}</span>
          <button
            onClick={() => onLogSession(subject)}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            + Log Session
          </button>
        </div>
      </div>
    </div>
  );
};
