import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';
import { Goal, GoalPriority, GoalStatus } from '../../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSave: (data: Partial<Goal>) => Promise<void>;
  onDelete?: (goal: Goal) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goal,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [status, setStatus] = useState<GoalStatus>('active');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setCategory(goal.category || 'General');
      setPriority(goal.priority || 'medium');
      setStatus(goal.status || 'active');
      setProgress(goal.progress || 0);
      setStartDate(goal.start_date ? goal.start_date.slice(0, 10) : '');
      setTargetDate(goal.target_date ? goal.target_date.slice(0, 10) : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('General');
      setPriority('medium');
      setStatus('active');
      setProgress(0);
      setStartDate(new Date().toISOString().slice(0, 10));
      setTargetDate('');
    }
    setError('');
  }, [goal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || 'General',
        priority,
        status,
        progress: Number(progress),
        start_date: startDate || null,
        target_date: targetDate || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal ? 'Edit Goal' : 'Create New Goal'}
      description={goal ? 'Update your goal target and progress' : 'Set a clear objective to track your progress'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <Input
          label="Goal Title"
          required
          placeholder="e.g. Run a half marathon, Learn Next.js"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Why is this goal important? What are the key milestones?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Category"
            placeholder="e.g. Career, Health, Learning"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as GoalPriority)}
            options={[
              { value: 'high', label: '🔥 High Priority' },
              { value: 'medium', label: '⚡ Medium Priority' },
              { value: 'low', label: '☕ Low Priority' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="Target Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        {goal && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Progress: {progress}%</span>
              <span>Status: <span className="capitalize">{status}</span></span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setProgress(val);
                if (val === 100) setStatus('completed');
                else if (val < 100 && status === 'completed') setStatus('active');
              }}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between gap-1 pt-1">
              {[0, 25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    setProgress(pct);
                    if (pct === 100) setStatus('completed');
                    else if (pct < 100 && status === 'completed') setStatus('active');
                  }}
                  className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                    progress === pct
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {goal && onDelete ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onDelete(goal)}
            >
              Delete Goal
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {goal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
