import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Repeat,
  Calendar as CalendarIcon,
  Timer,
  FileText,
  FolderGit2,
  GraduationCap,
  BarChart3,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  Sparkles,
  Bot,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const coreNavItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/app/tasks', icon: CheckSquare },
    { label: 'Projects', path: '/app/projects', icon: FolderGit2 },
    { label: 'Study', path: '/app/study', icon: GraduationCap },
    { label: 'Goals', path: '/app/goals', icon: Target },
    { label: 'Habits', path: '/app/habits', icon: Repeat },
    { label: 'Calendar', path: '/app/calendar', icon: CalendarIcon },
    { label: 'Focus & Timer', path: '/app/focus', icon: Timer },
    { label: 'Notes', path: '/app/notes', icon: FileText },
  ];

  const routineNavItems = [
    { label: 'Morning Planning', path: '/app/morning-planning', icon: Sun },
    { label: 'Daily Review', path: '/app/daily-review', icon: Moon },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
  ];

  const advancedNavItems = [
    { label: 'AI Assistant', path: '/app/ai-assistant', icon: Bot },
    { label: 'Achievements', path: '/app/achievements', icon: Trophy },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Productivity Hub
          </h1>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
            Phase 4 Active
          </span>
        </div>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 px-4 py-5 overflow-y-auto space-y-5">
        {/* Core Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Work & Execution
          </p>
          {coreNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px]',
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Daily Rituals & Analytics */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Routine & Analytics
          </p>
          {routineNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px]',
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Intelligence & Rewards */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Intelligence & Rewards
          </p>
          {advancedNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px]',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom User / Settings / Logout Section */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px]',
              isActive
                ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            )
          }
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
            />
          ) : (
            <User className="w-5 h-5 shrink-0" />
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {user?.name || 'User Profile'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
        </NavLink>

        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px]',
              isActive
                ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            )
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="text-xs">Settings</span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors min-h-[44px]"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
