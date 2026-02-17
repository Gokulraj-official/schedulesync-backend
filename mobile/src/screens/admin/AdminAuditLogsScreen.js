import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const AdminAuditLogsScreen = () => {
  const { colors } = useTheme();
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs?limit=100');
      setLogs(res.data.logs || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load audit logs');
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
>
        <Text style={[styles.title, { color: colors.text }]}>{item.action}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {item.actor?.name || 'Admin'} • {moment(item.createdAt).fromNow()}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.targetType || '—'} • {item.targetId || '—'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}
>
      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No audit logs</Text>
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
  title: { fontSize: 14, fontWeight: '900' },
  meta: { marginTop: 6, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 10, fontSize: 16 },
});

export default AdminAuditLogsScreen;
