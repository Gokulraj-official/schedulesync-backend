import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../config/api';
import moment from 'moment';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const CalendarViewScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { socket } = useSocket();
  const { user } = useAuth();
  const myId = user?.id || user?._id;
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [slots, setSlots] = useState([]);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    loadMonthSlots();
  }, []);

  useEffect(() => {
    loadDaySlots();
  }, [selectedDate]);

  useEffect(() => {
    if (!socket || !myId) return;

    const handleSlotUpdated = (payload) => {
      if (payload?.facultyId?.toString?.() !== myId?.toString?.()) return;
      loadMonthSlots();
      loadDaySlots();
    };

    socket.on('slot_updated', handleSlotUpdated);
    return () => {
      socket.off('slot_updated', handleSlotUpdated);
    };
  }, [socket, myId, selectedDate]);

  const loadMonthSlots = async () => {
    try {
      const startDate = moment().startOf('month').toISOString();
      const endDate = moment().endOf('month').toISOString();
      
      const response = await api.get(`/slots/my-slots?startDate=${startDate}&endDate=${endDate}`);
      const slotsData = response.data.slots || [];

      const marked = {};
      slotsData.forEach((slot) => {
        const date = moment(slot.startTime).format('YYYY-MM-DD');
        if (!marked[date]) {
          marked[date] = { marked: true, dotColor: colors.primary };
        }
      });

      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: colors.primary,
      };

      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading month slots:', error);
    }
  };

  const loadDaySlots = async () => {
    try {
      const startDate = moment(selectedDate).startOf('day').toISOString();
      const endDate = moment(selectedDate).endOf('day').toISOString();
      
      const response = await api.get(`/slots/my-slots?startDate=${startDate}&endDate=${endDate}`);
      setSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error loading day slots:', error);
    }
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    const newMarked = { ...markedDates };
    Object.keys(newMarked).forEach((key) => {
      if (newMarked[key].selected) {
        delete newMarked[key].selected;
        delete newMarked[key].selectedColor;
      }
    });
    newMarked[day.dateString] = {
      ...newMarked[day.dateString],
      selected: true,
      selectedColor: colors.primary,
    };
    setMarkedDates(newMarked);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.card,
          textSectionTitleColor: colors.text,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textSecondary,
          dotColor: colors.primary,
          selectedDotColor: '#ffffff',
          arrowColor: colors.primary,
          monthTextColor: colors.text,
        }}
      />

      <View style={styles.slotsContainer}>
        <Text style={[styles.slotsTitle, { color: colors.text }]}>
          Slots for {moment(selectedDate).format('MMMM DD, YYYY')}
        </Text>

        <ScrollView style={styles.slotsList}>
          {slots.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No slots for this day
              </Text>
            </View>
          ) : (
            slots.map((slot) => (
              <View
                key={slot._id}
                style={[styles.slotCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.slotTime}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={[styles.slotTimeText, { color: colors.text }]}>
                    {moment(slot.startTime).format('h:mm A')} -{' '}
                    {moment(slot.endTime).format('h:mm A')}
                  </Text>
                </View>
                <View style={styles.slotDetail}>
                  <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.slotDetailText, { color: colors.textSecondary }]}>
                    {slot.location}
                  </Text>
                </View>
                {slot.notes && (
                  <View style={styles.slotDetail}>
                    <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
                    <Text style={[styles.slotDetailText, { color: colors.textSecondary }]}>
                      {slot.notes}
                    </Text>
                  </View>
                )}
                <View style={styles.slotFooter}>
                  <View style={styles.capacityInfo}>
                    <Ionicons name="people-outline" size={18} color={colors.info} />
                    <Text style={[styles.capacityText, { color: colors.text }]}>
                      {slot.bookedCount}/{slot.capacity}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: slot.status === 'active' ? colors.success : colors.error },
                    ]}
                  >
                    <Text style={styles.statusText}>{slot.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slotsContainer: {
    flex: 1,
    padding: 15,
  },
  slotsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  slotsList: {
    flex: 1,
  },
  slotCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  slotTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTimeText: {
    fontSize: 16,
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

export default CalendarViewScreen;
