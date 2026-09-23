import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface DayData {
  day: string;
  date: string;
  completedTasks: number;
  focusMinutes: number;
  studyMinutes: number;
}

interface ProductivityBarChartProps {
  data: DayData[];
}

export const ProductivityBarChart: React.FC<ProductivityBarChartProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'tasks' | 'focus' | 'study'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No activity recorded for this period yet.
      </div>
    );
  }

  // Find max value to scale chart proportionally
  const maxTasks = Math.max(...data.map((d) => d.completedTasks), 5);
  const maxFocus = Math.max(...data.map((d) => d.focusMinutes), 60);
  const maxStudy = Math.max(...data.map((d) => d.studyMinutes), 60);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header & Metric Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Weekly Productivity Activity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Day-by-day completed tasks, focus minutes, and study time
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveMetric('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all min-h-[32px]',
              activeMetric === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            Combined
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('tasks')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all min-h-[32px]',
              activeMetric === 'tasks'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            Tasks
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('focus')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all min-h-[32px]',
              activeMetric === 'focus'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            Focus
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('study')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all min-h-[32px]',
              activeMetric === 'study'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            Study
          </button>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 px-1 relative">
        {data.map((item, idx) => {
          const taskHeight = Math.min(100, Math.round((item.completedTasks / maxTasks) * 100));
          const focusHeight = Math.min(100, Math.round((item.focusMinutes / maxFocus) * 100));
          const studyHeight = Math.min(100, Math.round((item.studyMinutes / maxStudy) * 100));

          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={item.date}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
            >
              {/* Tooltip on Hover */}
              {isHovered && (
                <div className="absolute -top-12 z-20 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-semibold whitespace-nowrap shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 pointer-events-none">
                  <p className="font-bold text-slate-200 mb-0.5">{item.day} ({item.date.slice(5)})</p>
                  <p className="text-emerald-400">{item.completedTasks} tasks</p>
                  <p className="text-cyan-400">{item.focusMinutes}m focus</p>
                  <p className="text-blue-400">{item.studyMinutes}m study</p>
                </div>
              )}

              {/* Bar Group */}
              <div className="w-full max-w-[48px] h-full flex items-end justify-center gap-1 sm:gap-1.5">
                {(activeMetric === 'all' || activeMetric === 'tasks') && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end">
                    <div
                      className="w-full bg-emerald-500 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${Math.max(6, taskHeight)}%` }}
                    />
                  </div>
                )}

                {(activeMetric === 'all' || activeMetric === 'focus') && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end">
                    <div
                      className="w-full bg-cyan-500 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${Math.max(6, focusHeight)}%` }}
                    />
                  </div>
                )}

                {(activeMetric === 'all' || activeMetric === 'study') && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end">
                    <div
                      className="w-full bg-blue-500 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${Math.max(6, studyHeight)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Day Label */}
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Tasks Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-cyan-500" />
          <span>Focus Time</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Study Sessions</span>
        </div>
      </div>
    </div>
  );
};
