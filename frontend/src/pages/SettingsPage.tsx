import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Monitor,
  LogOut,
  Bell,
  Download,
  Upload,
  Shield,
  Bot,
  Palette,
  Check,
  Trophy,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { aiApi } from '../services/aiApi';
import { backupApi } from '../services/backupApi';
import { gamificationApi } from '../services/gamificationApi';
import { Button } from '../components/common/Button';
import { ThemeMode, AiStatus, GamificationProfile, NotificationPreferences } from '../types';
import { cn } from '../utils/cn';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const { success, error, info } = useToast();
  const { preferences, permission, requestPermission, updatePreferences } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'ai' | 'backup' | 'gamification'>('appearance');
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [gamification, setGamification] = useState<GamificationProfile | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [lastExportTime, setLastExportTime] = useState<string | null>(
    typeof localStorage !== 'undefined' ? localStorage.getItem('last_backup_export') : null
  );

  useEffect(() => {
    aiApi.getStatus().then(setAiStatus).catch(console.error);
    gamificationApi.getProfile().then(setGamification).catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    info('Logged out');
    navigate('/login');
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    setTheme(mode);
    success(`Theme set to ${mode}`);
  };

  const handleToggleNotification = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      await updatePreferences({ [key]: value });
      success('Notification preference updated');
    } catch {
      error('Failed to update preference');
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await backupApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `productivity-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const now = new Date().toLocaleString();
      setLastExportTime(now);
      localStorage.setItem('last_backup_export', now);
      success('Backup exported successfully!');
    } catch (err: any) {
      console.error('Export error:', err);
      error(err.message || 'Unable to export your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON format');
      }

      const result = await backupApi.importData(parsed);
      success(result.message || 'Backup imported successfully!');
    } catch (err: any) {
      console.error('Import error:', err);
      error(err.message || 'Failed to import backup file. Ensure valid JSON format.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const themeOptions: { mode: ThemeMode; label: string; icon: any; description: string }[] = [
    { mode: 'light', label: 'Light', icon: Sun, description: 'Clean bright look for daytime focus' },
    { mode: 'dark', label: 'Dark', icon: Moon, description: 'Sleek dark theme gentle on your eyes' },
    { mode: 'system', label: 'System Default', icon: Monitor, description: 'Automatically synchronizes with your OS' },
  ];

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'backup', label: 'Data & Backup', icon: Download },
    { id: 'gamification', label: 'Gamification', icon: Trophy },
  ];

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
          Customize theme, smart notifications, AI coaching, gamification, and data backups.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150',
                isActive
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Appearance / Theme */}
      {activeTab === 'appearance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Appearance & Theme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your preferred interface theme.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.mode;

              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => handleThemeSelect(opt.mode)}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group min-h-[110px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  )}
                  aria-label={`Select ${opt.label} theme`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <Icon
                    className={cn(
                      'w-6 h-6 mb-3',
                      isSelected
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {opt.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Smart Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Smart Notifications & Reminders
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage browser reminders for morning planning, focus timers, habits, and daily reviews.
                </p>
              </div>
            </div>

            {permission !== 'granted' ? (
              <Button size="sm" variant="primary" onClick={requestPermission}>
                Enable Browser Notifications
              </Button>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 w-fit">
                <Check className="w-3.5 h-3.5" /> Notifications Allowed
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 pt-2">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Master Notifications Switch
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Master toggle for all application alerts and chimes
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences?.enabled ?? false}
                onChange={(e) => handleToggleNotification('enabled', e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Morning Planning Reminder
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily morning nudge to define top 3 priorities and intentions
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences?.morning_plan_enabled ?? true}
                onChange={(e) => handleToggleNotification('morning_plan_enabled', e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Daily Habit Check-in
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reminders to maintain your active habit streak
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences?.habit_enabled ?? true}
                onChange={(e) => handleToggleNotification('habit_enabled', e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Focus & Pomodoro Timer Chimes
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Alert when deep work sprints and short breaks finish
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences?.focus_enabled ?? true}
                onChange={(e) => handleToggleNotification('focus_enabled', e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Evening Daily Review Reminder
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Evening reminder to log your daily reflection and celebrate wins
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences?.daily_review_enabled ?? true}
                onChange={(e) => handleToggleNotification('daily_review_enabled', e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. AI Assistant Configuration */}
      {activeTab === 'ai' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AI Assistant Architecture & Privacy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Information on how the AI assistant processes your productivity data.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Status</span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-bold',
                  aiStatus?.configured
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                )}
              >
                {aiStatus?.configured ? 'Active (Connected)' : 'Offline Guide Mode'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400">Model</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{aiStatus?.model || 'gemini-1.5-flash'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400">Security Guarantee</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Zero Secrets Exposed • User Isolated</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
            <p>
              <strong>Privacy Protection:</strong> The AI Assistant layer only receives minimal task titles, active project names, and habit metadata during prompt assembly. Your password hashes, authentication tokens, and credentials are never transmitted.
            </p>
            <p>
              <strong>Configuration Note:</strong> To enable dynamic LLM responses, supply your <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">AI_API_KEY</code> in the backend <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">.env</code> file.
            </p>
          </div>
        </div>
      )}

      {/* 4. Data & Backup */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Data Backup & Export
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export a full portable JSON backup of your tasks, projects, study hours, habits, and notes.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-500" />
                Export My Data (JSON)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Last export: <strong className="text-slate-700 dark:text-slate-300">{lastExportTime || 'Never'}</strong>
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExportData}
              disabled={isExporting}
              leftIcon={isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            >
              {isExporting ? 'Generating...' : 'Download JSON Backup'}
            </Button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" />
                Restore / Import Backup (JSON)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Safely merges tasks, goals, and habits into your account without overwriting existing data.
              </p>
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                disabled={isImporting}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Select Backup File
              </span>
            </label>
          </div>
        </div>
      )}

      {/* 5. Gamification Profile */}
      {activeTab === 'gamification' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Discipline & XP Progress
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Level {gamification?.level || 1} • {gamification?.xp || 0} XP earned
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/app/achievements')}
            >
              View All Badges
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Streak: {gamification?.currentStreak || 0} Days
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {gamification?.totalAchievementsEarned || 0} of {gamification?.totalAchievementsCount || 12} achievements unlocked
              </p>
            </div>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {gamification?.progressPercentage || 0}%
            </span>
          </div>
        </div>
      )}

      {/* Account Session & Logout */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Account Session
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Signed in as <strong className="text-slate-700 dark:text-slate-300">{user?.email}</strong>
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Sign out of your active session. Your tasks, projects, and records remain safely stored in MySQL.
          </p>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
};
