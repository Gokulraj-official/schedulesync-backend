import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../config/api';

const FacultyDetailScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { facultyId } = route.params;
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadFaculty();
    checkFavorite();
  }, []);

  const loadFaculty = async () => {
    try {
      const response = await api.get(`/users/faculty/${facultyId}`);
      setFaculty(response.data.faculty);
    } catch (error) {
      Alert.alert('Error', 'Failed to load faculty details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await api.get('/users/favorites');
      const favorites = response.data.favorites || [];
      setIsFavorite(favorites.some((f) => f._id === facultyId));
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/users/favorites/${facultyId}`);
        setIsFavorite(false);
        Alert.alert('Success', 'Removed from favorites');
      } else {
        await api.post('/users/favorites', { facultyId });
        setIsFavorite(true);
        Alert.alert('Success', 'Added to favorites');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update favorites');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        {faculty?.profilePhoto ? (
          <Image source={{ uri: faculty.profilePhoto }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImageText}>{faculty?.name?.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.name}>{faculty?.name}</Text>
        <Text style={styles.department}>{faculty?.department}</Text>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: faculty?.isOnline ? colors.online : colors.offline }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {faculty?.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          {faculty?.statusMessage && (
            <Text style={styles.statusMessage}>💬 {faculty.statusMessage}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {faculty?.bio && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>{faculty.bio}</Text>
          </View>
        )}

        {faculty?.qualifications && faculty.qualifications.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Qualifications</Text>
            {faculty.qualifications.map((qual, index) => (
              <View key={index} style={styles.qualificationItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.qualificationText, { color: colors.text }]}>{qual}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.text }]}>{faculty?.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.viewSlotsButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AvailableSlots', { facultyId: faculty._id })}
        >
          <Ionicons name="calendar-outline" size={24} color="#ffffff" />
          <Text style={styles.viewSlotsText}>View Available Slots</Text>
        </TouchableOpacity>
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
    paddingTop: 50,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  department: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 15,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  statusMessage: {
    fontSize: 13,
    color: '#ffffff',
    marginTop: 8,
    opacity: 0.9,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 15,
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
  bioText: {
    fontSize: 15,
    lineHeight: 22,
  },
  qualificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  qualificationText: {
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 15,
  },
  viewSlotsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
    marginTop: 10,
  },
  viewSlotsText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FacultyDetailScreen;
