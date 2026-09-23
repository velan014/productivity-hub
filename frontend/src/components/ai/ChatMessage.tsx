import React from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import { AiChatMessage } from '../../types';
import { cn } from '../../utils/cn';

interface ChatMessageProps {
  message: AiChatMessage;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 sm:gap-4 items-start animate-in fade-in duration-200',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold shadow-xs',
          isUser
            ? 'bg-slate-700 dark:bg-slate-700'
            : 'bg-gradient-to-tr from-indigo-600 to-teal-400 shadow-indigo-500/20'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed space-y-2 shadow-xs',
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-tl-none'
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Coach</span>
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </div>
  );
};
