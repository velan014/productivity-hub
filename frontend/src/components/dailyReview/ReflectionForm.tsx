import React, { useState, useEffect } from 'react';
import { DailyReview, MoodType } from '../../types';
import { MoodSelector } from './MoodSelector';
import { Button } from '../common/Button';
import { Sparkles, Check, Heart, AlertCircle, BookOpen, TrendingUp } from 'lucide-react';

interface ReflectionFormProps {
  initialReview?: DailyReview | null;
  reviewDate: string;
  onSave: (data: Partial<DailyReview>) => Promise<void>;
}

export const ReflectionForm: React.FC<ReflectionFormProps> = ({
  initialReview,
  reviewDate,
  onSave,
}) => {
  const [whatWentWell, setWhatWentWell] = useState('');
  const [challenges, setChallenges] = useState('');
  const [learned, setLearned] = useState('');
  const [improvements, setImprovements] = useState('');
  const [mood, setMood] = useState<MoodType>('good');
  const [rating, setRating] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialReview) {
      setWhatWentWell(initialReview.what_went_well || '');
      setChallenges(initialReview.challenges || '');
      setLearned(initialReview.learned || '');
      setImprovements(initialReview.improvements || '');
      setMood(initialReview.mood || 'good');
      setRating(initialReview.rating || 3);
    } else {
      setWhatWentWell('');
      setChallenges('');
      setLearned('');
      setImprovements('');
      setMood('good');
      setRating(3);
    }
    setSavedSuccess(false);
  }, [initialReview, reviewDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSavedSuccess(false);

    try {
      await onSave({
        review_date: reviewDate,
        what_went_well: whatWentWell.trim() || null,
        challenges: challenges.trim() || null,
        learned: learned.trim() || null,
        improvements: improvements.trim() || null,
        mood,
        rating,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mood & Rating */}
      <MoodSelector
        mood={mood}
        onMoodChange={setMood}
        rating={rating}
        onRatingChange={setRating}
      />

      {/* Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. What went well */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Heart className="w-4 h-4" />
            <span>1. What went well today?</span>
          </label>
          <textarea
            rows={3}
            value={whatWentWell}
            onChange={(e) => setWhatWentWell(e.target.value)}
            placeholder="Wins, completed milestones, good focus sprints..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* 2. What was difficult */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4" />
            <span>2. What was difficult or challenging?</span>
          </label>
          <textarea
            rows={3}
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            placeholder="Blockers, distractions, tough problems, fatigue..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* 3. What did I learn */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <BookOpen className="w-4 h-4" />
            <span>3. What did I learn?</span>
          </label>
          <textarea
            rows={3}
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            placeholder="New concept, bug fix, insight, technique..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 4. What should I improve */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <TrendingUp className="w-4 h-4" />
            <span>4. What should I improve tomorrow?</span>
          </label>
          <textarea
            rows={3}
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="Adjust schedule, start earlier, minimize phone use..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {savedSuccess ? (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            <span>Review saved successfully for {reviewDate}!</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            {initialReview ? 'Review already exists for this date. Saving will update it.' : 'No review saved for this date yet.'}
          </div>
        )}

        <Button
          type="submit"
          isLoading={isSubmitting}
          leftIcon={<Sparkles className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-sm"
        >
          {initialReview ? 'Update Daily Review' : 'Save Daily Review'}
        </Button>
      </div>
    </form>
  );
};
