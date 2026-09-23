import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { projectApi } from '../services/projectApi';
import { taskApi } from '../services/taskApi';
import {
  Project,
  ProjectWithStats,
  ProjectPriority,
  ProjectStatus,
  Task,
} from '../types';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { ProjectDetails } from '../components/projects/ProjectDetails';
import { ProjectFilterBar } from '../components/projects/ProjectFilterBar';
import { DeleteProjectModal } from '../components/projects/DeleteProjectModal';
import { TaskModal } from '../components/tasks/TaskModal';
import { DeleteConfirmModal } from '../components/tasks/DeleteConfirmModal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { DashboardSkeleton } from '../components/common/Skeleton';

export const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Project (for Details view)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    searchParams.get('id')
  );
  const [selectedProject, setSelectedProject] = useState<ProjectWithStats | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);

  // Project Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithStats | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithStats | null>(null);

  // Task Modals (inside project)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await projectApi.getProjects({
        status: statusFilter,
        priority: priorityFilter,
        search: searchTerm,
      });
      setProjects(res.data.projects);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      error(err.message || 'Unable to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter, searchTerm, error]);

  // Fetch single project details & its tasks
  const fetchProjectDetails = useCallback(async (id: string) => {
    try {
      const res = await projectApi.getProjectById(id);
      setSelectedProject(res.data.project);
      setProjectTasks(res.data.tasks);
    } catch (err: any) {
      console.error('Failed to load project details:', err);
      error(err.message || 'Project not found');
      setSelectedProjectId(null);
      setSearchParams({});
    }
  }, [error, setSearchParams]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId);
    } else {
      setSelectedProject(null);
      setProjectTasks([]);
    }
  }, [selectedProjectId, fetchProjectDetails]);

  // Project Actions
  const handleSaveProject = async (data: Partial<Project>) => {
    try {
      if (editingProject) {
        await projectApi.updateProject(editingProject.id, data);
        success('Project updated successfully');
      } else {
        await projectApi.createProject(data);
        success('Project created successfully');
      }
      fetchProjects();
      if (selectedProjectId) {
        fetchProjectDetails(selectedProjectId);
      }
    } catch (err: any) {
      error(err.message || 'Failed to save project');
      throw err;
    }
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      await projectApi.deleteProject(project.id);
      success('Project deleted successfully');
      if (selectedProjectId === project.id) {
        setSelectedProjectId(null);
        setSearchParams({});
      }
      fetchProjects();
    } catch (err: any) {
      error(err.message || 'Failed to delete project');
      throw err;
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!selectedProject) return;
    try {
      await projectApi.updateProject(selectedProject.id, { status });
      success(`Project status changed to ${status}`);
      fetchProjectDetails(selectedProject.id);
      fetchProjects();
    } catch (err: any) {
      error(err.message || 'Failed to update status');
    }
  };

  // Task Actions (inside Project)
  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!selectedProject) return;
    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask.id, {
          ...taskData,
          project_id: selectedProject.id,
        });
        success('Task updated');
      } else {
        await projectApi.addTaskToProject(selectedProject.id, taskData);
        success('Task added to project');
      }
      fetchProjectDetails(selectedProject.id);
      fetchProjects();
    } catch (err: any) {
      error(err.message || 'Unable to save task');
      throw err;
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      await taskApi.toggleComplete(task.id);
      success(task.status === 'completed' ? 'Task reopened' : 'Task completed');
      if (selectedProjectId) {
        fetchProjectDetails(selectedProjectId);
      }
      fetchProjects();
    } catch (err: any) {
      error(err.message || 'Unable to update task');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      await taskApi.deleteTask(task.id);
      success('Task deleted');
      if (selectedProjectId) {
        fetchProjectDetails(selectedProjectId);
      }
      fetchProjects();
    } catch (err: any) {
      error(err.message || 'Unable to delete task');
      throw err;
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // If a project is selected, render its detail view
  if (selectedProjectId && selectedProject) {
    return (
      <>
        <ProjectDetails
          project={selectedProject}
          tasks={projectTasks}
          onBack={() => {
            setSelectedProjectId(null);
            setSearchParams({});
          }}
          onEditProject={() => setEditingProject(selectedProject)}
          onDeleteProject={() => setDeletingProject(selectedProject)}
          onStatusChange={handleStatusChange}
          onAddTask={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          onToggleTask={handleToggleTask}
          onEditTask={(t) => {
            setEditingTask(t);
            setIsTaskModalOpen(true);
          }}
          onDeleteTask={(t) => setDeletingTask(t)}
        />

        {/* Edit Project Modal */}
        <ProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onSave={handleSaveProject}
        />

        {/* Delete Project Modal */}
        <DeleteProjectModal
          isOpen={!!deletingProject}
          onClose={() => setDeletingProject(null)}
          project={deletingProject}
          onConfirm={handleDeleteProject}
        />

        {/* Task Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          task={editingTask}
          onSave={handleSaveTask}
          onDelete={(t) => setDeletingTask(t)}
        />

        {/* Task Delete Modal */}
        <DeleteConfirmModal
          isOpen={!!deletingTask}
          onClose={() => setDeletingTask(null)}
          task={deletingTask}
          onConfirm={handleDeleteTask}
        />
      </>
    );
  }

  // Summary Metrics for Projects List Header
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const totalTasksCount = projects.reduce((acc, p) => acc + p.total_tasks, 0);
  const completedTasksCount = projects.reduce((acc, p) => acc + p.completed_tasks, 0);
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
      : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Projects
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Group, organize, and execute larger multi-task initiatives
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingProject(null);
            setIsCreateModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm w-full sm:w-auto"
        >
          New Project
        </Button>
      </div>

      {/* 2. Top Stats Snapshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Active Projects
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {activeCount}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
            {completedCount}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Project Tasks
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {completedTasksCount} / {totalTasksCount}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Avg Progress
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {avgProgress}%
          </p>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <ProjectFilterBar
        status={statusFilter}
        onStatusChange={setStatusFilter}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        search={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* 4. Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="w-8 h-8" />}
          title="No projects found"
          description={
            searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Create your first project to organize larger tasks into focused milestones.'
          }
          actionText="Create Project"
          actionIcon={<Plus className="w-4 h-4" />}
          onAction={() => {
            setEditingProject(null);
            setIsCreateModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={(p) => {
                setSelectedProjectId(p.id);
                setSearchParams({ id: p.id });
              }}
              onEdit={(p) => setEditingProject(p)}
              onDelete={(p) => setDeletingProject(p)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <ProjectModal
        isOpen={isCreateModalOpen || !!editingProject}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={handleSaveProject}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProjectModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        project={deletingProject}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
};
