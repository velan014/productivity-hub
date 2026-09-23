import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Award } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { gamificationApi } from '../services/gamificationApi';
import { GamificationProfile, AchievementWithStatus } from '../types';
import { LevelCard } from '../components/gamification/LevelCard';
import { AchievementCard } from '../components/gamification/AchievementCard';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { cn } from '../utils/cn';

export const AchievementsPage: React.FC = () => {
  const { error } = useToast();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profData, achData] = await Promise.all([
        gamificationApi.getProfile(),
        gamificationApi.getAchievements(),
      ]);
      setProfile(profData);
      setAchievements(achData);
    } catch (err: any) {
      console.error('Error fetching gamification data:', err);
      error(err.message || 'Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const categories = [
    { id: 'all', label: 'All Badges' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'focus', label: 'Focus' },
    { id: 'study', label: 'Study' },
    { id: 'habits', label: 'Habits' },
    { id: 'projects', label: 'Projects' },
    { id: 'review', label: 'Reviews' },
    { id: 'planning', label: 'Planning' },
  ];

  const filteredAchievements = achievements.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const earnedCount = achievements.filter((a) => a.is_earned).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Productivity Milestones
            </h1>
            <Award className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Level up your discipline, earn XP from real achievements, and unlock badges.
          </p>
        </div>
      </div>

      {/* Level Card */}
      {profile && <LevelCard profile={profile} />}

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Achievements ({earnedCount} / {achievements.length} Unlocked)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete verified daily actions to earn XP and showcase milestones
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150',
                  selectedCategory === cat.id
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAchievements.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </div>
      </div>
    </div>
  );
};
