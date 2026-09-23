import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Task, TaskPriority, TaskStatus, ProjectWithStats } from '../../types';
import { Trash2 } from 'lucide-react';
import { projectApi } from '../../services/projectApi';
import { cn } from '../../utils/cn';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  onDelete?: (task: Task) => void;
  categories?: string[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
  categories = ['Work', 'Study', 'Personal', 'Development', 'Projects', 'General'],
}) => {
  const isEditing = !!task;
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [projectsList, setProjectsList] = useState<ProjectWithStats[]>([]);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (isOpen) {
      projectApi.getProjects({ status: 'all' })
        .then((res) => setProjectsList(res.data.projects))
        .catch((err) => console.error('Failed to fetch projects in TaskModal:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setProjectId(task.project_id || '');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'todo');
      setCategory(task.category || 'General');
      setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
      setDueTime(task.due_time ? task.due_time.slice(0, 5) : '');
      setEstimatedMinutes(task.estimated_minutes !== null ? String(task.estimated_minutes) : '');
    } else {
      // Defaults for new task
      setTitle('');
      setDescription('');
      setProjectId('');
      setPriority('medium');
      setStatus('todo');
      setCategory('General');
      setDueDate(new Date().toISOString().slice(0, 10)); // Default due today
      setDueTime('');
      setEstimatedMinutes('');
    }
    setErrors({});

    // Autofocus title input after modal opens
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrors({ title: 'Task title is required' });
      titleInputRef.current?.focus();
      return;
    }

    try {
      setIsLoading(true);
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        project_id: projectId || null,
        priority,
        status,
        category: category.trim() || 'General',
        due_date: dueDate || null,
        due_time: dueTime ? `${dueTime}:00` : null,
        estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek') => {
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (type === 'nextWeek') {
      d.setDate(d.getDate() + 7);
    }
    setDueDate(d.toISOString().slice(0, 10));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description={isEditing ? 'Update task details or change status' : 'Add a task to organize your day'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Title */}
        <Input
          ref={titleInputRef}
          label="Task Title * (Required)"
          placeholder="e.g. Complete project documentation"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({});
          }}
          error={errors.title}
          autoComplete="off"
        />

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Add extra context, checklist notes, or instructions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:focus:border-emerald-500"
          />
        </div>

        {/* Project Selector (Optional) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Project <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 min-h-[44px]"
          >
            <option value="">No Project (Independent Task)</option>
            {projectsList.map((p) => (
              <option key={p.id} value={p.id}>
                📁 {p.name} ({p.status})
              </option>
            ))}
          </select>
        </div>

        {/* Priority and Status row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Priority */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                const colors = {
                  low: isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300',
                  medium: isSelected ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300',
                  high: isSelected ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300',
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all text-center min-h-[44px] flex items-center justify-center',
                      isSelected
                        ? colors[p]
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300',
                      colors[p]
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 min-h-[44px]"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Category & Estimated Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Category <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              list="category-suggestions"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Work, Study, Projects"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 min-h-[44px]"
            />
            <datalist id="category-suggestions">
              {Array.from(new Set([...categories, 'Work', 'Study', 'Personal', 'Development', 'Projects', 'General'])).map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Estimated Duration <span className="text-slate-400 font-normal lowercase">(min)</span>
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 min-h-[44px]"
            />
          </div>
        </div>

        {/* Due Date & Time */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Due Date <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Due Time <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-400">Quick:</span>
            <button
              type="button"
              onClick={() => handleQuickDate('today')}
              className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate('tomorrow')}
              className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate('nextWeek')}
              className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Next Week
            </button>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          {isEditing && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (task) {
                  onClose();
                  onDelete(task);
                }
              }}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 w-full sm:w-auto"
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete Task
            </Button>
          ) : null}

          <div className={cn("flex items-center gap-2 w-full sm:w-auto", !isEditing && "sm:ml-auto")}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-1/2 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-1/2 sm:w-auto"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
