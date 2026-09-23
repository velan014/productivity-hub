import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from './components/common/ToastContainer';
import { OfflineBanner } from './components/common/OfflineBanner';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';

// Phase 1 Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Phase 2 Pages
import { GoalsPage } from './pages/GoalsPage';
import { HabitsPage } from './pages/HabitsPage';
import { CalendarPage } from './pages/CalendarPage';
import { FocusPage } from './pages/FocusPage';
import { NotesPage } from './pages/NotesPage';

// Phase 3 Pages
import { ProjectsPage } from './pages/ProjectsPage';
import { StudyPage } from './pages/StudyPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DailyReviewPage } from './pages/DailyReviewPage';
import { MorningPlanningPage } from './pages/MorningPlanningPage';

// Phase 4 Pages
import { AiAssistantPage } from './pages/AiAssistantPage';
import { AchievementsPage } from './pages/AchievementsPage';

// Root index redirector
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <Navigate to={isAuthenticated ? '/app/dashboard' : '/login'} replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <OfflineBanner />
              <Routes>
                {/* Root redirect */}
                <Route path="/" element={<RootRedirect />} />

                {/* Public Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected App Routes */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="study" element={<StudyPage />} />
                  <Route path="goals" element={<GoalsPage />} />
                  <Route path="habits" element={<HabitsPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="focus" element={<FocusPage />} />
                  <Route path="notes" element={<NotesPage />} />
                  <Route path="morning-planning" element={<MorningPlanningPage />} />
                  <Route path="daily-review" element={<DailyReviewPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="ai-assistant" element={<AiAssistantPage />} />
                  <Route path="achievements" element={<AchievementsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>

              {/* Global Toasts */}
              <ToastContainer />
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

