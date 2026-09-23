import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input, Textarea, Select } from '../common/Input';
import { Button } from '../common/Button';
import { StudySession, SubjectWithStats } from '../../types';
import { Clock, Calculator } from 'lucide-react';

interface StudySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectWithStats[];
  session?: StudySession | null;
  defaultSubjectId?: string;
  onSave: (data: Partial<StudySession>) => Promise<void>;
}

export const StudySessionModal: React.FC<StudySessionModalProps> = ({
  isOpen,
  onClose,
  subjects,
  session,
  defaultSubjectId,
  onSave,
}) => {
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!session;

  // Calculate live duration
  const getCalculatedDuration = (): { minutes: number; text: string } | null => {
    if (!startTime || !endTime) return null;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (endTotal <= startTotal) return null;

    const diff = endTotal - startTotal;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;

    let text = '';
    if (hours > 0) text += `${hours}h `;
    if (mins > 0 || hours === 0) text += `${mins}m`;
    return { minutes: diff, text: text.trim() };
  };

  const durationInfo = getCalculatedDuration();

  useEffect(() => {
    if (session) {
      setSubjectId(session.subject_id);
      setTitle(session.title);
      setDate(session.date ? session.date.slice(0, 10) : '');
      setStartTime(session.start_time ? session.start_time.slice(0, 5) : '');
      setEndTime(session.end_time ? session.end_time.slice(0, 5) : '');
      setNotes(session.notes || '');
    } else {
      setSubjectId(defaultSubjectId || (subjects.length > 0 ? subjects[0].id : ''));
      setTitle('');
      setDate(new Date().toISOString().slice(0, 10));

      // Defaults to 1 hour from current time
      const now = new Date();
      const curH = String(now.getHours()).padStart(2, '0');
      const curM = '00';
      const endH = String((now.getHours() + 1) % 24).padStart(2, '0');
      setStartTime(`${curH}:${curM}`);
      setEndTime(`${endH}:${curM}`);
      setNotes('');
    }
    setErrors({});
  }, [session, defaultSubjectId, subjects, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!subjectId) {
      newErrors.subjectId = 'Please select a subject';
    }
    if (!title.trim()) {
      newErrors.title = 'Session title is required';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }
    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      if (endTotal <= startTotal) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        subject_id: subjectId,
        title: title.trim(),
        date,
        start_time: startTime,
        end_time: endTime,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save study session' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Study Session' : 'Log Study Session'}
      description="Record dedicated study hours for your subjects."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {errors.form}
          </div>
        )}

        <Select
          label="Subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          error={errors.subjectId}
          required
          options={[
            { value: '', label: 'Select a Subject...' },
            ...subjects.map((s) => ({
              value: s.id,
              label: s.code ? `[${s.code}] ${s.name}` : s.name,
            })),
          ]}
        />

        <Input
          label="Session Topic / Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Chapter 4: Normalization & Indexing"
          error={errors.title}
          required
          autoFocus
        />

        <Input
          type="date"
          label="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
        />

        {/* Start and End Time with live duration feedback */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="time"
            label="Start Time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            error={errors.startTime}
            required
          />

          <Input
            type="time"
            label="End Time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            error={errors.endTime}
            required
          />
        </div>

        {/* Calculated Duration Display Badge */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Calculator className="w-4 h-4 text-blue-500" />
            <span>Calculated Duration:</span>
          </div>

          {durationInfo ? (
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {durationInfo.text} ({durationInfo.minutes} mins)
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400">
              {startTime && endTime ? 'Invalid time range' : 'Set start & end time'}
            </span>
          )}
        </div>

        <Textarea
          label="Notes & Key Takeaways (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Formulas, topics reviewed, next questions to solve..."
          rows={3}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Log Session'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
