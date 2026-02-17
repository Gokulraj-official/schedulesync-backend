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
import api from '../../config/api';
import moment from 'moment';
import { useSocket } from '../../context/SocketContext';

const AvailableSlotsScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { socket } = useSocket();
  const { facultyId } = route.params;
  const [slots, setSlots] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSlots();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleSlotUpdated = (payload) => {
      if (payload?.facultyId?.toString?.() !== facultyId?.toString?.()) return;
      loadSlots();
    };

    socket.on('slot_updated', handleSlotUpdated);
    return () => {
      socket.off('slot_updated', handleSlotUpdated);
    };
  }, [socket, facultyId]);

  const loadSlots = async () => {
    try {
      const response = await api.get(`/slots/available?facultyId=${facultyId}`);
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

  const groupSlotsByDate = () => {
    const grouped = {};
    slots.forEach((slot) => {
      const date = moment(slot.startTime).format('YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    return Object.keys(grouped)
      .sort()
      .map((date) => ({
        date,
        slots: grouped[date].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
      }));
  };

  const renderSlot = (slot) => {
    const isToday = moment(slot.startTime).isSame(moment(), 'day');
    const availableSpots = slot.capacity - slot.bookedCount;

    return (
      <TouchableOpacity
        key={slot._id}
        style={[styles.slotCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate('BookSlot', { slotId: slot._id })}
      >
        <View style={styles.slotHeader}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={[styles.timeText, { color: colors.text }]}>
              {moment(slot.startTime).format('h:mm A')} - {moment(slot.endTime).format('h:mm A')}
            </Text>
          </View>
          {isToday && (
            <View style={[styles.todayBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          )}
        </View>

        <View style={styles.slotDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {slot.location}
            </Text>
          </View>
          {slot.notes && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
                {slot.notes}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.slotFooter}>
          <View style={styles.capacityContainer}>
            <Ionicons name="people-outline" size={16} color={colors.info} />
            <Text style={[styles.capacityText, { color: colors.text }]}>
              {availableSpots} spot{availableSpots !== 1 ? 's' : ''} available
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateGroup = ({ item }) => (
    <View style={styles.dateGroup}>
      <View style={[styles.dateHeader, { backgroundColor: colors.card }]}>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {moment(item.date).format('dddd, MMMM DD, YYYY')}
        </Text>
        <Text style={[styles.slotCount, { color: colors.textSecondary }]}>
          {item.slots.length} slot{item.slots.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {item.slots.map(renderSlot)}
    </View>
  );

  const groupedSlots = groupSlotsByDate();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={groupedSlots}
        renderItem={renderDateGroup}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No available slots
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Check back later for new appointments
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
  listContent: {
    padding: 15,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slotCount: {
    fontSize: 12,
  },
  slotCard: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  todayText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  slotDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  slotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capacityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default AvailableSlotsScreen;
