import React from 'react';
import { Task } from '../../types';
import { Flame, CheckCircle2, Link2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PrioritySlotsProps {
  priority1: string;
  onPriority1Change: (val: string) => void;
  priority2: string;
  onPriority2Change: (val: string) => void;
  priority3: string;
  onPriority3Change: (val: string) => void;
  priority1TaskId: string;
  onPriority1TaskIdChange: (val: string) => void;
  priority2TaskId: string;
  onPriority2TaskIdChange: (val: string) => void;
  priority3TaskId: string;
  onPriority3TaskIdChange: (val: string) => void;
  tasks: Task[];
}

export const PrioritySlots: React.FC<PrioritySlotsProps> = ({
  priority1,
  onPriority1Change,
  priority2,
  onPriority2Change,
  priority3,
  onPriority3Change,
  priority1TaskId,
  onPriority1TaskIdChange,
  priority2TaskId,
  onPriority2TaskIdChange,
  priority3TaskId,
  onPriority3TaskIdChange,
  tasks,
}) => {
  const slots = [
    {
      num: 1,
      label: 'Priority 1 (Crucial MIT)',
      value: priority1,
      onChange: onPriority1Change,
      taskId: priority1TaskId,
      onTaskIdChange: onPriority1TaskIdChange,
      badgeColor: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900',
      icon: Flame,
      placeholder: 'What is the ONE thing you must accomplish today?',
      required: true,
    },
    {
      num: 2,
      label: 'Priority 2 (Important Target)',
      value: priority2,
      onChange: onPriority2Change,
      taskId: priority2TaskId,
      onTaskIdChange: onPriority2TaskIdChange,
      badgeColor: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
      icon: CheckCircle2,
      placeholder: 'Secondary milestone for today...',
      required: false,
    },
    {
      num: 3,
      label: 'Priority 3 (Quick Win or Key Task)',
      value: priority3,
      onChange: onPriority3Change,
      taskId: priority3TaskId,
      onTaskIdChange: onPriority3TaskIdChange,
      badgeColor: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
      icon: CheckCircle2,
      placeholder: 'Tertiary task to move your goals forward...',
      required: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          Top 3 Daily Priorities
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pick at most 3 Most Important Tasks (MITs) for today to maintain sharp focus
        </p>
      </div>

      <div className="space-y-4">
        {slots.map((slot) => {
          const Icon = slot.icon;

          return (
            <div
              key={slot.num}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-extrabold border flex items-center gap-1.5',
                      slot.badgeColor
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    Slot {slot.num}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {slot.label}
                  </span>
                </div>

                {/* Link to existing Task Dropdown */}
                {tasks.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={slot.taskId}
                      onChange={(e) => {
                        const tId = e.target.value;
                        slot.onTaskIdChange(tId);
                        if (tId) {
                          const found = tasks.find((t) => t.id === tId);
                          if (found && !slot.value) {
                            slot.onChange(found.title);
                          }
                        }
                      }}
                      className="text-[11px] py-1 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="">Link to existing task...</option>
                      {tasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <input
                type="text"
                value={slot.value}
                onChange={(e) => slot.onChange(e.target.value)}
                placeholder={slot.placeholder}
                required={slot.required}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
