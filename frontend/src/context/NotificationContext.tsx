import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../services/notificationApi';
import { NotificationPreferences } from '../types';
import { useToast } from './ToastContext';

interface NotificationContextType {
  preferences: NotificationPreferences | null;
  permission: NotificationPermission;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  updatePreferences: (data: Partial<NotificationPreferences>) => Promise<void>;
  notify: (title: string, body?: string, type?: 'morning' | 'habit' | 'study' | 'focus' | 'review') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { info, error } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPrefs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await notificationApi.getPreferences();
      setPreferences(data);
    } catch {
      // User might be unauthenticated or offline
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      error('Browser notifications are not supported on this browser.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        info('Browser notifications enabled!');
        await updatePreferences({ enabled: true });
        new Notification('Productivity Hub', {
          body: 'Smart notifications are now active.',
          icon: '/favicon.ico',
        });
        return true;
      } else {
        error('Notification permission was not granted.');
        return false;
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  };

  const updatePreferences = async (data: Partial<NotificationPreferences>) => {
    try {
      const updated = await notificationApi.updatePreferences(data);
      setPreferences(updated);
    } catch (err: any) {
      console.error('Error updating notification preferences:', err);
      throw err;
    }
  };

  const notify = (
    title: string,
    body?: string,
    type: 'morning' | 'habit' | 'study' | 'focus' | 'review' = 'focus'
  ) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (preferences && !preferences.enabled) return;

    if (preferences) {
      if (type === 'morning' && !preferences.morning_plan_enabled) return;
      if (type === 'habit' && !preferences.habit_enabled) return;
      if (type === 'study' && !preferences.study_enabled) return;
      if (type === 'focus' && !preferences.focus_enabled) return;
      if (type === 'review' && !preferences.daily_review_enabled) return;
    }

    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch (e) {
      console.error('Failed to trigger notification:', e);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        preferences,
        permission,
        isLoading,
        requestPermission,
        updatePreferences,
        notify,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
