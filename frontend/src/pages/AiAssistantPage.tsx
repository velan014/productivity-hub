import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Trash2, ShieldCheck, HelpCircle, Layers, Calendar, MessageSquare } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { aiApi } from '../services/aiApi';
import { taskApi } from '../services/taskApi';
import { AiChatMessage, AiStatus, AiTaskSuggestion } from '../types';
import { ChatMessage } from '../components/ai/ChatMessage';
import { ChatInput } from '../components/ai/ChatInput';
import { SuggestedPrompt } from '../components/ai/SuggestedPrompt';
import { AIActionConfirmation } from '../components/ai/AIActionConfirmation';
import { Button } from '../components/common/Button';

export const AiAssistantPage: React.FC = () => {
  const { success, error, info } = useToast();
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am your AI Productivity Coach. I can analyze your active tasks, projects, habits, and study sessions to help you plan your day, break down complex goals into sub-tasks, or reflect on your daily progress.\n\nHow can I help you excel today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);

  // Suggestions state for task creation
  const [taskSuggestions, setTaskSuggestions] = useState<{
    explanation: string;
    suggestions: AiTaskSuggestion[];
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiApi.getStatus().then(setAiStatus).catch(console.error);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, taskSuggestions, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMsg: AiChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Check for quick trigger intents
      if (text.toLowerCase().includes('break down') || text.toLowerCase().includes('breakdown')) {
        const result = await aiApi.taskBreakdown(text);
        if (result.suggestions && result.suggestions.length > 0) {
          setTaskSuggestions({
            explanation: result.explanation,
            suggestions: result.suggestions,
          });
        }
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.explanation || 'I have generated a suggested task breakdown for your review below:',
          },
        ]);
      } else if (text.toLowerCase().includes('plan my day') || text.toLowerCase().includes('daily plan')) {
        const plan = await aiApi.dailyPlan();
        const formatted = `📅 **Suggested Daily Strategy:**\n${plan.summary}\n\n**Top 3 Priorities:**\n${plan.topPriorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}${plan.suggestedStudySubject ? `\n\n**Focus Study:** ${plan.suggestedStudySubject}` : ''}\n\n**Execution Tips:**\n${plan.tips.map((t) => `• ${t}`).join('\n')}`;
        setMessages((prev) => [...prev, { role: 'assistant', content: formatted }]);
      } else {
        const response = await aiApi.chat(text, messages);
        setMessages((prev) => [...prev, { role: 'assistant', content: response.response }]);
        if (response.suggestedTasks && response.suggestedTasks.length > 0) {
          setTaskSuggestions({
            explanation: 'Suggested actionable tasks based on our conversation:',
            suggestions: response.suggestedTasks,
          });
        }
      }
    } catch (err: any) {
      console.error('AI chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err.message ||
            'I encountered an issue generating a response. Please check your backend AI API configuration or try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTasks = async (tasksToAdd: AiTaskSuggestion[]) => {
    try {
      for (const t of tasksToAdd) {
        await taskApi.createTask({
          title: t.title,
          description: t.description || null,
          priority: t.priority || 'medium',
          category: t.category || 'General',
          estimated_minutes: t.estimated_minutes || null,
        });
      }
      success(`Successfully added ${tasksToAdd.length} task(s) to your workspace!`);
      setTaskSuggestions(null);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `✅ I have created ${tasksToAdd.length} task(s) in your workspace. You can view and manage them in your Tasks tab.`,
        },
      ]);
    } catch (err: any) {
      console.error('Error creating tasks from AI suggestion:', err);
      error(err.message || 'Failed to create tasks');
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat session cleared. How can I assist you with your productivity today?',
      },
    ]);
    setTaskSuggestions(null);
    info('Conversation cleared');
  };

  const samplePrompts = [
    { text: 'What should I focus on today?', icon: Sparkles },
    { text: 'Break down my Smart Irrigation project into sub-tasks', icon: Layers },
    { text: 'Help me plan an optimal daily study schedule', icon: Calendar },
    { text: 'Review my productivity progress and suggest reflection prompts', icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                AI Productivity Coach
              </h1>
              {aiStatus?.configured ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> Offline Guide
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized task breakdown, schedule optimization, and daily coaching.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={clearChat}
          leftIcon={<Trash2 className="w-3.5 h-3.5 text-slate-400" />}
        >
          Clear
        </Button>
      </div>

      {/* Suggested Prompts Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {samplePrompts.map((p, idx) => (
          <SuggestedPrompt
            key={idx}
            prompt={p.text}
            icon={p.icon}
            onClick={handleSendMessage}
          />
        ))}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/80">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {/* Task Confirmation UI if suggested */}
        {taskSuggestions && (
          <AIActionConfirmation
            explanation={taskSuggestions.explanation}
            initialSuggestions={taskSuggestions.suggestions}
            onConfirm={handleConfirmTasks}
            onDismiss={() => setTaskSuggestions(null)}
          />
        )}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 animate-pulse pl-2">
            <Bot className="w-4 h-4 text-indigo-500 animate-spin" />
            <span>AI Coach is analyzing your workspace context...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="pt-1">
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
