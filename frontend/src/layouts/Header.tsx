import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, Plus, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

interface HeaderProps {
  onQuickAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onQuickAdd }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/tasks')) return 'Tasks';
    if (path.includes('/profile')) return 'My Profile';
    if (path.includes('/settings')) return 'Settings';
    return 'Productivity Hub';
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left: Page Title */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Button (Desktop only) */}
          <div className="hidden sm:block">
            <Button
              onClick={onQuickAdd}
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Task
            </Button>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={cycleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200/60 dark:border-slate-800 shadow-xs"
            title={`Current theme: ${theme} (click to toggle)`}
            aria-label="Toggle color theme"
          >
            {theme === 'system' ? (
              <Monitor className="w-4 h-4 text-emerald-500" />
            ) : resolvedTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>

          {/* Profile Shortcut */}
          <button
            type="button"
            onClick={() => navigate('/app/profile')}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] focus:outline-none"
            aria-label="Go to profile"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
