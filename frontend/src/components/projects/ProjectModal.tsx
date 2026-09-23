import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';
import { Project, ProjectPriority, ProjectStatus } from '../../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSave: (data: Partial<Project>) => Promise<void>;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [priority, setPriority] = useState<ProjectPriority>('medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState('indigo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!project;

  const colorOptions = [
    { label: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { label: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { label: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { label: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { label: 'Rose', value: 'rose', class: 'bg-rose-500' },
    { label: 'Amber', value: 'amber', class: 'bg-amber-500' },
    { label: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
  ];

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setStatus(project.status);
      setPriority(project.priority);
      setStartDate(project.start_date ? project.start_date.slice(0, 10) : '');
      setDueDate(project.due_date ? project.due_date.slice(0, 10) : '');
      setColor(project.color || 'indigo');
    } else {
      setName('');
      setDescription('');
      setStatus('planning');
      setPriority('medium');
      setStartDate('');
      setDueDate('');
      setColor('indigo');
    }
    setErrors({});
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        status,
        priority,
        start_date: startDate || null,
        due_date: dueDate || null,
        color,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save project' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Project' : 'Create New Project'}
      description={
        isEdit
          ? 'Update project details, milestones, and timeline.'
          : 'Organize larger goals and collections of related tasks.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {errors.form}
          </div>
        )}

        <Input
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Smart Irrigation ML Project"
          error={errors.name}
          required
          autoFocus
        />

        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about? Objectives, scope, deliverables..."
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            options={[
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'archived', label: 'Archived' },
            ]}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ProjectPriority)}
            options={[
              { value: 'low', label: 'Low Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'high', label: 'High Priority' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date (Optional)"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            type="date"
            label="Due Date (Optional)"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Color Accent Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Color Theme
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {colorOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColor(opt.value)}
                className={`w-8 h-8 rounded-xl ${opt.class} flex items-center justify-center transition-all ${
                  color === opt.value
                    ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100 scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title={opt.label}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
