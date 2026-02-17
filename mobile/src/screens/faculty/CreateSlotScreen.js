import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../config/api';
import moment from 'moment';

const CreateSlotScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [startPickerMode, setStartPickerMode] = useState('date');
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [endPickerMode, setEndPickerMode] = useState('date');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [loading, setLoading] = useState(false);

  const mergeDateAndTime = (base, picked, mode) => {
    const merged = new Date(base);
    if (mode === 'date') {
      merged.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
    } else {
      merged.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    }
    return merged;
  };

  const onStartDateChange = useCallback(
    (event, selectedDate) => {
      if (event?.type === 'dismissed' || !selectedDate) {
        setShowStartPicker(false);
        return;
      }

      const updatedStart = mergeDateAndTime(startDate, selectedDate, startPickerMode);

      if (Platform.OS === 'android' && startPickerMode === 'date') {
        setStartDate(updatedStart);
        setStartPickerMode('time');
        setShowStartPicker(true);
        return;
      }

      setStartDate(updatedStart);
      setShowStartPicker(false);
      setStartPickerMode('date');

      if (updatedStart >= endDate) {
        setEndDate(new Date(updatedStart.getTime() + 3600000));
      }
    },
    [startDate, endDate, startPickerMode]
  );

  const onEndDateChange = useCallback(
    (event, selectedDate) => {
      if (event?.type === 'dismissed' || !selectedDate) {
        setShowEndPicker(false);
        return;
      }

      const updatedEnd = mergeDateAndTime(endDate, selectedDate, endPickerMode);

      if (Platform.OS === 'android' && endPickerMode === 'date') {
        setEndDate(updatedEnd);
        setEndPickerMode('time');
        setShowEndPicker(true);
        return;
      }

      setEndDate(updatedEnd);
      setShowEndPicker(false);
      setEndPickerMode('date');
    },
    [endDate, endPickerMode]
  );

  const handleCreateSlot = async () => {
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      await api.post('/slots', {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        location: location.trim(),
        notes: notes.trim(),
        capacity: parseInt(capacity) || 1,
      });

      Alert.alert('Success', 'Slot created successfully', [
        { text: 'OK', onPress: () => navigation.navigate('SlotManagement') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Start Time *</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              setStartPickerMode('date');
              setShowStartPicker(true);
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {moment(startDate).format('MMM DD, YYYY - h:mm A')}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              testID="startDateTimePicker"
              value={startDate}
              mode={Platform.OS === 'android' ? startPickerMode : 'datetime'}
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onStartDateChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>End Time *</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              setEndPickerMode('date');
              setShowEndPicker(true);
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {moment(endDate).format('MMM DD, YYYY - h:mm A')}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              testID="endDateTimePicker"
              value={endDate}
              mode={Platform.OS === 'android' ? endPickerMode : 'datetime'}
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={startDate}
              onChange={onEndDateChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Location *</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g., Room 101, Building A"
              placeholderTextColor={colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Capacity</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Number of students"
              placeholderTextColor={colors.textSecondary}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Notes (Optional)</Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Add any additional information..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateSlot}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Slot'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
  },
  createButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateSlotScreen;
