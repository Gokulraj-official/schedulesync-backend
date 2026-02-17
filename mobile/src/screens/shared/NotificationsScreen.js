import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';

const NotificationsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.get('/users/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load notifications');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await api.put('/users/notifications/read-all');
      await loadNotifications();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to mark all as read');
    }
  }, [loadNotifications]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  useEffect(() => {
    if (!socket) return;

    const handleAnnouncement = () => {
      loadNotifications();
    };

    const handleNotification = () => {
      loadNotifications();
    };

    socket.on('announcement', handleAnnouncement);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('announcement', handleAnnouncement);
      socket.off('notification', handleNotification);
    };
  }, [socket, loadNotifications]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Notifications',
      headerRight: () => (
        <TouchableOpacity
          onPress={markAllRead}
          style={{ marginRight: 12, opacity: unreadCount > 0 ? 1 : 0.6 }}
          disabled={unreadCount === 0}
        >
          <Ionicons name="checkmark-done-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, markAllRead, unreadCount, colors.primary]);

  const empty = useMemo(() => {
    return (
      <View style={styles.empty}>
        <Ionicons name="notifications-off-outline" size={60} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications</Text>
      </View>
    );
  }, [colors.textSecondary]);

  const openNotification = useCallback(
    async (item) => {
      try {
        if (!item.read) {
          await api.put(`/users/notifications/${item._id}/read`);
        }
      } catch (e) {
      } finally {
        navigation.navigate('NotificationDetail', { notification: item });
        loadNotifications();
      }
    },
    [navigation, loadNotifications]
  );

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => openNotification(item)}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.row}>
          <View style={styles.titleRow}>
            {!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {moment(item.createdAt).fromNow()}
          </Text>
        </View>

        <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.body}
        </Text>

        {item.type === 'announcement' && (
          <View style={[styles.badge, { borderColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>Announcement</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={notifications.length ? styles.list : styles.listEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={empty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 12 },
  listEmpty: { padding: 12, flexGrow: 1 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  title: { fontSize: 14, fontWeight: '900', flexShrink: 1 },
  time: { fontSize: 12, fontWeight: '700' },
  body: { marginTop: 6, fontSize: 13, lineHeight: 18 },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: '900' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 10, fontSize: 16, fontWeight: '800' },
});

export default NotificationsScreen;
