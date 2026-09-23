import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Plus,
  Timer,
  Menu,
  X,
  Target,
  Repeat,
  Calendar as CalendarIcon,
  FileText,
  FolderGit2,
  GraduationCap,
  BarChart3,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  Bot,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

interface MobileNavProps {
  onQuickAdd: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onQuickAdd }) => {
  const { logout } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainNavItems = [
    { label: 'Home', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/app/tasks', icon: CheckSquare },
    { label: 'Add', isAction: true, icon: Plus, action: onQuickAdd },
    { label: 'Focus', path: '/app/focus', icon: Timer },
    {
      label: 'More',
      isMore: true,
      icon: Menu,
      action: () => setIsMoreOpen(true),
    },
  ];

  const moreDrawerItems = [
    { label: 'AI Assistant', path: '/app/ai-assistant', icon: Bot, desc: 'Coaching & task breakdown' },
    { label: 'Achievements', path: '/app/achievements', icon: Trophy, desc: 'Milestones, XP & badges' },
    { label: 'Projects', path: '/app/projects', icon: FolderGit2, desc: 'Multi-task initiatives & progress' },
    { label: 'Study', path: '/app/study', icon: GraduationCap, desc: 'Course subjects & study hours' },
    { label: 'Morning Plan', path: '/app/morning-planning', icon: Sun, desc: 'Top 3 priorities & intentions' },
    { label: 'Daily Review', path: '/app/daily-review', icon: Moon, desc: 'Evening reflection & mood' },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart3, desc: 'Productivity charts & metrics' },
    { label: 'Goals', path: '/app/goals', icon: Target, desc: 'Long & short-term objectives' },
    { label: 'Habits', path: '/app/habits', icon: Repeat, desc: 'Consistency streaks & logs' },
    { label: 'Calendar', path: '/app/calendar', icon: CalendarIcon, desc: 'Unified productivity schedule' },
    { label: 'Notes', path: '/app/notes', icon: FileText, desc: 'Quick thoughts and ideas' },
    { label: 'Profile', path: '/app/profile', icon: User, desc: 'Account and user details' },
    { label: 'Settings', path: '/app/settings', icon: Settings, desc: 'Preferences and appearance' },
  ];

  return (
    <>
      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {mainNavItems.map((item, index) => {
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={item.action}
                  className="relative -top-3.5 flex flex-col items-center justify-center p-0 group focus:outline-none"
                  aria-label="Quick Add Task"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform">
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-1">
                    Add
                  </span>
                </button>
              );
            }

            if (item.isMore) {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={item.action}
                  className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] py-1 transition-all rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  aria-label="Open More Menu"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path!}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] py-1 transition-all rounded-xl',
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-transform',
                        isActive && 'scale-110'
                      )}
                    />
                    <span className="text-[10px] tracking-tight mt-1">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* "More" Slide-up Drawer */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl z-10 max-h-[85vh] flex flex-col p-5 pb-8 space-y-4">
            {/* Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Productivity Suite
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Phase 3 Active
                </span>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of items */}
            <div className="grid grid-cols-2 gap-2.5 overflow-y-auto max-h-[55vh] pr-0.5">
              {moreDrawerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMoreOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[78px]',
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      )
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">
                      {item.desc}
                    </span>
                  </NavLink>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  logout();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
