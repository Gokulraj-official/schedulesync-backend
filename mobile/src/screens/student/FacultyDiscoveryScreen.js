import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../context/ThemeContext';
import api from '../../config/api';

const FacultyDiscoveryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const departments = [
    'all',
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Management',
  ];

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [searchQuery, selectedDepartment, faculty]);

  const loadFaculty = async () => {
    try {
      const response = await api.get('/users/faculty');
      setFaculty(response.data.faculty || []);
    } catch (error) {
      console.error('Error loading faculty:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFaculty();
    setRefreshing(false);
  };

  const filterFaculty = () => {
    let filtered = faculty;

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter((f) => f.department === selectedDepartment);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFaculty(filtered);
  };

  const renderFaculty = ({ item }) => (
    <TouchableOpacity
      style={[styles.facultyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate('FacultyDetail', { facultyId: item._id })}
    >
      <View style={styles.facultyHeader}>
        {item.profilePhoto ? (
          <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.facultyInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.facultyName, { color: colors.text }]}>{item.name}</Text>
            {item.isOnline && (
              <View style={[styles.onlineBadge, { backgroundColor: colors.online }]}>
                <View style={styles.onlineDot} />
              </View>
            )}
          </View>
          <Text style={[styles.facultyDept, { color: colors.textSecondary }]}>
            {item.department}
          </Text>
          {item.statusMessage && (
            <Text style={[styles.statusMessage, { color: colors.textSecondary }]}>
              💬 {item.statusMessage}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
      </View>

      {item.bio && (
        <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.bio}
        </Text>
      )}

      {item.qualifications && item.qualifications.length > 0 && (
        <View style={styles.qualifications}>
          <Ionicons name="school-outline" size={16} color={colors.primary} />
          <Text style={[styles.qualText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.qualifications[0]}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search faculty by name..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.filterBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="filter-outline" size={20} color={colors.textSecondary} />
          <Picker
            selectedValue={selectedDepartment}
            onValueChange={setSelectedDepartment}
            style={[styles.picker, { color: colors.text }]}
          >
            {departments.map((dept) => (
              <Picker.Item
                key={dept}
                label={dept === 'all' ? 'All Departments' : dept}
                value={dept}
              />
            ))}
          </Picker>
        </View>
      </View>

      <FlatList
        data={filteredFaculty}
        renderItem={renderFaculty}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No faculty found
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
  searchContainer: {
    padding: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  picker: {
    flex: 1,
    marginLeft: 5,
  },
  listContent: {
    padding: 15,
  },
  facultyCard: {
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
  facultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  facultyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  facultyName: {
    fontSize: 18,
    fontWeight: '600',
  },
  onlineBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  facultyDept: {
    fontSize: 14,
    marginTop: 2,
  },
  statusMessage: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  qualifications: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qualText: {
    fontSize: 13,
    flex: 1,
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

export default FacultyDiscoveryScreen;
