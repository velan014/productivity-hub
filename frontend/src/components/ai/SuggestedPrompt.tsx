import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestedPromptProps {
  prompt: string;
  icon?: any;
  onClick: (prompt: string) => void;
}

export const SuggestedPrompt: React.FC<SuggestedPromptProps> = ({ prompt, icon: Icon = Sparkles, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(prompt)}
      className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left group shadow-xs"
    >
      <Icon className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform shrink-0" />
      <span className="line-clamp-1">{prompt}</span>
    </button>
  );
};
