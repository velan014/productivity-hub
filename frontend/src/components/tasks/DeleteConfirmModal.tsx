import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Task } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onConfirm: (task: Task) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  task,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!task) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm(task);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center sm:text-left py-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto sm:mx-0 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Delete this task?
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">"{task.title}"</strong>? This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
