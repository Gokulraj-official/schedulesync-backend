import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/statistics');
      setStats(res.data.statistics);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load statistics');
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.grid]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Total Users</Text>
          <Text style={[styles.value, { color: colors.text }]}>{stats?.users?.total ?? '—'}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Faculty</Text>
          <Text style={[styles.value, { color: colors.text }]}>{stats?.users?.faculty ?? '—'}</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Verified: {stats?.users?.verifiedFaculty ?? '—'} | Pending: {stats?.users?.pendingVerification ?? '—'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Bookings</Text>
          <Text style={[styles.value, { color: colors.text }]}>{stats?.bookings?.total ?? '—'}</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Pending: {stats?.bookings?.pending ?? '—'} | Approved: {stats?.bookings?.approved ?? '—'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Slots</Text>
          <Text style={[styles.value, { color: colors.text }]}>{stats?.slots?.total ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AdminFacultyVerification')}
        >
          <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Faculty Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AdminUsers')}
        >
          <Ionicons name="people-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Users Management</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AdminBookings')}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Booking Moderation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AdminSlots')}
        >
          <Ionicons name="time-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Slot Moderation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AdminReports')}
        >
          <Ionicons name="bar-chart-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Reports & Export</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AdminAnnouncements')}
        >
          <Ionicons name="megaphone-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Announcements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AdminAuditLogs')}
        >
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Audit Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AdminSettings')}
        >
          <Ionicons name="settings-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>System Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12 },
  grid: { gap: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  label: { fontSize: 12, fontWeight: '700' },
  value: { marginTop: 6, fontSize: 28, fontWeight: '800' },
  sub: { marginTop: 6, fontSize: 12 },
  actions: { marginTop: 12, gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
  },
  actionText: { color: '#fff', fontWeight: '800' },
});

export default AdminDashboardScreen;
