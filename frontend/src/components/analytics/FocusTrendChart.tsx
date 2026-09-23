import React, { useState } from 'react';

interface FocusTrendItem {
  day: string;
  date: string;
  minutes: number;
}

interface FocusTrendChartProps {
  data: FocusTrendItem[];
}

export const FocusTrendChart: React.FC<FocusTrendChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxMinutes = Math.max(...data.map((d) => d.minutes), 60);
  const totalMinutes = data.reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Daily Focus Activity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Minutes spent in deep focus sprints ({totalMinutes}m total)
          </p>
        </div>
      </div>

      <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 px-1 relative">
        {data.map((item, idx) => {
          const height = Math.min(100, Math.round((item.minutes / maxMinutes) * 100));
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.date}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
            >
              {isHovered && (
                <div className="absolute -top-8 z-20 px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-lg whitespace-nowrap">
                  {item.minutes} mins
                </div>
              )}

              <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-full flex items-end">
                <div
                  className="w-full bg-cyan-500 rounded-t-lg transition-all duration-500 group-hover:bg-cyan-400"
                  style={{ height: `${Math.max(6, height)}%` }}
                />
              </div>

              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
