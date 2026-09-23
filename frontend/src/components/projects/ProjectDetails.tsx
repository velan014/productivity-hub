import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit2,
  Plus,
  Trash2,
  Archive,
  Check,
} from 'lucide-react';
import { ProjectWithStats, ProjectStatus, Task } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProjectTaskList } from './ProjectTaskList';
import { formatDate } from '../../utils/date';
import { cn } from '../../utils/cn';

interface ProjectDetailsProps {
  project: ProjectWithStats;
  tasks: Task[];
  onBack: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
  onStatusChange: (status: ProjectStatus) => void;
  onAddTask: () => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  tasks,
  onBack,
  onEditProject,
  onDeleteProject,
  onStatusChange,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) => {
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return t.status !== 'completed';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Header: Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 min-h-[40px] px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={onEditProject}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Project
          </Button>

          {project.status !== 'completed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange('completed')}
              leftIcon={<Check className="w-3.5 h-3.5 text-emerald-500" />}
            >
              Mark Completed
            </Button>
          )}

          {project.status !== 'archived' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange('archived')}
              leftIcon={<Archive className="w-3.5 h-3.5 text-amber-500" />}
            >
              Archive
            </Button>
          )}

          <Button
            size="sm"
            variant="danger"
            onClick={onDeleteProject}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>

          <Button
            size="sm"
            onClick={onAddTask}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm"
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Project Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                {project.status}
              </span>
              <PriorityBadge priority={project.priority} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {project.name}
            </h1>

            {project.description && (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            )}
          </div>

          {/* Progress gauge summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 min-w-[180px] text-center shrink-0">
            <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {project.progress}%
            </span>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Overall Progress
            </p>
          </div>
        </div>

        {/* Progress Bar & Dates */}
        <div className="space-y-3 pt-2">
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                <strong className="text-slate-800 dark:text-slate-200">{completedCount}</strong> completed
              </span>
              <span>•</span>
              <span>
                <strong className="text-slate-800 dark:text-slate-200">{pendingCount}</strong> pending
              </span>
              <span>•</span>
              <span>
                <strong className="text-slate-800 dark:text-slate-200">{tasks.length}</strong> total tasks
              </span>
            </div>

            <div className="flex items-center gap-4">
              {project.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Start: {formatDate(project.start_date)}
                </span>
              )}
              {project.due_date && (
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Due: {formatDate(project.due_date)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Tasks Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Project Tasks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Action items and milestones for this project
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
            <button
              onClick={() => setTaskFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px]',
                taskFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setTaskFilter('pending')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px]',
                taskFilter === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setTaskFilter('completed')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px]',
                taskFilter === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        <ProjectTaskList
          tasks={filteredTasks}
          onToggleComplete={onToggleTask}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onAddTask={onAddTask}
        />
      </div>
    </div>
  );
};
