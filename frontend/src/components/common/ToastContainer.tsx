import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60 shadow-emerald-500/10',
    error: 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800/60 shadow-rose-500/10',
    warning: 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/60 shadow-amber-500/10',
    info: 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800/60 shadow-blue-500/10',
  };

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-300 animate-in slide-in-from-top-4 fade-in',
            bgStyles[toast.type]
          )}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-0.5">
                {toast.title}
              </h4>
            )}
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug break-words">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center -mr-1 -mt-1"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
