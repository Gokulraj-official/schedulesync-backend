import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const AdminFacultyVerificationScreen = () => {
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPending = async () => {
    try {
      const res = await api.get('/admin/users?role=faculty&verified=false');
      setUsers(res.data.users || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load pending faculty');
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPending();
    setRefreshing(false);
  };

  const handleVerify = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      Alert.alert('Success', 'Faculty verified');
      loadPending();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to verify');
    }
  };

  const renderUser = ({ item }) => {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.userInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.email}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.department || '—'}</Text>
          </View>

          <View style={styles.badgeWrap}>
            <View style={[styles.badge, { backgroundColor: colors.warning }]}>
              <Text style={styles.badgeText}>PENDING</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleVerify(item._id)}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Verify Faculty</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="shield-checkmark-outline" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No pending faculty verification
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  userInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { marginTop: 2, fontSize: 12 },
  badgeWrap: { justifyContent: 'flex-start' },
  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  actionBtn: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
  },
  actionText: { color: '#fff', fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 10, fontSize: 16, textAlign: 'center' },
});

export default AdminFacultyVerificationScreen;
