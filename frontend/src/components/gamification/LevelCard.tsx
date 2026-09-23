import React from 'react';
import { Trophy, Zap, Flame, CheckCircle2, Timer, GraduationCap } from 'lucide-react';
import { GamificationProfile } from '../../types';

interface LevelCardProps {
  profile: GamificationProfile;
}

export const LevelCard: React.FC<LevelCardProps> = ({ profile }) => {
  const getLevelTitle = (lvl: number) => {
    if (lvl <= 1) return 'Novice Explorer';
    if (lvl === 2) return 'Productive Builder';
    if (lvl === 3) return 'Focused Strategist';
    if (lvl === 4) return 'Master of Execution';
    return 'Productivity Titan';
  };

  const focusHours = (profile.totalFocusMinutes / 60).toFixed(1);
  const studyHours = (profile.totalStudyMinutes / 60).toFixed(1);

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl border border-indigo-500/20">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black flex flex-col items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider">Level</span>
              <span className="text-2xl leading-none">{profile.level}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {getLevelTitle(profile.level)}
                </h2>
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-xs sm:text-sm text-indigo-200/80">
                {profile.xp.toLocaleString()} Total XP earned across all productivity modules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 font-bold text-xs">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>{profile.currentStreak} Day Streak</span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Level {profile.level} Progress
            </span>
            <span>
              {profile.currentLevelXp} / {profile.nextLevelXp} XP ({profile.progressPercentage}%)
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-indigo-500/30">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-indigo-400 to-teal-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, profile.progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Action Totals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tasks Done</span>
            </div>
            <p className="text-lg font-bold text-white">{profile.totalCompletedTasks}</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1 font-semibold">
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Focus Time</span>
            </div>
            <p className="text-lg font-bold text-white">{focusHours} hrs</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1 font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>Study Time</span>
            </div>
            <p className="text-lg font-bold text-white">{studyHours} hrs</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1 font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Badges</span>
            </div>
            <p className="text-lg font-bold text-white">
              {profile.totalAchievementsEarned} / {profile.totalAchievementsCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
