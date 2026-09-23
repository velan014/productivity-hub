import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProjectPriority, ProjectStatus } from '../../types';
import { cn } from '../../utils/cn';

interface ProjectFilterBarProps {
  status: ProjectStatus | 'all';
  onStatusChange: (status: ProjectStatus | 'all') => void;
  priority: ProjectPriority | 'all';
  onPriorityChange: (priority: ProjectPriority | 'all') => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  search,
  onSearchChange,
}) => {
  const tabs: { label: string; value: ProjectStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Planning', value: 'planning' },
    { label: 'Completed', value: 'completed' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Filter Controls: Search & Priority */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
          />
        </div>

        {/* Priority Select */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as ProjectPriority | 'all')}
            className="py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onStatusChange(tab.value)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px]',
              status === tab.value
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
