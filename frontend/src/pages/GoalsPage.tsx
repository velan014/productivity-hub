import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Target, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { goalApi } from '../services/goalApi';
import { Goal, GoalFilters } from '../types';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';

export const GoalsPage: React.FC = () => {
  const { success, error } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState<GoalFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
    sortBy: 'target_date',
    sortOrder: 'asc',
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await goalApi.getGoals(filters);
      setGoals(res.data.goals || []);
    } catch (err: any) {
      error(err.message || 'Unable to load goals');
    } finally {
      setIsLoading(false);
    }
  }, [filters, error]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await goalApi.getCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle Create / Edit save
  const handleSaveGoal = async (data: Partial<Goal>) => {
    if (editingGoal) {
      await goalApi.updateGoal(editingGoal.id, data);
      success('Goal updated successfully');
    } else {
      await goalApi.createGoal(data);
      success('Goal created successfully');
    }
    fetchGoals();
    fetchCategories();
  };

  // Handle progress change
  const handleProgressChange = async (goal: Goal, progress: number) => {
    try {
      const res = await goalApi.updateProgress(goal.id, progress);
      if (res.data.goal.status === 'completed' && goal.status !== 'completed') {
        success('🎉 Goal completed! Fantastic achievement!');
      } else if (res.data.goal.status === 'active' && goal.status === 'completed') {
        success('Goal reopened');
      } else {
        success('Progress updated');
      }
      fetchGoals();
    } catch (err: any) {
      error(err.message || 'Failed to update progress');
    }
  };

  // Handle Delete
  const handleDeleteGoal = async () => {
    if (!deletingGoal) return;
    try {
      setIsDeleting(true);
      await goalApi.deleteGoal(deletingGoal.id);
      success('Goal deleted');
      setDeletingGoal(null);
      fetchGoals();
      fetchCategories();
    } catch (err: any) {
      error(err.message || 'Failed to delete goal');
    } finally {
      setIsDeleting(false);
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Goals
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Track what you want to accomplish.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-sm"
        >
          + New Goal
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 dark:border-slate-800">
          {[
            { key: 'all', label: `All Goals (${goals.length})` },
            { key: 'active', label: `Active (${activeGoals.length})` },
            { key: 'completed', label: `Completed (${completedGoals.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilters((prev) => ({ ...prev, status: tab.key as any }))}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filters.status === tab.key
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search goals..."
              value={filters.search || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filters.category || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.priority || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value as any }))}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-3 w-full rounded-full mt-4" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-8 h-8 text-emerald-500" />}
          title="No goals yet"
          description="Create a goal and start tracking your progress."
          actionText="+ New Goal"
          actionIcon={<Plus className="w-4 h-4" />}
          onAction={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(g) => {
                setEditingGoal(g);
                setIsModalOpen(true);
              }}
              onDelete={(g) => setDeletingGoal(g)}
              onProgressChange={handleProgressChange}
            />
          ))}
        </div>
      )}

      {/* Goal Modal (Create / Edit) */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSave={handleSaveGoal}
        onDelete={(g) => {
          setIsModalOpen(false);
          setDeletingGoal(g);
        }}
      />

      {/* Delete Modal */}
      <Modal
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        title="Delete Goal"
        description="Are you sure you want to delete this goal? This action cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            "{deletingGoal?.title}"
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDeletingGoal(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteGoal}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
