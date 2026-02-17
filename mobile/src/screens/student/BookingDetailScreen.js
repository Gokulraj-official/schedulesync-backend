import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../config/api';
import moment from 'moment';
import { useSocket } from '../../context/SocketContext';

const BookingDetailScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { socket } = useSocket();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBooking();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUpdated = (payload) => {
      if (payload?.bookingId?.toString?.() !== bookingId?.toString?.()) return;
      loadBooking();
    };

    socket.on('booking_updated', handleUpdated);
    return () => {
      socket.off('booking_updated', handleUpdated);
    };
  }, [socket, bookingId]);

  const loadBooking = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.booking);
    } catch (error) {
      Alert.alert('Error', 'Failed to load booking details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await api.put(`/bookings/${bookingId}/cancel`, {
                reason: 'Cancelled by student',
              });
              Alert.alert('Success', 'Booking cancelled successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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

  const canCancel = booking.status === 'pending' || booking.status === 'approved';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.statusCard, { backgroundColor: getStatusColor(booking.status) }]}>
        <Text style={styles.statusTitle}>Status</Text>
        <Text style={styles.statusValue}>{booking.status.toUpperCase()}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Faculty Information</Text>
        <View style={styles.facultyInfo}>
          {booking.faculty?.profilePhoto ? (
            <Image source={{ uri: booking.faculty.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {booking.faculty?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.facultyDetails}>
            <Text style={[styles.facultyName, { color: colors.text }]}>
              {booking.faculty?.name}
            </Text>
            <Text style={[styles.facultyEmail, { color: colors.textSecondary }]}>
              {booking.faculty?.email}
            </Text>
            <Text style={[styles.facultyDept, { color: colors.textSecondary }]}>
              {booking.faculty?.department}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appointment Details</Text>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {moment(booking.slot?.startTime).format('dddd, MMMM DD, YYYY')}
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Time</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {moment(booking.slot?.startTime).format('h:mm A')} -{' '}
              {moment(booking.slot?.endTime).format('h:mm A')}
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {booking.slot?.location}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Purpose</Text>
        <Text style={[styles.purposeText, { color: colors.text }]}>{booking.purpose}</Text>
      </View>

      {booking.rejectionReason && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>Rejection Reason</Text>
          <Text style={[styles.reasonText, { color: colors.text }]}>
            {booking.rejectionReason}
          </Text>
        </View>
      )}

      {booking.cancellationReason && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Cancellation Reason
          </Text>
          <Text style={[styles.reasonText, { color: colors.text }]}>
            {booking.cancellationReason}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.chatButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('BookingChat', { bookingId })}
      >
        <Ionicons name="chatbubbles-outline" size={24} color="#ffffff" />
        <Text style={styles.chatButtonText}>Open Chat</Text>
      </TouchableOpacity>

      {canCancel && (
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.error }]}
          onPress={handleCancel}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={24} color="#ffffff" />
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    padding: 20,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 5,
  },
  section: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  facultyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  facultyDetails: {
    marginLeft: 15,
    flex: 1,
  },
  facultyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  facultyEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  facultyDept: {
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailContent: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  purposeText: {
    fontSize: 16,
    lineHeight: 24,
  },
  reasonText: {
    fontSize: 16,
    lineHeight: 24,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginTop: 5,
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 20,
  },
});

export default BookingDetailScreen;
