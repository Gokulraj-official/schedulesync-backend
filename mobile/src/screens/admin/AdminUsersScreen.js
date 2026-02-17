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

const AdminUsersScreen = () => {
  const { colors } = useTheme();
  const [filter, setFilter] = useState('faculty_pending');
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      let params = '';
      if (filter === 'all') params = '';
      if (filter === 'faculty_pending') params = '?role=faculty&verified=false';
      if (filter === 'faculty_verified') params = '?role=faculty&verified=true';
      if (filter === 'students') params = '?role=student';

      const res = await api.get(`/admin/users${params}`);
      setUsers(res.data.users || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load users');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleVerify = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      Alert.alert('Success', 'Faculty verified');
      loadUsers();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to verify');
    }
  };

  const handleDelete = async (userId) => {
    Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/users/${userId}`);
            Alert.alert('Success', 'User deleted');
            loadUsers();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to delete user');
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }) => {
    const canVerify = item.role === 'faculty' && !item.isVerified;
    const canDelete = item.role !== 'admin';

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.userInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.email}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {item.role.toUpperCase()} • {item.department || '—'}
            </Text>
          </View>

          {item.role === 'faculty' && (
            <View style={styles.badgeWrap}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: item.isVerified ? colors.success : colors.warning },
                ]}
              >
                <Text style={styles.badgeText}>{item.isVerified ? 'VERIFIED' : 'PENDING'}</Text>
              </View>
            </View>
          )}
        </View>

        {canDelete && (
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: colors.border }]}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={[styles.deleteText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        )}

        {canVerify && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleVerify(item._id)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>Verify Faculty</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filters = [
    { key: 'all', label: 'All Users' },
    { key: 'faculty_pending', label: 'Faculty Pending' },
    { key: 'faculty_verified', label: 'Faculty Verified' },
    { key: 'students', label: 'Students' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              { borderColor: colors.border },
              filter === f.key && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, { color: filter === f.key ? '#fff' : colors.text }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { padding: 12, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '600' },
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
  deleteBtn: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionText: { color: '#fff', fontWeight: '700' },
  deleteText: { fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 10, fontSize: 16 },
});

export default AdminUsersScreen;
