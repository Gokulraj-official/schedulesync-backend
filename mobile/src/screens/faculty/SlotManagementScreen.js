import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import moment from 'moment';

const SlotManagementScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [slots, setSlots] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSlots();
  }, [filter]);

  useFocusEffect(
    React.useCallback(() => {
      loadSlots();
    }, [filter])
  );

  const loadSlots = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await api.get(`/slots/my-slots${params}`);
      setSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSlots();
    setRefreshing(false);
  };

  const handleCancelSlot = (slotId) => {
    Alert.alert('Cancel Slot', 'Are you sure you want to cancel this slot?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await api.put(`/slots/${slotId}/cancel`);
            Alert.alert('Success', 'Slot cancelled successfully');
            loadSlots();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel slot');
          }
        },
      },
    ]);
  };

  const handleDeleteSlot = (slotId) => {
    Alert.alert('Delete Slot', 'Are you sure you want to delete this slot?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/slots/${slotId}`);
            Alert.alert('Success', 'Slot deleted successfully');
            loadSlots();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete slot');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'cancelled':
        return colors.error;
      case 'completed':
        return colors.textSecondary;
      default:
        return colors.text;
    }
  };

  const renderSlot = ({ item }) => {
    const isPast = moment(item.endTime).isBefore(moment());
    const isToday = moment(item.startTime).isSame(moment(), 'day');

    return (
      <View style={[styles.slotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.slotHeader}>
          <View style={styles.slotDateContainer}>
            <Text style={[styles.slotDate, { color: colors.text }]}>
              {moment(item.startTime).format('MMM DD, YYYY')}
            </Text>
            {isToday && (
              <View style={[styles.todayBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.slotTime}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <Text style={[styles.slotTimeText, { color: colors.text }]}>
            {moment(item.startTime).format('h:mm A')} - {moment(item.endTime).format('h:mm A')}
          </Text>
        </View>

        <View style={styles.slotDetail}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.slotDetailText, { color: colors.textSecondary }]}>
            {item.location}
          </Text>
        </View>

        {item.notes && (
          <View style={styles.slotDetail}>
            <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.slotDetailText, { color: colors.textSecondary }]}>
              {item.notes}
            </Text>
          </View>
        )}

        <View style={styles.slotFooter}>
          <View style={styles.capacityInfo}>
            <Ionicons name="people-outline" size={18} color={colors.info} />
            <Text style={[styles.capacityText, { color: colors.text }]}>
              {item.bookedCount}/{item.capacity}
            </Text>
          </View>

          {item.status === 'active' && !isPast && (
            <View style={styles.slotActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('EditSlot', { slotId: item._id })}
              >
                <Ionicons name="create-outline" size={18} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.warning }]}
                onPress={() => handleCancelSlot(item._id)}
              >
                <Ionicons name="close-circle-outline" size={18} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.error }]}
                onPress={() => handleDeleteSlot(item._id)}
              >
                <Ionicons name="trash-outline" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filterContainer}>
        {['all', 'active', 'cancelled'].map((status) => (
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
        data={slots}
        renderItem={renderSlot}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No slots found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CreateSlot')}
      >
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>
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
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  slotCard: {
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
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  slotDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  slotTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTimeText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  slotDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  slotDetailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  slotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  capacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  capacityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default SlotManagementScreen;
