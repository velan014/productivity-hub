import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';
import { Habit, HabitFrequency } from '../../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  onSave: (data: Partial<Habit>) => Promise<void>;
  onDelete?: (habit: Habit) => void;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  habit,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [color, setColor] = useState('emerald');
  const [icon, setIcon] = useState('Repeat');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || '');
      setCategory(habit.category || 'General');
      setFrequency(habit.frequency || 'daily');
      setColor(habit.color || 'emerald');
      setIcon(habit.icon || 'Repeat');
    } else {
      setName('');
      setDescription('');
      setCategory('General');
      setFrequency('daily');
      setColor('emerald');
      setIcon('Repeat');
    }
    setError('');
  }, [habit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim() || 'General',
        frequency,
        color,
        icon,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = [
    { name: 'emerald', bg: 'bg-emerald-500' },
    { name: 'cyan', bg: 'bg-cyan-500' },
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'indigo', bg: 'bg-indigo-500' },
    { name: 'purple', bg: 'bg-purple-500' },
    { name: 'rose', bg: 'bg-rose-500' },
    { name: 'amber', bg: 'bg-amber-500' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? 'Edit Habit' : 'Create New Habit'}
      description={habit ? 'Modify your habit frequency and target' : 'Build a daily routine to reach your personal best'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <Input
          label="Habit Name"
          required
          placeholder="e.g. Study 1 hour, Exercise, Drink water"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Why are you building this habit? Set your cue and reward."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Category"
            placeholder="e.g. Health, Study, Work"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Select
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
            ]}
          />
        </div>

        {/* Color Palette */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Accent Color
          </label>
          <div className="flex items-center gap-2 pt-1">
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                  color === c.name ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                aria-label={`Select ${c.name} color`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {habit && onDelete ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onDelete(habit)}
            >
              Delete Habit
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {habit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
