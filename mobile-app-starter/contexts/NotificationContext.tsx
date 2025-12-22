import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService } from '../services/notificationService';

interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isInitialized: boolean;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Initialize notification service
      const success = await notificationService.initialize();
      
      if (success) {
        setIsInitialized(true);
        
        // Fetch initial notifications
        await refreshNotifications();
        
        // Fetch unread count
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const refreshNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/in-app?limit=50`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/in-app/unread-count`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
        
        // Update badge count
        await notificationService.setBadgeCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/in-app/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        
        // Update badge count
        await notificationService.setBadgeCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    notificationService.clearBadge();
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isInitialized,
    addNotification,
    markAsRead,
    clearNotifications,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}



