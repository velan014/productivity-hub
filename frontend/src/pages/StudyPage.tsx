import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Plus,
  Clock,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { studyApi } from '../services/studyApi';
import {
  Subject,
  SubjectWithStats,
  StudySession,
  StudySessionWithSubject,
  StudySummary,
} from '../types';
import { SubjectCard } from '../components/study/SubjectCard';
import { SubjectModal } from '../components/study/SubjectModal';
import { StudySessionModal } from '../components/study/StudySessionModal';
import { StudySessionList } from '../components/study/StudySessionList';
import { DeleteSubjectModal } from '../components/study/DeleteSubjectModal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { DashboardSkeleton } from '../components/common/Skeleton';

export const StudyPage: React.FC = () => {
  const { success, error } = useToast();

  const [subjects, setSubjects] = useState<SubjectWithStats[]>([]);
  const [summary, setSummary] = useState<StudySummary | null>(null);
  const [todaySessions, setTodaySessions] = useState<StudySessionWithSubject[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<StudySessionWithSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithStats | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectWithStats | null>(null);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySessionWithSubject | null>(null);
  const [sessionDefaultSubjectId, setSessionDefaultSubjectId] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async () => {
    try {
      const [subjRes, summaryRes, todayRes, upcomingRes] = await Promise.all([
        studyApi.getSubjects(),
        studyApi.getStudySummary(),
        studyApi.getSessions({ type: 'today' }),
        studyApi.getSessions({ type: 'upcoming' }),
      ]);

      setSubjects(subjRes.data.subjects);
      setSummary(summaryRes.data);
      setTodaySessions(todayRes.data.sessions);
      setUpcomingSessions(upcomingRes.data.sessions);
    } catch (err: any) {
      console.error('Failed to fetch study data:', err);
      error(err.message || 'Unable to load study data');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subject Handlers
  const handleSaveSubject = async (data: Partial<Subject>) => {
    try {
      if (editingSubject) {
        await studyApi.updateSubject(editingSubject.id, data);
        success('Subject updated');
      } else {
        await studyApi.createSubject(data);
        success('Subject created');
      }
      fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to save subject');
      throw err;
    }
  };

  const handleDeleteSubject = async (subject: SubjectWithStats) => {
    try {
      await studyApi.deleteSubject(subject.id);
      success('Subject deleted');
      fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to delete subject');
      throw err;
    }
  };

  // Session Handlers
  const handleSaveSession = async (data: Partial<StudySession>) => {
    try {
      if (editingSession) {
        await studyApi.updateSession(editingSession.id, data);
        success('Study session updated');
      } else {
        await studyApi.createSession(data);
        success('Study session logged');
      }
      fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to save study session');
      throw err;
    }
  };

  const handleDeleteSession = async (session: StudySessionWithSubject) => {
    try {
      await studyApi.deleteSession(session.id);
      success('Study session deleted');
      fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to delete session');
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h} hrs`;
    return `${m} mins`;
  };

  const todayStudyText = summary ? formatMins(summary.todayMinutes) : '0 mins';
  const weekStudyText = summary ? formatMins(summary.weekMinutes) : '0 mins';
  const targetHours = summary?.targetHours || 0;
  const progressPct = summary?.progressPercentage || 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Study Management
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Track course subjects, study targets, and dedicated learning sessions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Subject
          </Button>

          <Button
            onClick={() => {
              setEditingSession(null);
              setSessionDefaultSubjectId(undefined);
              setIsSessionModalOpen(true);
            }}
            leftIcon={<BookOpen className="w-4 h-4" />}
            className="shadow-sm"
          >
            Log Session
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Today's Study
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {todayStudyText}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            This Week
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {weekStudyText}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Target
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {targetHours} hrs
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Target Progress
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {progressPct}%
          </p>
        </div>
      </div>

      {/* 3. Subject Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Subjects & Coursework
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target study hours vs actual logged progress
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="w-8 h-8" />}
            title="No subjects added yet"
            description="Add your coursework subjects to set target study hours and track your learning progress."
            actionText="Add First Subject"
            actionIcon={<Plus className="w-4 h-4" />}
            onAction={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onEdit={(s) => setEditingSubject(s)}
                onDelete={(s) => setDeletingSubject(s)}
                onLogSession={(s) => {
                  setEditingSession(null);
                  setSessionDefaultSubjectId(s.id);
                  setIsSessionModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Two Column Layout: Today's Study & Upcoming Study */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Today's Study Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Today's Study Sessions
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {todaySessions.length} logged today
            </span>
          </div>

          <StudySessionList
            sessions={todaySessions}
            emptyMessage="No study sessions logged for today yet."
            onEdit={(s) => {
              setEditingSession(s);
              setIsSessionModalOpen(true);
            }}
            onDelete={handleDeleteSession}
          />
        </div>

        {/* Upcoming Study Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Upcoming Study Sessions
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {upcomingSessions.length} planned
            </span>
          </div>

          <StudySessionList
            sessions={upcomingSessions}
            emptyMessage="No future study sessions planned yet."
            onEdit={(s) => {
              setEditingSession(s);
              setIsSessionModalOpen(true);
            }}
            onDelete={handleDeleteSession}
          />
        </div>
      </div>

      {/* Subject Modals */}
      <SubjectModal
        isOpen={isSubjectModalOpen || !!editingSubject}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        subject={editingSubject}
        onSave={handleSaveSubject}
      />

      <DeleteSubjectModal
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        subject={deletingSubject}
        onConfirm={handleDeleteSubject}
      />

      {/* Study Session Modal */}
      <StudySessionModal
        isOpen={isSessionModalOpen || !!editingSession}
        onClose={() => {
          setIsSessionModalOpen(false);
          setEditingSession(null);
          setSessionDefaultSubjectId(undefined);
        }}
        subjects={subjects}
        session={editingSession}
        defaultSubjectId={sessionDefaultSubjectId}
        onSave={handleSaveSession}
      />
    </div>
  );
};
