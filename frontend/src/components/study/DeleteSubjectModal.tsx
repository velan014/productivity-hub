import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SubjectWithStats } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface DeleteSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectWithStats | null;
  onConfirm: (subject: SubjectWithStats) => Promise<void>;
}

export const DeleteSubjectModal: React.FC<DeleteSubjectModalProps> = ({
  isOpen,
  onClose,
  subject,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!subject) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(subject);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Subject"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="text-xs">
            Are you sure you want to delete <span className="font-bold">"{subject.name}"</span>?
            This will also remove all logged study sessions for this subject.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Delete Subject
          </Button>
        </div>
      </div>
    </Modal>
  );
};
