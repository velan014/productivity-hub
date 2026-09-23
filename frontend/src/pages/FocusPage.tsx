import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Timer, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { focusApi } from '../services/focusApi';
import { taskApi } from '../services/taskApi';
import { FocusMode, FocusSession, FocusStats, Task } from '../types';
import { Button } from '../components/common/Button';
import { formatTime, formatDate } from '../utils/date';
import { cn } from '../utils/cn';

const MODE_DURATIONS: { [key in FocusMode]: number } = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const FocusPage: React.FC = () => {
  const { success, error } = useToast();

  const [mode, setMode] = useState<FocusMode>('focus');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(MODE_DURATIONS.focus);
  const [remainingSeconds, setRemainingSeconds] = useState(MODE_DURATIONS.focus);

  // Timestamp-based timing references to avoid drift/throttling in inactive tabs
  const endTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);

  // Stats and history
  const [stats, setStats] = useState<FocusStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);

  // Fetch initial stats, history, and available tasks
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, sessionsRes, tasksRes] = await Promise.all([
        focusApi.getStats(),
        focusApi.getSessions(15),
        taskApi.getTasks({ status: 'todo' }),
      ]);
      setStats(statsRes.data.stats);
      setRecentSessions(sessionsRes.data.sessions || []);
      setTasks(tasksRes.data.tasks || []);
    } catch (err: any) {
      error(err.message || 'Unable to load focus data');
    }
  }, [error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mode change handler
  const handleModeChange = (newMode: FocusMode) => {
    if (isRunning) {
      if (!window.confirm('Timer is active. Switch mode and reset timer?')) {
        return;
      }
    }
    clearInterval(timerIntervalRef.current);
    setIsRunning(false);
    endTimeRef.current = null;
    sessionStartTimeRef.current = null;

    setMode(newMode);
    const duration = MODE_DURATIONS[newMode];
    setTotalSeconds(duration);
    setRemainingSeconds(duration);
  };

  // Timer tick effect based on Date.now()
  useEffect(() => {
    if (isRunning && endTimeRef.current) {
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.round((endTimeRef.current! - now) / 1000));
        setRemainingSeconds(diff);

        if (diff <= 0) {
          clearInterval(timerIntervalRef.current);
          handleSessionComplete();
        }
      }, 250);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isRunning]);

  // Start timer
  const handleStart = () => {
    const duration = remainingSeconds;
    endTimeRef.current = Date.now() + duration * 1000;
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    }
    setIsRunning(true);
  };

  // Pause timer
  const handlePause = () => {
    setIsRunning(false);
    endTimeRef.current = null;
  };

  // Reset timer
  const handleReset = () => {
    clearInterval(timerIntervalRef.current);
    setIsRunning(false);
    endTimeRef.current = null;
    sessionStartTimeRef.current = null;
    const duration = MODE_DURATIONS[mode];
    setRemainingSeconds(duration);
  };

  // Complete session and save to MySQL
  const handleSessionComplete = async () => {
    setIsRunning(false);
    endTimeRef.current = null;

    const plannedMinutes = Math.round(totalSeconds / 60);
    const actualMinutes = plannedMinutes; // Full completion
    const startTime = sessionStartTimeRef.current ? sessionStartTimeRef.current.toISOString() : new Date().toISOString();
    const endTime = new Date().toISOString();

    try {
      await focusApi.saveSession({
        task_id: selectedTaskId || null,
        mode,
        planned_minutes: plannedMinutes,
        actual_minutes: actualMinutes,
        started_at: startTime,
        ended_at: endTime,
        completed: true,
      });

      if (mode === 'focus') {
        success(`🎉 Focus session complete (${actualMinutes}m)! Great job staying focused!`);
      } else {
        success('Break finished! Ready to focus again?');
      }

      // Reset timer
      sessionStartTimeRef.current = null;
      setRemainingSeconds(totalSeconds);

      // Refresh stats
      fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to record focus session');
    }
  };

  // Manually finish session early and log progress
  const handleEarlyComplete = async () => {
    if (!sessionStartTimeRef.current) return;
    const elapsedSeconds = totalSeconds - remainingSeconds;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    try {
      await focusApi.saveSession({
        task_id: selectedTaskId || null,
        mode,
        planned_minutes: Math.round(totalSeconds / 60),
        actual_minutes: elapsedMinutes,
        started_at: sessionStartTimeRef.current.toISOString(),
        ended_at: new Date().toISOString(),
        completed: true,
      });

      success(`Session logged (${elapsedMinutes} mins).`);
      handleReset();
      fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to save session');
    }
  };

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPct = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Focus & Pomodoro
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Deep focus sprints with reliable timestamp-based tracking.
          </p>
        </div>
      </div>

      {/* Main Timer Section */}
      <div className="max-w-2xl mx-auto">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-8 max-w-full overflow-x-auto">
            <button
              onClick={() => handleModeChange('focus')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px]',
                mode === 'focus'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              🎯 Focus (25m)
            </button>
            <button
              onClick={() => handleModeChange('short_break')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px]',
                mode === 'short_break'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              ☕ Short Break (5m)
            </button>
            <button
              onClick={() => handleModeChange('long_break')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px]',
                mode === 'long_break'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              🧘 Long Break (15m)
            </button>
          </div>

          {/* Big Countdown Digits */}
          <div className="my-6">
            <span className="text-6xl sm:text-8xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tighter select-none">
              {formatTimer(remainingSeconds)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 mb-8">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                mode === 'focus' && 'bg-gradient-to-r from-emerald-500 to-teal-400',
                mode === 'short_break' && 'bg-gradient-to-r from-cyan-500 to-blue-400',
                mode === 'long_break' && 'bg-gradient-to-r from-indigo-500 to-purple-400'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Task Link Selector */}
          <div className="max-w-md mx-auto mb-8 text-left">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Focus on: (Optional)
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              disabled={isRunning}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            >
              <option value="">No task selected (General Focus)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category || 'General'})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            {isRunning ? (
              <Button
                onClick={handlePause}
                size="lg"
                variant="outline"
                leftIcon={<Pause className="w-5 h-5" />}
                className="px-8 min-w-[140px]"
              >
                Pause
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                size="lg"
                leftIcon={<Play className="w-5 h-5" />}
                className="px-8 min-w-[140px] shadow-md shadow-emerald-500/20"
              >
                {remainingSeconds < totalSeconds ? 'Resume' : 'Start Focus'}
              </Button>
            )}

            <Button
              onClick={handleReset}
              size="lg"
              variant="ghost"
              leftIcon={<RotateCcw className="w-5 h-5" />}
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              Reset
            </Button>

            {isRunning && remainingSeconds < totalSeconds && (
              <Button
                onClick={handleEarlyComplete}
                size="lg"
                variant="outline"
                leftIcon={<Check className="w-4 h-4" />}
                title="Finish & Save Session"
                className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
              >
                Finish Early
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Focus Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Today's Focus
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {stats?.todayFocusMinutes || 0} mins
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Today's Sessions
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats?.todaySessionsCount || 0}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Past 7 Days
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {stats?.weekFocusMinutes || 0} mins
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Completed
          </span>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">
            {stats?.completedSessionsCount || 0}
          </div>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Timer className="w-4 h-4 text-emerald-500" />
          Recent Focus Sessions
        </h3>

        {recentSessions.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
            No focus sessions recorded yet. Start your first sprint above!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {session.task_title ? `Task: ${session.task_title}` : 'General Focus Session'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(session.started_at)} at {formatTime(session.started_at)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{session.actual_minutes} mins
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase font-medium">
                    {session.mode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
