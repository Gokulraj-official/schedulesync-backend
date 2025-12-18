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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../config/api';
import moment from 'moment';

const BookingDetailsScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    loadBooking();
  }, []);

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

  const handleApprove = () => {
    Alert.alert('Approve Booking', 'Are you sure you want to approve this booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          setActionLoading(true);
          try {
            await api.put(`/bookings/${bookingId}/approve`);
            Alert.alert('Success', 'Booking approved successfully', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to approve booking');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/bookings/${bookingId}/reject`, { reason: rejectionReason });
      Alert.alert('Success', 'Booking rejected', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await api.put(`/bookings/${bookingId}/cancel`, {
              reason: 'Cancelled by faculty',
            });
            Alert.alert('Success', 'Booking cancelled', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.statusCard, { backgroundColor: getStatusColor(booking.status) }]}>
        <Text style={styles.statusTitle}>Status</Text>
        <Text style={styles.statusValue}>{booking.status.toUpperCase()}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Student Information</Text>
        <View style={styles.studentInfo}>
          {booking.student?.profilePhoto ? (
            <Image source={{ uri: booking.student.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {booking.student?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.studentDetails}>
            <Text style={[styles.studentName, { color: colors.text }]}>
              {booking.student?.name}
            </Text>
            <Text style={[styles.studentEmail, { color: colors.textSecondary }]}>
              {booking.student?.email}
            </Text>
            <Text style={[styles.studentDept, { color: colors.textSecondary }]}>
              {booking.student?.department}
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
              {moment(booking.slot?.startTime).format('MMMM DD, YYYY')}
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

      {booking.status === 'pending' && (
        <View style={styles.actionsContainer}>
          {!showRejectInput ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                onPress={handleApprove}
                disabled={actionLoading}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={() => setShowRejectInput(true)}
                disabled={actionLoading}
              >
                <Ionicons name="close-circle-outline" size={24} color="#ffffff" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.rejectContainer}>
              <TextInput
                style={[
                  styles.rejectInput,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="Reason for rejection..."
                placeholderTextColor={colors.textSecondary}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
              />
              <View style={styles.rejectActions}>
                <TouchableOpacity
                  style={[styles.rejectBtn, { backgroundColor: colors.textSecondary }]}
                  onPress={() => {
                    setShowRejectInput(false);
                    setRejectionReason('');
                  }}
                >
                  <Text style={styles.rejectBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectBtn, { backgroundColor: colors.error }]}
                  onPress={handleReject}
                  disabled={actionLoading}
                >
                  <Text style={styles.rejectBtnText}>Confirm Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {booking.status === 'approved' && (
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.error }]}
          onPress={handleCancel}
          disabled={actionLoading}
        >
          <Ionicons name="ban-outline" size={24} color="#ffffff" />
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
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
  studentInfo: {
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
  studentDetails: {
    marginLeft: 15,
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  studentDept: {
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
  actionsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectContainer: {
    flex: 1,
  },
  rejectInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  rejectActions: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 20,
  },
});

export default BookingDetailsScreen;
