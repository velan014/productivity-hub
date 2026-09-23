import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Subject } from '../../types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: Subject | null;
  onSave: (data: Partial<Subject>) => Promise<void>;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  subject,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [targetHours, setTargetHours] = useState('');
  const [color, setColor] = useState('blue');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!subject;

  const colorOptions = [
    { label: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { label: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { label: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { label: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { label: 'Amber', value: 'amber', class: 'bg-amber-500' },
    { label: 'Rose', value: 'rose', class: 'bg-rose-500' },
    { label: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
  ];

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setCode(subject.code || '');
      setTargetHours(subject.target_hours ? String(subject.target_hours) : '0');
      setColor(subject.color || 'blue');
    } else {
      setName('');
      setCode('');
      setTargetHours('20');
      setColor('blue');
    }
    setErrors({});
  }, [subject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Subject name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        code: code.trim() || null,
        target_hours: targetHours ? parseFloat(targetHours) : 0,
        color,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save subject' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Subject' : 'Add New Subject'}
      description={
        isEdit
          ? 'Update course code, target hours, and subject details.'
          : 'Define a course or topic with semester study target hours.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {errors.form}
          </div>
        )}

        <Input
          label="Subject Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Database Management Systems"
          error={errors.name}
          required
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Course Code (Optional)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CS301"
          />

          <Input
            type="number"
            min="0"
            step="0.5"
            label="Target Hours"
            value={targetHours}
            onChange={(e) => setTargetHours(e.target.value)}
            placeholder="e.g. 30"
          />
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Subject Color
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
            {isEdit ? 'Save Subject' : 'Add Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
