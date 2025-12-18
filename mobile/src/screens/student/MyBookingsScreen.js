import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import moment from 'moment';

const MyBookingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [filter]);

  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [filter])
  );

  const loadBookings = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await api.get(`/bookings/my-bookings${params}`);
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'cancelled':
        return colors.textSecondary;
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'approved':
        return 'checkmark-circle-outline';
      case 'rejected':
        return 'close-circle-outline';
      case 'cancelled':
        return 'ban-outline';
      default:
        return 'help-outline';
    }
  };

  const renderBooking = ({ item }) => {
    const isPast = moment(item.slot?.endTime).isBefore(moment());
    const isUpcoming = item.status === 'approved' && moment(item.slot?.startTime).isAfter(moment());

    return (
      <TouchableOpacity
        style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id })}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.facultyInfo}>
            <Text style={[styles.facultyName, { color: colors.text }]}>
              {item.faculty?.name}
            </Text>
            <Text style={[styles.facultyDept, { color: colors.textSecondary }]}>
              {item.faculty?.department}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color="#ffffff" />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {moment(item.slot?.startTime).format('MMM DD, YYYY')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {moment(item.slot?.startTime).format('h:mm A')} -{' '}
              {moment(item.slot?.endTime).format('h:mm A')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>{item.slot?.location}</Text>
          </View>
        </View>

        <View style={styles.purposeContainer}>
          <Text style={[styles.purposeLabel, { color: colors.textSecondary }]}>Purpose:</Text>
          <Text style={[styles.purposeText, { color: colors.text }]} numberOfLines={2}>
            {item.purpose}
          </Text>
        </View>

        {isUpcoming && (
          <View style={[styles.upcomingBadge, { backgroundColor: colors.info }]}>
            <Ionicons name="time-outline" size={14} color="#ffffff" />
            <Text style={styles.upcomingText}>
              {moment(item.slot?.startTime).fromNow()}
            </Text>
          </View>
        )}

        {isPast && item.status === 'approved' && (
          <View style={[styles.pastBadge, { backgroundColor: colors.textSecondary }]}>
            <Text style={styles.pastText}>Completed</Text>
          </View>
        )}

        <View style={styles.bookingFooter}>
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
            Booked {moment(item.createdAt).fromNow()}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filterContainer}>
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterBtn,
              filter === status && { backgroundColor: colors.primary },
              { borderColor: colors.border },
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                filter === status ? { color: '#ffffff' } : { color: colors.text },
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No {filter !== 'all' ? filter : ''} bookings
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  bookingCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  facultyInfo: {
    flex: 1,
  },
  facultyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 3,
  },
  facultyDept: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
  },
  purposeContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  purposeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  purposeText: {
    fontSize: 14,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    marginBottom: 10,
  },
  upcomingText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  pastBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  pastText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
});

export default MyBookingsScreen;
