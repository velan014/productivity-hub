import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Edit2,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { ProjectWithStats } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { formatDate } from '../../utils/date';
import { cn } from '../../utils/cn';

interface ProjectCardProps {
  project: ProjectWithStats;
  onSelect: (project: ProjectWithStats) => void;
  onEdit: (project: ProjectWithStats) => void;
  onDelete: (project: ProjectWithStats) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const isCompleted = project.status === 'completed' || (project.total_tasks > 0 && project.progress === 100);

  const statusColors: Record<string, string> = {
    planning: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900',
    active: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    completed: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    archived: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  return (
    <div
      onClick={() => onSelect(project)}
      className={cn(
        'group p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-xs cursor-pointer',
        isCompleted
          ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/15 dark:bg-emerald-950/10'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
      )}
    >
      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                statusColors[project.status] || statusColors.planning
              )}
            >
              {project.status}
            </span>
            <PriorityBadge priority={project.priority} />
          </div>

          <div
            className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Project"
              aria-label="Edit Project"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(project)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Delete Project"
              aria-label="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}
      </div>

      {/* Progress and Task count */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            {project.completed_tasks} / {project.total_tasks} tasks completed
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {project.progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${project.progress}%` }}
          />
        </div>

        {/* Footer info: Due date & Open project */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {project.due_date ? `Due: ${formatDate(project.due_date)}` : 'No due date'}
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View Details <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
