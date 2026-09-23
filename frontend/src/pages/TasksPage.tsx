import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, CheckSquare } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { taskApi } from '../services/taskApi';
import { Task, TaskFilters } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFilterBar } from '../components/tasks/TaskFilterBar';
import { TaskModal } from '../components/tasks/TaskModal';
import { DeleteConfirmModal } from '../components/tasks/DeleteConfirmModal';
import { TasksPageSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const TasksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state initialized from searchParams or defaults
  const [filters, setFilters] = useState<TaskFilters>({
    tab: (searchParams.get('tab') as any) || 'all',
    priority: 'all',
    status: 'all',
    category: 'all',
    search: '',
    sortBy: 'due_date',
    sortOrder: 'asc',
  });

  // Synchronize tab filter when URL search params change (e.g. from Dashboard navigation)
  useEffect(() => {
    const tabParam = (searchParams.get('tab') as any) || 'all';
    setFilters((prev) => (prev.tab !== tabParam ? { ...prev, tab: tabParam } : prev));
  }, [searchParams]);

  // Modal states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await taskApi.getCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await taskApi.getTasks(filters);
      setTasks(res.data.tasks || []);
    } catch (err: any) {
      error(err.message || 'Unable to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, error]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTasks();

    const handleTaskEvent = () => {
      fetchTasks();
      fetchCategories();
    };

    window.addEventListener('task:created', handleTaskEvent);
    window.addEventListener('task:updated', handleTaskEvent);

    return () => {
      window.removeEventListener('task:created', handleTaskEvent);
      window.removeEventListener('task:updated', handleTaskEvent);
    };
  }, [fetchTasks, fetchCategories]);

  // Sync tab change with URL query params
  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    if (newFilters.tab && newFilters.tab !== 'all') {
      setSearchParams({ tab: newFilters.tab });
    } else {
      setSearchParams({});
    }
  };

  // Toggle complete
  const handleToggleComplete = async (task: Task) => {
    try {
      const res = await taskApi.toggleComplete(task.id);
      const isCompleted = res.data.task.status === 'completed';
      if (isCompleted) {
        success('Task completed');
      } else {
        success('Task reopened');
      }
      fetchTasks();
      window.dispatchEvent(new CustomEvent('task:updated'));
    } catch (err: any) {
      error(err.message || 'Unable to update task completion');
    }
  };

  // Save task (create or update)
  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask.id, taskData);
        success('Task updated');
      } else {
        await taskApi.createTask(taskData);
        success('Task created');
      }
      fetchTasks();
      fetchCategories();
      window.dispatchEvent(new CustomEvent('task:updated'));
    } catch (err: any) {
      error(err.message || 'Unable to save task');
      throw err;
    }
  };

  // Delete task
  const handleDeleteTask = async (task: Task) => {
    try {
      await taskApi.deleteTask(task.id);
      success('Task deleted');
      fetchTasks();
      fetchCategories();
      window.dispatchEvent(new CustomEvent('task:updated'));
    } catch (err: any) {
      error(err.message || 'Unable to delete task');
      throw err;
    }
  };

  // Determine specific empty state message based on active filters
  const getEmptyStateContent = () => {
    if (filters.search) {
      return {
        title: 'No tasks match your search',
        description: `We couldn't find any tasks matching "${filters.search}". Try searching with different keywords.`,
        actionText: 'Clear search',
        actionIcon: undefined,
        onAction: () => setFilters({ ...filters, search: '' }),
      };
    }

    if (filters.tab === 'today') {
      return {
        title: 'No tasks due today',
        description: 'You have nothing scheduled for today. Plan ahead or enjoy your day.',
        actionText: '+ Add task for today',
        actionIcon: <Plus className="w-4 h-4" />,
        onAction: () => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        },
      };
    }

    if (filters.tab === 'upcoming') {
      return {
        title: 'Nothing scheduled yet',
        description: 'No upcoming tasks found. Create a task with a future due date to organize your week.',
        actionText: '+ Add upcoming task',
        actionIcon: <Plus className="w-4 h-4" />,
        onAction: () => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        },
      };
    }

    if (filters.tab === 'overdue') {
      return {
        title: 'No overdue tasks 🎉',
        description: 'All of your past due tasks are completed or cleared. Great work!',
        actionText: undefined,
        actionIcon: undefined,
        onAction: undefined,
      };
    }

    if (filters.tab === 'completed') {
      return {
        title: 'No completed tasks yet',
        description: 'Tasks you complete will be archived here for your reference.',
        actionText: undefined,
        actionIcon: undefined,
        onAction: undefined,
      };
    }

    if (filters.priority !== 'all' || filters.category !== 'all') {
      return {
        title: 'No matching tasks',
        description: 'No tasks match your selected priority or category filters.',
        actionText: 'Reset filters',
        actionIcon: undefined,
        onAction: () => setFilters({ ...filters, priority: 'all', category: 'all' }),
      };
    }

    return {
      title: 'No tasks yet',
      description: 'Add your first task and start organizing your day with ease.',
      actionText: '+ Add Task',
      actionIcon: <Plus className="w-4 h-4" />,
      onAction: () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
      },
    };
  };

  const emptyState = getEmptyStateContent();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Tasks
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Manage everything you need to get done.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-sm"
        >
          Add Task
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <TaskFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
      />

      {/* Task List Content */}
      {isLoading ? (
        <TasksPageSkeleton />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-7 h-7" />}
          title={emptyState.title}
          description={emptyState.description}
          actionText={emptyState.actionText}
          actionIcon={emptyState.actionIcon}
          onAction={emptyState.onAction}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
            <span>
              Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDelete={(t) => {
                setDeletingTask(t);
                setIsDeleteModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
        onDelete={(t) => {
          setDeletingTask(t);
          setIsDeleteModalOpen(true);
        }}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        task={deletingTask}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
};
