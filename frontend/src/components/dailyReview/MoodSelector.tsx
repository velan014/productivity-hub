import React from 'react';
import { MoodType } from '../../types';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MoodSelectorProps {
  mood: MoodType;
  onMoodChange: (mood: MoodType) => void;
  rating: number;
  onRatingChange: (rating: number) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  mood,
  onMoodChange,
  rating,
  onRatingChange,
}) => {
  const moods: { label: string; emoji: string; value: MoodType }[] = [
    { label: 'Great', emoji: '😄', value: 'great' },
    { label: 'Good', emoji: '🙂', value: 'good' },
    { label: 'Okay', emoji: '😐', value: 'okay' },
    { label: 'Difficult', emoji: '😕', value: 'difficult' },
    { label: 'Bad', emoji: '😞', value: 'bad' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
      {/* Mood Selector */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          How was your day overall?
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {moods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onMoodChange(m.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-bold transition-all min-h-[44px]',
                mood === m.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-105'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <span className="text-base leading-none">{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Star Rating (1 - 5) */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Productivity Rating ({rating}/5)
        </label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`Rate ${star} star`}
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-all',
                  star <= rating
                    ? 'fill-amber-400 text-amber-400 scale-110'
                    : 'text-slate-300 dark:text-slate-600'
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
