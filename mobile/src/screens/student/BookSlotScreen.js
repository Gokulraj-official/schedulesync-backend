import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../config/api';
import moment from 'moment';

const BookSlotScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { slotId } = route.params;
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [hasConflict, setHasConflict] = useState(false);

  useEffect(() => {
    loadSlot();
    checkConflict();
  }, []);

  const loadSlot = async () => {
    try {
      const response = await api.get(`/slots/${slotId}`);
      setSlot(response.data.slot);
    } catch (error) {
      Alert.alert('Error', 'Failed to load slot details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkConflict = async () => {
    try {
      const response = await api.get('/bookings/my-bookings?status=approved');
      const approvedBookings = response.data.bookings || [];
      
      const slotResponse = await api.get(`/slots/${slotId}`);
      const currentSlot = slotResponse.data.slot;
      
      const conflict = approvedBookings.some((booking) => {
        const existingStart = moment(booking.slot?.startTime);
        const existingEnd = moment(booking.slot?.endTime);
        const newStart = moment(currentSlot.startTime);
        const newEnd = moment(currentSlot.endTime);
        
        return (
          (newStart.isSameOrAfter(existingStart) && newStart.isBefore(existingEnd)) ||
          (newEnd.isAfter(existingStart) && newEnd.isSameOrBefore(existingEnd)) ||
          (newStart.isBefore(existingStart) && newEnd.isAfter(existingEnd))
        );
      });
      
      setHasConflict(conflict);
    } catch (error) {
      console.error('Error checking conflict:', error);
    }
  };

  const handleBooking = async () => {
    if (!purpose.trim()) {
      Alert.alert('Error', 'Please provide the purpose of your appointment');
      return;
    }

    if (hasConflict) {
      Alert.alert(
        'Time Conflict',
        'You have another approved appointment at this time. Do you still want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: () => submitBooking() },
        ]
      );
    } else {
      submitBooking();
    }
  };

  const submitBooking = async () => {
    setBooking(true);
    try {
      await api.post('/bookings', {
        slotId: slot._id,
        purpose: purpose.trim(),
      });

      Alert.alert('Success', 'Booking request submitted successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Bookings'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book slot');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const availableSpots = slot.capacity - slot.bookedCount;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Ionicons name="calendar" size={50} color="#ffffff" />
        <Text style={styles.headerTitle}>Book Appointment</Text>
      </View>

      <View style={styles.content}>
        {hasConflict && (
          <View style={[styles.warningBox, { backgroundColor: colors.warning }]}>
            <Ionicons name="warning-outline" size={24} color="#ffffff" />
            <Text style={styles.warningText}>
              You have a conflicting appointment at this time
            </Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Faculty Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Name</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {slot.faculty?.name}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Department</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {slot.faculty?.department}
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
                {moment(slot.startTime).format('dddd, MMMM DD, YYYY')}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Time</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {moment(slot.startTime).format('h:mm A')} - {moment(slot.endTime).format('h:mm A')}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{slot.location}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Availability</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {availableSpots} spot{availableSpots !== 1 ? 's' : ''} available
              </Text>
            </View>
          </View>
          {slot.notes && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Notes</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{slot.notes}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Purpose of Appointment *</Text>
          <TextInput
            style={[
              styles.purposeInput,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Describe the purpose of your appointment..."
            placeholderTextColor={colors.textSecondary}
            value={purpose}
            onChangeText={setPurpose}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {purpose.length}/300
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={handleBooking}
          disabled={booking}
        >
          {booking ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" />
              <Text style={styles.bookButtonText}>Submit Booking Request</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Your booking request will be sent to the faculty for approval. You'll be notified once
            it's reviewed.
          </Text>
        </View>
      </View>
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
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
  },
  content: {
    padding: 15,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailContent: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  purposeInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
    marginBottom: 15,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
});

export default BookSlotScreen;
