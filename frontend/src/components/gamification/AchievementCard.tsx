import React from 'react';
import {
  CheckCircle2,
  CheckSquare,
  Zap,
  Timer,
  Flame,
  BookOpen,
  GraduationCap,
  Repeat,
  FolderGit2,
  Moon,
  Sun,
  Target,
  Lock,
  Trophy,
} from 'lucide-react';
import { AchievementWithStatus } from '../../types';
import { formatDate } from '../../utils/date';
import { cn } from '../../utils/cn';

interface AchievementCardProps {
  achievement: AchievementWithStatus;
}

const iconMap: Record<string, any> = {
  CheckCircle2,
  CheckSquare,
  Zap,
  Timer,
  Flame,
  BookOpen,
  GraduationCap,
  Repeat,
  FolderGit2,
  Moon,
  Sun,
  Target,
};

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const IconComponent = iconMap[achievement.icon] || Trophy;
  const isEarned = achievement.is_earned;

  return (
    <div
      className={cn(
        'p-5 rounded-3xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-xs',
        isEarned
          ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700/50 shadow-amber-500/5'
          : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-70'
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200',
              isEarned
                ? 'bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
            )}
          >
            {isEarned ? (
              <IconComponent className="w-6 h-6" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>

          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-[11px] font-bold',
              isEarned
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            )}
          >
            +{achievement.xp_reward} XP
          </span>
        </div>

        <h3
          className={cn(
            'text-base font-bold mb-1 line-clamp-1',
            isEarned
              ? 'text-slate-900 dark:text-slate-100'
              : 'text-slate-600 dark:text-slate-400'
          )}
        >
          {achievement.name}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {achievement.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
        {isEarned ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Unlocked {achievement.earned_at ? formatDate(achievement.earned_at) : 'recently'}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Locked milestone
          </span>
        )}
        <span className="uppercase text-[10px] font-bold tracking-wider text-slate-400">
          {achievement.category}
        </span>
      </div>
    </div>
  );
};
