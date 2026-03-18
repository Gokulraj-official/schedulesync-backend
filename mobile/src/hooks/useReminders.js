import { useState, useCallback } from 'react';
import api from '../config/api';

export const useReminders = () => {
  const [reminderPreferences, setReminderPreferences] = useState(null);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's reminder preferences
  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/reminders/preferences');
      if (response.data.success) {
        setReminderPreferences(response.data);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reminder preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update reminder preferences
  const updatePreferences = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put('/reminders/preferences', updates);
      if (response.data.success) {
        // Response now has same structure as GET endpoint
        setReminderPreferences(response.data);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating reminder preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch upcoming reminders
  const fetchUpcomingReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/reminders/upcoming');
      if (response.data.success) {
        setUpcomingReminders(response.data.upcomingReminders);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching upcoming reminders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle all reminders on/off
  const toggleReminders = useCallback(async (enabled) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put('/reminders/toggle', { enabled });
      if (response.data.success) {
        setReminderPreferences((prev) => ({
          ...prev,
          remindersEnabled: response.data.remindersEnabled,
        }));
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error toggling reminders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send test reminder
  const sendTestReminder = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/reminders/test', { bookingId });
      if (response.data.success) {
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error sending test reminder:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reminderPreferences,
    upcomingReminders,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
    fetchUpcomingReminders,
    toggleReminders,
    sendTestReminder,
  };
};
