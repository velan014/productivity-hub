import React, { useState, useEffect, useCallback } from 'react';
import {
  Moon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  Star,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { dailyReviewApi } from '../services/dailyReviewApi';
import { DailyReview, DaySummary } from '../types';
import { DaySummaryCard } from '../components/dailyReview/DaySummaryCard';
import { ReflectionForm } from '../components/dailyReview/ReflectionForm';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { formatDate } from '../utils/date';
import { cn } from '../utils/cn';

export const DailyReviewPage: React.FC = () => {
  const { success, error } = useToast();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [review, setReview] = useState<DailyReview | null>(null);
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [history, setHistory] = useState<DailyReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviewAndSummary = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      const res = await dailyReviewApi.getReviewByDate(date);
      setReview(res.data.review);
      setSummary(res.data.summary);
    } catch (err: any) {
      console.error('Failed to load review:', err);
      error(err.message || 'Unable to load daily review');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await dailyReviewApi.getHistory(15);
      setHistory(res.data.reviews);
    } catch (err: any) {
      console.error('Failed to load review history:', err);
    }
  }, []);

  useEffect(() => {
    fetchReviewAndSummary(selectedDate);
    fetchHistory();
  }, [selectedDate, fetchReviewAndSummary, fetchHistory]);

  const handleSaveReview = async (data: Partial<DailyReview>) => {
    try {
      await dailyReviewApi.saveReview(data);
      success('Daily review saved successfully');
      fetchReviewAndSummary(selectedDate);
      fetchHistory();
    } catch (err: any) {
      error(err.message || 'Failed to save review');
      throw err;
    }
  };

  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === todayStr;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header with Date Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Moon className="w-4 h-4" />
            <span>Evening Reflection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Daily Review
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Reflect on what went well, identify bottlenecks, and calibrate for tomorrow
          </p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={() => handleShiftDate(-1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 text-xs font-bold text-slate-900 dark:text-slate-100">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>{formatDate(selectedDate)}</span>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-extrabold">
                Today
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleShiftDate(1)}
            disabled={isToday}
            className={cn(
              'p-2 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center',
              isToday
                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            )}
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* 2. Today's Summary Metrics */}
          {summary && <DaySummaryCard summary={summary} />}

          {/* 3. Reflection Form */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              End-of-Day Reflection
            </h2>
            <ReflectionForm
              initialReview={review}
              reviewDate={selectedDate}
              onSave={handleSaveReview}
            />
          </div>

          {/* 4. Past Reviews History */}
          {history.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Recent Daily Reviews
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((h) => {
                  const moodEmojis: Record<string, string> = {
                    great: '😄',
                    good: '🙂',
                    okay: '😐',
                    difficult: '😕',
                    bad: '😞',
                  };

                  return (
                    <div
                      key={h.id}
                      onClick={() => setSelectedDate(h.review_date ? h.review_date.slice(0, 10) : todayStr)}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {formatDate(h.review_date)}
                        </span>
                        <div className="flex items-center gap-1 text-xs">
                          <span>{moodEmojis[h.mood] || '🙂'}</span>
                          <span className="flex items-center text-amber-500 font-bold ml-1">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                            {h.rating}/5
                          </span>
                        </div>
                      </div>

                      {h.what_went_well && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          <strong className="text-slate-800 dark:text-slate-200">Wins: </strong>
                          {h.what_went_well}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
