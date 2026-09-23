import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { morningPlanApi } from '../services/morningPlanApi';
import { taskApi } from '../services/taskApi';
import { MorningPlanWithTasks, Task } from '../types';
import { PrioritySlots } from '../components/morningPlan/PrioritySlots';
import { IntentionCard } from '../components/morningPlan/IntentionCard';
import { Button } from '../components/common/Button';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { formatDate } from '../utils/date';

export const MorningPlanningPage: React.FC = () => {
  const { success, error } = useToast();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [plan, setPlan] = useState<MorningPlanWithTasks | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [priority1, setPriority1] = useState('');
  const [priority2, setPriority2] = useState('');
  const [priority3, setPriority3] = useState('');
  const [priority1TaskId, setPriority1TaskId] = useState('');
  const [priority2TaskId, setPriority2TaskId] = useState('');
  const [priority3TaskId, setPriority3TaskId] = useState('');
  const [plannedStudyMinutes, setPlannedStudyMinutes] = useState(0);
  const [plannedFocusMinutes, setPlannedFocusMinutes] = useState(0);
  const [intention, setIntention] = useState('');
  const [notes, setNotes] = useState('');

  const fetchPlanAndTasks = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      const [planRes, taskRes] = await Promise.all([
        morningPlanApi.getPlanByDate(date),
        taskApi.getTasks({ status: 'todo' }),
      ]);

      const fetchedPlan = planRes.data.plan;
      setPlan(fetchedPlan);
      setTasks(taskRes.data.tasks);

      if (fetchedPlan) {
        setPriority1(fetchedPlan.priority_1 || '');
        setPriority2(fetchedPlan.priority_2 || '');
        setPriority3(fetchedPlan.priority_3 || '');
        setPriority1TaskId(fetchedPlan.priority_1_task_id || '');
        setPriority2TaskId(fetchedPlan.priority_2_task_id || '');
        setPriority3TaskId(fetchedPlan.priority_3_task_id || '');
        setPlannedStudyMinutes(fetchedPlan.planned_study_minutes || 0);
        setPlannedFocusMinutes(fetchedPlan.planned_focus_minutes || 0);
        setIntention(fetchedPlan.intention || '');
        setNotes(fetchedPlan.notes || '');
      } else {
        setPriority1('');
        setPriority2('');
        setPriority3('');
        setPriority1TaskId('');
        setPriority2TaskId('');
        setPriority3TaskId('');
        setPlannedStudyMinutes(60);
        setPlannedFocusMinutes(50);
        setIntention('');
        setNotes('');
      }
    } catch (err: any) {
      console.error('Failed to load morning plan:', err);
      error(err.message || 'Unable to load morning plan');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchPlanAndTasks(selectedDate);
  }, [selectedDate, fetchPlanAndTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!priority1.trim()) {
      error('Please specify at least Priority 1 (Crucial MIT)');
      return;
    }

    setIsSubmitting(true);
    setSavedSuccess(false);

    try {
      await morningPlanApi.savePlan({
        plan_date: selectedDate,
        priority_1: priority1.trim(),
        priority_2: priority2.trim() || null,
        priority_3: priority3.trim() || null,
        priority_1_task_id: priority1TaskId || null,
        priority_2_task_id: priority2TaskId || null,
        priority_3_task_id: priority3TaskId || null,
        planned_study_minutes: plannedStudyMinutes,
        planned_focus_minutes: plannedFocusMinutes,
        intention: intention.trim() || null,
        notes: notes.trim() || null,
      });

      success('Morning plan saved successfully');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      fetchPlanAndTasks(selectedDate);
    } catch (err: any) {
      error(err.message || 'Failed to save morning plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === todayStr;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header with Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sun className="w-4 h-4" />
            <span>Daily Kickoff</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Morning Planning
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Define your Top 3 priorities and set clear intentions before starting work
          </p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={() => handleShiftDate(-1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 text-xs font-bold text-slate-900 dark:text-slate-100">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>{formatDate(selectedDate)}</span>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-extrabold">
                Today
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleShiftDate(1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* 2. Top 3 Priorities */}
          <PrioritySlots
            priority1={priority1}
            onPriority1Change={setPriority1}
            priority2={priority2}
            onPriority2Change={setPriority2}
            priority3={priority3}
            onPriority3Change={setPriority3}
            priority1TaskId={priority1TaskId}
            onPriority1TaskIdChange={setPriority1TaskId}
            priority2TaskId={priority2TaskId}
            onPriority2TaskIdChange={setPriority2TaskId}
            priority3TaskId={priority3TaskId}
            onPriority3TaskIdChange={setPriority3TaskId}
            tasks={tasks}
          />

          {/* 3. Intention & Time Targets */}
          <IntentionCard
            intention={intention}
            onIntentionChange={setIntention}
            plannedFocusMinutes={plannedFocusMinutes}
            onPlannedFocusChange={setPlannedFocusMinutes}
            plannedStudyMinutes={plannedStudyMinutes}
            onPlannedStudyChange={setPlannedStudyMinutes}
            notes={notes}
            onNotesChange={setNotes}
          />

          {/* Save Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            {savedSuccess ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Morning plan active for {selectedDate}! Go crush it! 🔥</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                {plan ? 'Plan exists for this date. Saving will update your priorities.' : 'No morning plan saved for this date yet.'}
              </div>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-sm"
            >
              {plan ? 'Update Morning Plan' : 'Lock in Morning Plan'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
