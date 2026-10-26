'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notification: NotificationPayload | null;
  showNotification: (payload: NotificationPayload) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);

  const showNotification = useCallback((payload: NotificationPayload) => {
    setNotification(payload);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    if (!notification) return;

    const timeout = window.setTimeout(hideNotification, 6000);
    return () => window.clearTimeout(timeout);
  }, [notification, hideNotification]);

  const value = {
    notification,
    showNotification,
    hideNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <div
          role={notification.type === 'error' ? 'alert' : 'status'}
          aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
          className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-xl border border-border bg-background p-4 text-foreground shadow-xl"
        >
          <div className="mt-0.5 shrink-0">
            {notification.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
            {notification.type === 'warning' && <TriangleAlert className="h-5 w-5 text-amber-500" />}
            {notification.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{notification.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
          </div>
          <button
            type="button"
            onClick={hideNotification}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
