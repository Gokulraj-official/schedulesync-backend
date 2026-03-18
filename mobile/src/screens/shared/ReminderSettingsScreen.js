import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';

const ReminderSettingsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Reminder preferences state
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminder24HoursBefore, setReminder24HoursBefore] = useState(true);
  const [reminder1HourBefore, setReminder1HourBefore] = useState(true);
  const [reminderDayOf, setReminderDayOf] = useState(true);
  const [dayOfReminderTime, setDayOfReminderTime] = useState('09:00');
  const [notificationMethods, setNotificationMethods] = useState(['push']);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [includeSlotDetails, setIncludeSlotDetails] = useState(true);
  const [includeFacultyDetails, setIncludeFacultyDetails] = useState(true);

  // Fetch user's reminder preferences on mount
  useEffect(() => {
    fetchReminderPreferences();
  }, []);

  const fetchReminderPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reminders/preferences');

      if (response.data.success) {
        setRemindersEnabled(response.data.remindersEnabled);
        setReminder24HoursBefore(response.data.reminder24HoursBefore);
        setReminder1HourBefore(response.data.reminder1HourBefore);
        setReminderDayOf(response.data.reminderDayOf);
        setDayOfReminderTime(response.data.dayOfReminderTime);
        setNotificationMethods(response.data.notificationMethods || ['push']);
        setQuietHoursEnabled(response.data.quietHoursEnabled);
        setQuietHoursStart(response.data.quietHoursStart);
        setQuietHoursEnd(response.data.quietHoursEnd);
        setIncludeSlotDetails(response.data.includeSlotDetails);
        setIncludeFacultyDetails(response.data.includeFacultyDetails);
      }
    } catch (error) {
      console.error('Error fetching reminder preferences:', error);
      Alert.alert('Error', 'Failed to fetch reminder settings');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const response = await api.put('/reminders/preferences', {
        remindersEnabled,
        reminder24HoursBefore,
        reminder1HourBefore,
        reminderDayOf,
        dayOfReminderTime,
        notificationMethods,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
        includeSlotDetails,
        includeFacultyDetails,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Reminder settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save reminder settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotificationMethod = (method) => {
    if (notificationMethods.includes(method)) {
      setNotificationMethods(notificationMethods.filter((m) => m !== method));
    } else {
      setNotificationMethods([...notificationMethods, method]);
    }
  };

  const SettingRow = ({ label, value, onChange, type = 'toggle' }) => {
    return (
      <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
        {type === 'toggle' && (
          <TouchableOpacity
            style={[styles.toggle, { backgroundColor: value ? theme.primary : '#ccc' }]}
            onPress={() => onChange(!value)}
          >
            <View
              style={[
                styles.toggleThumb,
                { transform: [{ translateX: value ? 20 : 0 }] },
              ]}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Reminder Settings</Text>

          {/* Master reminder toggle */}
          <SettingRow
            label="Enable Reminders"
            value={remindersEnabled}
            onChange={setRemindersEnabled}
            type="toggle"
          />

          {remindersEnabled && (
            <>
              {/* Specific reminder types */}
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Reminder Types</Text>

                <SettingRow
                  label="24 Hours Before"
                  value={reminder24HoursBefore}
                  onChange={setReminder24HoursBefore}
                  type="toggle"
                />

                <SettingRow
                  label="1 Hour Before"
                  value={reminder1HourBefore}
                  onChange={setReminder1HourBefore}
                  type="toggle"
                />

                <SettingRow
                  label="Day Of Appointment"
                  value={reminderDayOf}
                  onChange={setReminderDayOf}
                  type="toggle"
                />

                {reminderDayOf && (
                  <View style={[styles.timePickerRow, { borderColor: theme.border }]}>
                    <Text style={[styles.timeLabel, { color: theme.text }]}>
                      Preferred Time:
                    </Text>
                    <TouchableOpacity
                      style={[styles.timeInput, { borderColor: theme.primary }]}
                      onPress={() => {
                        // In a real app, you'd open a time picker
                        Alert.prompt(
                          'Set Day-of Reminder Time',
                          'Enter time in HH:MM format (24-hour)',
                          (time) => {
                            if (time && /^\d{2}:\d{2}$/.test(time)) {
                              setDayOfReminderTime(time);
                            }
                          },
                          'plain-text',
                          dayOfReminderTime
                        );
                      }}
                    >
                      <Text
                        style={[styles.timeInputText, { color: theme.primary }]}
                      >
                        {dayOfReminderTime}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Notification methods */}
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Notification Methods
                </Text>

                <TouchableOpacity
                  style={[styles.methodRow, { borderBottomColor: theme.border }]}
                  onPress={() => toggleNotificationMethod('push')}
                >
                  <Text style={[styles.methodLabel, { color: theme.text }]}>
                    📱 Push Notifications
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: notificationMethods.includes('push')
                          ? theme.primary
                          : 'transparent',
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    {notificationMethods.includes('push') && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.methodRow, { borderBottomColor: theme.border }]}
                  onPress={() => toggleNotificationMethod('email')}
                >
                  <Text style={[styles.methodLabel, { color: theme.text }]}>
                    📧 Email
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: notificationMethods.includes('email')
                          ? theme.primary
                          : 'transparent',
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    {notificationMethods.includes('email') && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.methodRow}
                  onPress={() => toggleNotificationMethod('sms')}
                >
                  <Text style={[styles.methodLabel, { color: theme.text }]}>
                    💬 SMS
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: notificationMethods.includes('sms')
                          ? theme.primary
                          : 'transparent',
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    {notificationMethods.includes('sms') && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Quiet hours */}
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <SettingRow
                  label="Enable Quiet Hours"
                  value={quietHoursEnabled}
                  onChange={setQuietHoursEnabled}
                  type="toggle"
                />

                {quietHoursEnabled && (
                  <View>
                    <View style={[styles.timeRow, { borderColor: theme.border }]}>
                      <Text style={[styles.timeLabel, { color: theme.text }]}>
                        No reminders from:
                      </Text>
                      <View style={styles.timeInputsContainer}>
                        <TouchableOpacity
                          style={[styles.timeInput, { borderColor: theme.primary }]}
                          onPress={() => {
                            Alert.prompt(
                              'Quiet Hours Start',
                              'Enter time in HH:MM format',
                              (time) => {
                                if (time && /^\d{2}:\d{2}$/.test(time)) {
                                  setQuietHoursStart(time);
                                }
                              },
                              'plain-text',
                              quietHoursStart
                            );
                          }}
                        >
                          <Text style={[styles.timeInputText, { color: theme.primary }]}>
                            {quietHoursStart}
                          </Text>
                        </TouchableOpacity>

                        <Text style={[styles.toText, { color: theme.text }]}>to</Text>

                        <TouchableOpacity
                          style={[styles.timeInput, { borderColor: theme.primary }]}
                          onPress={() => {
                            Alert.prompt(
                              'Quiet Hours End',
                              'Enter time in HH:MM format',
                              (time) => {
                                if (time && /^\d{2}:\d{2}$/.test(time)) {
                                  setQuietHoursEnd(time);
                                }
                              },
                              'plain-text',
                              quietHoursEnd
                            );
                          }}
                        >
                          <Text style={[styles.timeInputText, { color: theme.primary }]}>
                            {quietHoursEnd}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Notification details */}
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Notification Details
                </Text>

                <SettingRow
                  label="Include Slot Details"
                  value={includeSlotDetails}
                  onChange={setIncludeSlotDetails}
                  type="toggle"
                />

                <SettingRow
                  label="Include Faculty Details"
                  value={includeFacultyDetails}
                  onChange={setIncludeFacultyDetails}
                  type="toggle"
                />
              </View>
            </>
          )}

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={savePreferences}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Settings</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  timePickerRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  timeRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  timeInputText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toText: {
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReminderSettingsScreen;
