import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { TaskModal } from '../components/tasks/TaskModal';
import { taskApi } from '../services/taskApi';
import { useToast } from '../context/ToastContext';
import { Task } from '../types';

export const AppLayout: React.FC = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const { success, error } = useToast();

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await taskApi.createTask(taskData);
      success('Task created');
      // Dispatch custom event so active pages (Dashboard or Tasks) can immediately refresh
      window.dispatchEvent(new CustomEvent('task:created'));
    } catch (err: any) {
      error(err.message || 'Unable to create task');
      throw err;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onQuickAdd={() => setIsQuickAddOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Global Quick Add Task Modal */}
      <TaskModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
};
