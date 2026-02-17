import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import moment from 'moment';
import { useSocket } from '../../context/SocketContext';

const FacultyHomeScreen = ({ navigation }) => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const { socket } = useSocket();
  const [statistics, setStatistics] = useState(null);
  const [todaySlots, setTodaySlots] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [tomorrowSummary, setTomorrowSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    if (!socket) return;

    const refresh = () => {
      loadData();
    };

    socket.on('booking_created', refresh);
    socket.on('booking_updated', refresh);
    socket.on('slot_updated', refresh);

    return () => {
      socket.off('booking_created', refresh);
      socket.off('booking_updated', refresh);
      socket.off('slot_updated', refresh);
    };
  }, [socket]);

  const loadData = async () => {
    try {
      const [statsRes, todayRes, bookingsRes, tomorrowRes] = await Promise.all([
        api.get('/users/statistics'),
        api.get('/slots/today'),
        api.get('/bookings/faculty-bookings?status=pending'),
        api.get('/bookings/faculty-tomorrow-summary'),
      ]);

      setStatistics(statsRes.data.statistics);
      setTodaySlots(todayRes.data.slots || []);
      setPendingBookings(bookingsRes.data.bookings || []);
      setTomorrowSummary(tomorrowRes.data || null);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const sendTomorrowNotice = async () => {
    try {
      const count = tomorrowSummary?.count || 0;
      if (!count) {
        return Alert.alert('No bookings', 'No approved bookings for tomorrow.');
      }

      Alert.alert(
        'Notify Students',
        `Send a reminder to ${count} student(s) for tomorrow's bookings?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send',
            onPress: async () => {
              await api.post('/bookings/faculty-notify-tomorrow', {
                message: "You have an appointment scheduled for tomorrow. Please be on time.",
              });
              Alert.alert('Sent', 'Reminder sent to students.');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to notify students');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleOnlineStatus = async (value) => {
    try {
      setIsOnline(value);
      await api.put('/users/online-status', { isOnline: value });
      updateUser({ isOnline: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
      setIsOnline(!value);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.department}>{user?.department}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
              <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ChatsList')} style={styles.iconButton}>
              <Ionicons name="chatbubbles-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Online Status</Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isOnline ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.content}>
        {!!tomorrowSummary?.count && tomorrowSummary.count >= 3 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tomorrow</Text>
            </View>

            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>You have {tomorrowSummary.count} booking(s) tomorrow.</Text>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary, alignSelf: 'flex-start', marginTop: 10 }]}
              onPress={sendTomorrowNotice}
            >
              <Ionicons name="notifications-outline" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Notify All Students</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar" size={30} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statistics?.totalSlots || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Slots</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="checkmark-circle" size={30} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statistics?.availableSlots || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Available</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="people" size={30} color={colors.info} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statistics?.bookedSlots || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Booked</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="time" size={30} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statistics?.pendingBookings || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CalendarView')}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>View Calendar</Text>
            </TouchableOpacity>
          </View>

          {todaySlots.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No appointments today
            </Text>
          ) : (
            todaySlots.map((slot) => (
              <View key={slot._id} style={[styles.slotItem, { borderColor: colors.border }]}>
                <View style={styles.slotTime}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={[styles.slotTimeText, { color: colors.text }]}>
                    {moment(slot.startTime).format('h:mm A')} -{' '}
                    {moment(slot.endTime).format('h:mm A')}
                  </Text>
                </View>
                <Text style={[styles.slotLocation, { color: colors.textSecondary }]}>
                  📍 {slot.location}
                </Text>
                {slot.bookings && slot.bookings.length > 0 && (
                  <Text style={[styles.slotBookings, { color: colors.success }]}>
                    {slot.bookings.length} booking(s)
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Approvals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {pendingBookings.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No pending bookings
            </Text>
          ) : (
            pendingBookings.slice(0, 3).map((booking) => (
              <TouchableOpacity
                key={booking._id}
                style={[styles.bookingItem, { borderColor: colors.border }]}
                onPress={() =>
                  navigation.navigate('Bookings', {
                    screen: 'BookingDetails',
                    params: { bookingId: booking._id },
                  })
                }
              >
                <View style={styles.bookingInfo}>
                  <Text style={[styles.studentName, { color: colors.text }]}>
                    {booking.student?.name}
                  </Text>
                  <Text style={[styles.bookingPurpose, { color: colors.textSecondary }]}>
                    {booking.purpose}
                  </Text>
                  <Text style={[styles.bookingTime, { color: colors.textSecondary }]}>
                    {moment(booking.createdAt).fromNow()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Slots', { screen: 'SlotManagement', params: { openCreate: true } })}
          >
            <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Create Slot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => navigation.navigate('Slots')}
          >
            <Ionicons name="calendar-outline" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Manage Slots</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 5,
  },
  department: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
  slotItem: {
    padding: 15,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  slotTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  slotTimeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  slotLocation: {
    fontSize: 14,
    marginTop: 5,
  },
  slotBookings: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  bookingInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  bookingPurpose: {
    fontSize: 14,
    marginBottom: 3,
  },
  bookingTime: {
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FacultyHomeScreen;
