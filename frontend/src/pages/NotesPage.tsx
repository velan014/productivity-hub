import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  FileText,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { noteApi } from '../services/noteApi';
import { Note, NoteFilters } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../utils/date';
import { cn } from '../utils/cn';

export const NotesPage: React.FC = () => {
  const { success, error } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<NoteFilters>({
    category: 'all',
    search: '',
    pinnedOnly: false,
  });

  // Editor form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Mobile detail view toggle
  const [showMobileEditor, setShowMobileEditor] = useState(false);

  // Delete modal
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await noteApi.getNotes(filters);
      setNotes(res.data.notes || []);

      // If a note was selected, update its reference
      if (selectedNote) {
        const updated = res.data.notes.find((n: Note) => n.id === selectedNote.id);
        if (updated) setSelectedNote(updated);
      }
    } catch (err: any) {
      error(err.message || 'Unable to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [filters, error]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await noteApi.getCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Select note into editor
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setCategory(note.category || 'General');
    setIsPinned(note.is_pinned);
    setIsDirty(false);
    setShowMobileEditor(true);
  };

  // Start a new note
  const handleNewNote = () => {
    const blank: Note = {
      id: '',
      user_id: '',
      title: 'Untitled Note',
      content: '',
      category: 'General',
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSelectedNote(blank);
    setTitle('Untitled Note');
    setContent('');
    setCategory('General');
    setIsPinned(false);
    setIsDirty(true);
    setShowMobileEditor(true);
  };

  // Save current note
  const handleSave = async () => {
    if (!title.trim()) {
      error('Note title cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      if (selectedNote && selectedNote.id) {
        const res = await noteApi.updateNote(selectedNote.id, {
          title: title.trim(),
          content: content,
          category: category.trim() || 'General',
          is_pinned: isPinned,
        });
        setSelectedNote(res.data.note);
        success('Note saved successfully');
      } else {
        const res = await noteApi.createNote({
          title: title.trim(),
          content: content,
          category: category.trim() || 'General',
          is_pinned: isPinned,
        });
        setSelectedNote(res.data.note);
        success('Note created successfully');
      }
      setIsDirty(false);
      fetchNotes();
      fetchCategories();
    } catch (err: any) {
      error(err.message || 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle pin
  const handleTogglePin = async (note: Note, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await noteApi.togglePin(note.id);
      if (selectedNote?.id === note.id) {
        setIsPinned(!note.is_pinned);
      }
      success(note.is_pinned ? 'Note unpinned' : 'Note pinned to top');
      fetchNotes();
    } catch (err: any) {
      error(err.message || 'Failed to toggle pin');
    }
  };

  // Delete note
  const handleDeleteNote = async () => {
    if (!deletingNote) return;
    try {
      setIsDeleting(true);
      await noteApi.deleteNote(deletingNote.id);
      success('Note deleted');
      if (selectedNote?.id === deletingNote.id) {
        setSelectedNote(null);
        setShowMobileEditor(false);
      }
      setDeletingNote(null);
      fetchNotes();
      fetchCategories();
    } catch (err: any) {
      error(err.message || 'Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Notes
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Capture thoughts, meeting briefs, and useful information.
          </p>
        </div>

        <Button
          onClick={handleNewNote}
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-sm"
        >
          + New Note
        </Button>
      </div>

      {/* Main Dual-Pane Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left List Pane (Hidden on mobile if editor is active) */}
        <div
          className={cn(
            'md:col-span-5 lg:col-span-4 flex flex-col space-y-4',
            showMobileEditor ? 'hidden md:flex' : 'flex'
          )}
        >
          {/* Search & Category Filter */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes..."
                value={filters.search || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filters.category || 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, pinnedOnly: !prev.pinnedOnly }))}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors border',
                  filters.pinnedOnly
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900'
                )}
              >
                <Pin className="w-3 h-3" />
                Pinned
              </button>
            </div>
          </div>

          {/* Notes Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[650px] pr-1">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : notes.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-7 h-7 text-emerald-500" />}
                title="No notes found"
                description={filters.search ? 'No notes match your search.' : 'Create a note to start jotting down ideas.'}
                actionText="+ New Note"
                actionIcon={<Plus className="w-4 h-4" />}
                onAction={handleNewNote}
              />
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={cn(
                    'p-4 rounded-2xl border transition-all duration-150 cursor-pointer text-left relative group',
                    selectedNote?.id === note.id
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate flex-1">
                      {note.title || 'Untitled Note'}
                    </h3>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleTogglePin(note, e)}
                        className={cn(
                          'p-1 rounded-md transition-colors',
                          note.is_pinned
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 opacity-0 group-hover:opacity-100'
                        )}
                        title={note.is_pinned ? 'Unpin' : 'Pin'}
                        aria-label={note.is_pinned ? 'Unpin note' : 'Pin note'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingNote(note);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Note"
                        aria-label="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 font-normal">
                    {note.content || 'Empty note...'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {note.category || 'General'}
                    </span>
                    <span>{formatDate(note.updated_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Editor / Detail Pane */}
        <div
          className={cn(
            'md:col-span-7 lg:col-span-8 flex flex-col',
            !showMobileEditor ? 'hidden md:flex' : 'flex'
          )}
        >
          {selectedNote ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-full space-y-4">
              {/* Top Controls: Back button on mobile, category, pin, save */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMobileEditor(false)}
                    className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Back to notes list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setIsDirty(true);
                    }}
                    className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium w-32 sm:w-40"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPinned(!isPinned);
                      setIsDirty(true);
                    }}
                    className={cn(
                      'p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors',
                      isPinned
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                    title={isPinned ? 'Unpin Note' : 'Pin Note to Top'}
                  >
                    <Pin className="w-4 h-4" />
                    <span className="hidden sm:inline">{isPinned ? 'Pinned' : 'Pin'}</span>
                  </button>

                  {selectedNote.id && (
                    <button
                      type="button"
                      onClick={() => setDeletingNote(selectedNote)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <Button
                    onClick={handleSave}
                    size="sm"
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                    className="shadow-xs"
                  >
                    Save Note
                  </Button>
                </div>
              </div>

              {/* Title Input */}
              <input
                type="text"
                placeholder="Note Title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 bg-transparent border-none focus:outline-none placeholder-slate-400 w-full"
              />

              {/* Content Area */}
              <textarea
                placeholder="Start writing notes, ideas, markdown snippets, or meeting checklists..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setIsDirty(true);
                }}
                rows={16}
                className="flex-1 w-full bg-transparent border-none focus:outline-none resize-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed placeholder-slate-400"
              />

              {/* Footer status bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
                </span>
                <span>
                  {isDirty ? '⚠️ Unsaved changes' : '✓ All changes saved'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center h-full space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Select a note or create a new one
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Choose a note from the left sidebar to view and edit, or click below to start a blank note.
                </p>
              </div>
              <Button onClick={handleNewNote} size="md" leftIcon={<Plus className="w-4 h-4" />}>
                Create New Note
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            "{deletingNote?.title}"
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDeletingNote(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteNote}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
