import React from 'react';
import { StudySessionWithSubject } from '../../types';
import { Clock, Calendar, Edit2, Trash2, BookOpen } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/date';

interface StudySessionListProps {
  sessions: StudySessionWithSubject[];
  emptyMessage?: string;
  onEdit: (session: StudySessionWithSubject) => void;
  onDelete: (session: StudySessionWithSubject) => void;
}

export const StudySessionList: React.FC<StudySessionListProps> = ({
  sessions,
  emptyMessage = 'No study sessions logged yet.',
  onEdit,
  onDelete,
}) => {
  if (sessions.length === 0) {
    return (
      <div className="py-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6">
        <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h} hrs`;
    return `${m} mins`;
  };

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs group"
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {session.subject_code || session.subject_name}
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(session.duration_minutes)}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
                {session.title}
              </h4>

              {session.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {session.notes}
                </p>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(session.date)}
                </span>
                <span>•</span>
                <span>
                  {formatTime(session.start_time)} – {formatTime(session.end_time)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-center">
            <button
              onClick={() => onEdit(session)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Session"
              aria-label="Edit Session"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(session)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Delete Session"
              aria-label="Delete Session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
