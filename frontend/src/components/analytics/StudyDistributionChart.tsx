import React from 'react';

interface StudyItem {
  name: string;
  hours: number;
  color: string;
}

interface StudyDistributionChartProps {
  data: StudyItem[];
}

export const StudyDistributionChart: React.FC<StudyDistributionChartProps> = ({ data }) => {
  const totalHours = data.reduce((acc, curr) => acc + curr.hours, 0);

  if (data.length === 0 || totalHours === 0) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Study Time by Subject
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distribution across course subjects
          </p>
        </div>
        <div className="py-8 text-center text-xs text-slate-400">
          No study sessions logged yet. Log sessions to see subject distribution.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Study Time by Subject
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribution across course subjects ({totalHours} total hours)
        </p>
      </div>

      {/* Progress Bars Stack */}
      <div className="space-y-3.5">
        {data.map((item) => {
          const pct = totalHours > 0 ? Math.round((item.hours / totalHours) * 100) : 0;

          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {item.name}
                </span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">
                  {item.hours} hrs ({pct}%)
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color || '#3b82f6',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
