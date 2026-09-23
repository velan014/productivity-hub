import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckSquare,
  Target,
  Repeat,
  Timer,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { calendarApi } from '../services/calendarApi';
import { taskApi } from '../services/taskApi';
import { CalendarAggregation, Task } from '../types';
import { TaskModal } from '../components/tasks/TaskModal';
import { Button } from '../components/common/Button';
import { PriorityBadge } from '../components/common/Badge';
import { formatDate, formatTime } from '../utils/date';
import { cn } from '../utils/cn';

export const CalendarPage: React.FC = () => {
  const { success, error } = useToast();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const [aggregation, setAggregation] = useState<CalendarAggregation | null>(null);

  // Task modal for adding task directly to selected date
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToCreate, setTaskToCreate] = useState<Partial<Task> | null>(null);

  // Fetch calendar events for current month
  const fetchCalendar = useCallback(async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Start from 1st of month, end at last day of month
      const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
      const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

      const res = await calendarApi.getCalendarEvents(startDate, endDate);
      setAggregation(res.data);
    } catch (err: any) {
      error(err.message || 'Unable to load calendar events');
    }
  }, [currentDate, error]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().slice(0, 10));
  };

  // Generate calendar grid days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create grid cells
  const monthDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    monthDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    monthDays.push(dStr);
  }

  // Aggregate daily items
  const tasksForSelected = (aggregation?.tasks || []).filter((t) => t.due_date?.slice(0, 10) === selectedDateStr);
  const goalsForSelected = (aggregation?.goals || []).filter((g) => g.target_date?.slice(0, 10) === selectedDateStr);
  const habitsForSelected = (aggregation?.habitLogs || []).filter((h) => {
    const d = typeof h.log_date === 'string' ? h.log_date.slice(0, 10) : new Date(h.log_date).toISOString().slice(0, 10);
    return d === selectedDateStr;
  });
  const focusForSelected = (aggregation?.focusSessions || []).filter((f) => {
    const d = new Date(f.started_at).toISOString().slice(0, 10);
    return d === selectedDateStr;
  });

  const totalFocusMinutesSelected = focusForSelected.reduce((acc, f) => acc + f.actual_minutes, 0);

  // Check items per day for event dots/chips on the calendar grid
  const getDayMeta = (dateStr: string) => {
    const dayTasks = (aggregation?.tasks || []).filter((t) => t.due_date?.slice(0, 10) === dateStr);
    const dayGoals = (aggregation?.goals || []).filter((g) => g.target_date?.slice(0, 10) === dateStr);
    const dayHabits = (aggregation?.habitLogs || []).filter((h) => {
      const d = typeof h.log_date === 'string' ? h.log_date.slice(0, 10) : new Date(h.log_date).toISOString().slice(0, 10);
      return d === dateStr;
    });
    const dayFocus = (aggregation?.focusSessions || []).filter((f) => new Date(f.started_at).toISOString().slice(0, 10) === dateStr);

    return {
      tasksCount: dayTasks.length,
      goalsCount: dayGoals.length,
      habitsCount: dayHabits.length,
      focusCount: dayFocus.length,
      hasAny: dayTasks.length > 0 || dayGoals.length > 0 || dayHabits.length > 0 || dayFocus.length > 0,
    };
  };

  // Toggle task complete
  const handleToggleTask = async (task: Task) => {
    try {
      await taskApi.toggleComplete(task.id);
      success('Task updated');
      fetchCalendar();
    } catch (err: any) {
      error(err.message || 'Failed to update task');
    }
  };

  // Pre-fill task modal with selected date
  const handleOpenAddTask = () => {
    setTaskToCreate({
      due_date: selectedDateStr,
      priority: 'medium',
      category: 'General',
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      await taskApi.createTask({
        ...taskData,
        due_date: taskData.due_date || selectedDateStr,
      });
      success('Task created and added to schedule');
      setIsTaskModalOpen(false);
      setTaskToCreate(null);
      fetchCalendar();
    } catch (err: any) {
      error(err.message || 'Failed to save task');
      throw err;
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Calendar
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Unified view of tasks, goals, habits, and focus sprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={goToToday}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Today
          </Button>
          <Button
            onClick={handleOpenAddTask}
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            + Add Task
          </Button>
        </div>
      </div>

      {/* Main Grid: Month Calendar on Left, Selected Day Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Month Calendar (7 cols on lg) */}
        <div className="lg:col-span-7 p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          {/* Month & Nav Controls */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] uppercase tracking-wider text-slate-400 py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthDays.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-12 sm:h-16 rounded-xl" />;
              }

              const dayNum = parseInt(dateStr.split('-')[2], 10);
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === todayStr;
              const meta = getDayMeta(dateStr);

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={cn(
                    'h-12 sm:h-16 rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all text-left relative group',
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20 scale-[1.02]'
                      : isToday
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-transparent'
                  )}
                >
                  <span className={cn('text-xs sm:text-sm font-bold', isSelected ? 'text-white' : '')}>
                    {dayNum}
                  </span>

                  {/* Indicators / Chips */}
                  {meta.hasAny && (
                    <div className="flex items-center gap-1 justify-center">
                      {meta.tasksCount > 0 && (
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? 'bg-white' : 'bg-emerald-500'
                        )} />
                      )}
                      {meta.goalsCount > 0 && (
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? 'bg-white' : 'bg-indigo-500'
                        )} />
                      )}
                      {meta.habitsCount > 0 && (
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? 'bg-white' : 'bg-amber-500'
                        )} />
                      )}
                      {meta.focusCount > 0 && (
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? 'bg-white' : 'bg-cyan-500'
                        )} />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Tasks
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Goals
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Habits
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500" /> Focus
            </span>
          </div>
        </div>

        {/* Right: Selected Day Timeline Details (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            {/* Selected Date Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatDate(selectedDateStr)}
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedDateStr === todayStr ? 'Today' : 'Scheduled activities'}
                </span>
              </div>

              <Button
                onClick={handleOpenAddTask}
                size="sm"
                variant="outline"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Task
              </Button>
            </div>

            {/* 1. Tasks Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                  Tasks ({tasksForSelected.length})
                </span>
              </div>

              {tasksForSelected.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1">No tasks due.</p>
              ) : (
                <div className="space-y-2">
                  {tasksForSelected.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between gap-3 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task)}
                          className={cn(
                            'w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center transition-colors shrink-0',
                            task.status === 'completed'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          )}
                        >
                          {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <div className="min-w-0">
                          <p className={cn(
                            'text-xs font-semibold text-slate-900 dark:text-slate-100 truncate',
                            task.status === 'completed' && 'line-through text-slate-400'
                          )}>
                            {task.title}
                          </p>
                          {task.due_time && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatTime(task.due_time)}
                            </span>
                          )}
                        </div>
                      </div>
                      <PriorityBadge priority={task.priority} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Goals Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                Target Goals ({goalsForSelected.length})
              </span>

              {goalsForSelected.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1">No goal deadlines.</p>
              ) : (
                <div className="space-y-2">
                  {goalsForSelected.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                        <span>{goal.title}</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{goal.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Habits Logged Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Repeat className="w-3.5 h-3.5 text-amber-500" />
                Habits Completed ({habitsForSelected.length})
              </span>

              {habitsForSelected.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1">No habits logged.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {habitsForSelected.map((h) => (
                    <span
                      key={h.id}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 flex items-center gap-1"
                    >
                      ✓ {h.habit_name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Focus Sprints Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Timer className="w-3.5 h-3.5 text-cyan-500" />
                Focus Sprints ({focusForSelected.length} sessions — {totalFocusMinutesSelected} mins)
              </span>

              {focusForSelected.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1">No focus sessions.</p>
              ) : (
                <div className="space-y-1.5">
                  {focusForSelected.map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 text-xs flex items-center justify-between border border-cyan-100 dark:border-cyan-900/40"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {f.task_title || 'General Focus'}
                      </span>
                      <span className="font-bold text-cyan-700 dark:text-cyan-400">
                        {f.actual_minutes}m ({formatTime(f.started_at)})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal with Pre-filled Date */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToCreate(null);
        }}
        task={taskToCreate as any}
        onSave={handleSaveTask}
      />
    </div>
  );
};
