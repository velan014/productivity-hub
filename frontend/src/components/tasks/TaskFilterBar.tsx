import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { TaskFilters, TaskPriority } from '../../types';
import { cn } from '../../utils/cn';

interface TaskFilterBarProps {
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  categories: string[];
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onFilterChange,
  categories,
}) => {
  const tabs = [
    { id: 'all', label: 'All Tasks' },
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'completed', label: 'Completed' },
  ];

  const handleTabChange = (tab: any) => {
    onFilterChange({ ...filters, tab });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleClearSearch = () => {
    onFilterChange({ ...filters, search: '' });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, priority: e.target.value as TaskPriority | 'all' });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value as any });
  };

  const toggleSortOrder = () => {
    const nextOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({ ...filters, sortOrder: nextOrder });
  };

  return (
    <div className="space-y-3.5">
      {/* Search and Secondary Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Instant Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, description, or category..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm min-h-[44px]"
          />
          {filters.search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters row */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Priority filter */}
          <select
            value={filters.priority || 'all'}
            onChange={handlePriorityChange}
            className="px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm min-h-[44px] flex-1 sm:flex-none"
            aria-label="Filter by priority"
          >
            <option value="all">Priority: All</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Category filter */}
          <select
            value={filters.category || 'all'}
            onChange={handleCategoryChange}
            className="px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm min-h-[44px] flex-1 sm:flex-none"
            aria-label="Filter by category"
          >
            <option value="all">Category: All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={filters.sortBy || 'due_date'}
            onChange={handleSortChange}
            className="px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm min-h-[44px] flex-1 sm:flex-none"
            aria-label="Sort tasks by"
          >
            <option value="due_date">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="created_at">Sort: Created Date</option>
            <option value="title">Sort: Title</option>
          </select>

          {/* Sort order toggle button */}
          <button
            type="button"
            onClick={toggleSortOrder}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm shrink-0"
            title={`Sort Order: ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            aria-label="Toggle sort order"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = (filters.tab || 'all') === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap min-h-[38px] flex items-center shrink-0',
                isActive
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
