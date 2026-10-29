import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AlertService } from '../services/api';
import { useAuth } from './AuthContext';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchAlerts = useCallback(async (currentFilter = filter) => {
    try {
      setLoading(true);
      const data = await AlertService.getAll(currentFilter);
      setAlerts(data);
      
      // Calculate overall unread count from 'ALL' if filtering or from current list
      if (currentFilter === 'ALL') {
        const count = data.filter(a => !a.isRead).length;
        setUnreadCount(count);
      } else {
        const allData = await AlertService.getAll('ALL');
        const count = allData.filter(a => !a.isRead).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!user) return;
    fetchAlerts(filter);
  }, [filter, fetchAlerts, user]);

  const markAsRead = async (id) => {
    // Check if target alert is already read to prevent double decrement
    const target = alerts.find(a => a.id === id);
    if (target && target.isRead) {
      return target;
    }

    try {
      // Optimistically update local state & decrement count
      setAlerts((prevAlerts) =>
        prevAlerts.map((a) => (a.id === id ? { ...a, isRead: true } : a))
      );
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));

      const updated = await AlertService.markAsRead(id);
      return updated;
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
      // Re-fetch on failure to resync state
      fetchAlerts(filter);
    }
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        loading,
        filter,
        setFilter,
        fetchAlerts: () => fetchAlerts(filter),
        markAsRead,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}
