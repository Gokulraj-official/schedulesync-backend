import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const AdminBookingsScreen = () => {
  const { colors } = useTheme();

  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const queryParams = useMemo(() => {
    if (filter === 'all') return '';
    return `?status=${filter}`;
  }, [filter]);

  const loadBookings = async () => {
    try {
      const res = await api.get(`/admin/bookings${queryParams}`);
      setBookings(res.data.bookings || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load bookings');
    }
  };

  useEffect(() => {
    loadBookings();
  }, [queryParams]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const openCancel = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('Cancelled by admin');
    setCancelModalOpen(true);
  };

  const submitCancel = async () => {
    if (!selectedBooking?._id) return;

    setSubmitting(true);
    try {
      await api.put(`/admin/bookings/${selectedBooking._id}/force-cancel`, {
        reason: cancelReason || 'Cancelled by admin',
      });
      setCancelModalOpen(false);
      setSelectedBooking(null);
      setCancelReason('');
      await loadBookings();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status) => {
    if (status === 'pending') return colors.warning;
    if (status === 'approved') return colors.success;
    if (status === 'rejected') return colors.error;
    if (status === 'cancelled') return colors.textSecondary;
    return colors.text;
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
>
        <View style={styles.rowBetween}>
          <View style={styles.col}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.student?.name || 'Student'} → {item.faculty?.name || 'Faculty'}
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {moment(item.createdAt).fromNow()} • {moment(item.slot?.startTime).format('MMM D, YYYY h:mm A')}
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.purpose}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}
>
            <Text style={styles.badgeText}>{(item.status || '').toUpperCase()}</Text>
          </View>
        </View>

        {(item.status === 'pending' || item.status === 'approved') && (
          <TouchableOpacity
            style={[styles.dangerBtn, { borderColor: colors.border }]}
            onPress={() => openCancel(item)}
          >
            <Ionicons name="ban-outline" size={18} color={colors.error} />
            <Text style={[styles.dangerText, { color: colors.error }]}>Force Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filters = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}
>
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              { borderColor: colors.border },
              filter === f && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: filter === f ? '#fff' : colors.text }]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No bookings</Text>
          </View>
        }
      />

      <Modal
        visible={cancelModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!submitting) setCancelModalOpen(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (!submitting) setCancelModalOpen(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Force Cancel Booking</Text>

                <Text style={[styles.modalMeta, { color: colors.textSecondary }]}>
                  {selectedBooking?.student?.name || 'Student'} → {selectedBooking?.faculty?.name || 'Faculty'}
                </Text>

                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  placeholder="Reason"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { borderColor: colors.border }]}
                    onPress={() => setCancelModalOpen(false)}
                    disabled={submitting}
                  >
                    <Text style={[styles.modalBtnText, { color: colors.text }]}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtnPrimary, { backgroundColor: colors.error, opacity: submitting ? 0.7 : 1 }]}
                    onPress={submitCancel}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.modalBtnPrimaryText}>Cancel</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterBtn: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 8 },
  filterText: { fontSize: 12, fontWeight: '700' },
  list: { padding: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  col: { flex: 1 },
  title: { fontSize: 15, fontWeight: '800' },
  meta: { marginTop: 4, fontSize: 12 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 10 },
  dangerBtn: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  dangerText: { fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 10, fontSize: 16 },
  modalCard: { borderWidth: 1, borderRadius: 12, padding: 14 },
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 18, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalTitle: { fontSize: 16, fontWeight: '900' },
  modalMeta: { marginTop: 6, fontSize: 12 },
  input: { marginTop: 10, borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 70 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalBtn: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  modalBtnText: { fontWeight: '800' },
  modalBtnPrimary: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  modalBtnPrimaryText: { color: '#fff', fontWeight: '900' },
});

export default AdminBookingsScreen;
