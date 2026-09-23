import React from 'react';

interface Slice {
  name: string;
  value: number;
  color: string;
}

interface TaskDonutChartProps {
  data: Slice[];
}

export const TaskDonutChart: React.FC<TaskDonutChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const completedItem = data.find((d) => d.name === 'Completed');
  const completionPercentage = total > 0 ? Math.round(((completedItem?.value || 0) / total) * 100) : 0;

  // Calculate SVG stroke dashes
  let cumulative = 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Task Completion Rate
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Task status breakdown
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="12"
              fill="transparent"
            />

            {/* Slices */}
            {total > 0 &&
              data.map((slice) => {
                if (slice.value <= 0) return null;
                const slicePercent = slice.value / total;
                const strokeDasharray = `${slicePercent * circumference} ${circumference}`;
                const strokeDashoffset = -cumulative * circumference;
                cumulative += slicePercent;

                return (
                  <circle
                    key={slice.name}
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={slice.color}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="transparent"
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                );
              })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {completionPercentage}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Done
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 w-full sm:w-auto">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between sm:justify-start gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
