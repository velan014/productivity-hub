import React from 'react';
import { Task } from '../../types';
import { TaskCard } from '../tasks/TaskCard';
import { EmptyState } from '../common/EmptyState';
import { Plus, CheckSquare } from 'lucide-react';

interface ProjectTaskListProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddTask: () => void;
}

export const ProjectTaskList: React.FC<ProjectTaskListProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddTask,
}) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare className="w-8 h-8" />}
        title="No tasks in this project"
        description="Add tasks to track progress and break down this project into actionable steps."
        actionText="Add Project Task"
        actionIcon={<Plus className="w-4 h-4" />}
        onAction={onAddTask}
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
