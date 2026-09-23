import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Repeat, Flame } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { habitApi } from '../services/habitApi';
import { HabitWithStats, Habit } from '../types';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitModal } from '../components/habits/HabitModal';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';

export const HabitsPage: React.FC = () => {
  const { success, error } = useToast();
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHabits = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await habitApi.getHabits();
      setHabits(res.data.habits || []);
    } catch (err: any) {
      error(err.message || 'Unable to load habits');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Handle Create / Edit save
  const handleSaveHabit = async (data: Partial<Habit>) => {
    if (editingHabit) {
      await habitApi.updateHabit(editingHabit.id, data);
      success('Habit updated successfully');
    } else {
      await habitApi.createHabit(data);
      success('Habit created successfully');
    }
    fetchHabits();
  };

  // Toggle habit for today
  const handleToggleToday = async (habit: HabitWithStats) => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (habit.isCompletedToday) {
        await habitApi.removeLog(habit.id, todayStr);
        success(`Habit '${habit.name}' uncompleted for today`);
      } else {
        await habitApi.logHabit(habit.id, todayStr, true);
        success(`🔥 Habit '${habit.name}' completed! Keep the streak going!`);
      }
      fetchHabits();
    } catch (err: any) {
      error(err.message || 'Failed to update habit');
    }
  };

  // Delete habit
  const handleDeleteHabit = async () => {
    if (!deletingHabit) return;
    try {
      setIsDeleting(true);
      await habitApi.deleteHabit(deletingHabit.id);
      success('Habit deleted');
      setDeletingHabit(null);
      fetchHabits();
    } catch (err: any) {
      error(err.message || 'Failed to delete habit');
    } finally {
      setIsDeleting(false);
    }
  };

  const todayCompletedCount = habits.filter((h) => h.isCompletedToday).length;
  const totalHabitsCount = habits.length;
  const completionPercentage = totalHabitsCount > 0 ? Math.round((todayCompletedCount / totalHabitsCount) * 100) : 0;
  const longestCurrentStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Habits
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Build consistency and keep your daily momentum alive.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingHabit(null);
            setIsModalOpen(true);
          }}
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-sm"
        >
          + New Habit
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Completion
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {todayCompletedCount} / {totalHabitsCount} Habits
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
            {completionPercentage}%
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Active Streak
            </span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
              {longestCurrentStreak} Days
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Repeat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          Today's Habits
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <Skeleton className="h-6 w-1/3 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-8 w-full rounded-xl mt-3" />
              </div>
            ))}
          </div>
        ) : habits.length === 0 ? (
          <EmptyState
            icon={<Repeat className="w-8 h-8 text-emerald-500" />}
            title="No habits yet"
            description="Add a small habit you want to build every day."
            actionText="+ New Habit"
            actionIcon={<Plus className="w-4 h-4" />}
            onAction={() => {
              setEditingHabit(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleToday={handleToggleToday}
                onEdit={(h) => {
                  setEditingHabit(h);
                  setIsModalOpen(true);
                }}
                onDelete={(h) => setDeletingHabit(h)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        habit={editingHabit}
        onSave={handleSaveHabit}
        onDelete={(h) => {
          setIsModalOpen(false);
          setDeletingHabit(h);
        }}
      />

      {/* Delete Modal */}
      <Modal
        isOpen={!!deletingHabit}
        onClose={() => setDeletingHabit(null)}
        title="Delete Habit"
        description="Are you sure you want to delete this habit and all its history? This action cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            "{deletingHabit?.name}"
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDeletingHabit(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteHabit}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
