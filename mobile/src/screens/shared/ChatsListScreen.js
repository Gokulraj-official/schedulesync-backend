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
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const ChatsListScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { socket } = useSocket();

  const myId = user?.id || user?._id;

  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const res = await api.get('/chat/direct');
      setChats(res.data.chats || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load chats');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats])
  );

  useEffect(() => {
    if (!socket) return;

    const handler = () => {
      loadChats();
    };

    socket.on('direct_message', handler);

    return () => {
      socket.off('direct_message', handler);
    };
  }, [socket, loadChats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  }, [loadChats]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Chats',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('NewChat')} style={{ marginRight: 12 }}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors.primary]);

  const getOther = useCallback(
    (chat) => {
      const parts = chat?.participants || [];
      return parts.find((p) => (p?._id || p)?.toString?.() !== myId?.toString?.());
    },
    [myId]
  );

  const renderItem = ({ item }) => {
    const other = getOther(item);
    const lastMsg = (item.messages && item.messages.length ? item.messages[item.messages.length - 1] : null) || null;

    return (
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('DirectChat', { chatId: item._id })}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="person" size={18} color="#fff" />
        </View>

        <View style={styles.mid}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {other?.name || 'Chat'}
          </Text>
          <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={1}>
            {lastMsg?.message || 'No messages yet'}
          </Text>
        </View>

        <View style={styles.right}>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {item.lastMessage ? moment(item.lastMessage).fromNow() : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const empty = useMemo(() => {
    return (
      <View style={styles.empty}>
        <Ionicons name="chatbubbles-outline" size={60} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No chats yet</Text>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('NewChat')}
        >
          <Text style={styles.startText}>Start Chat</Text>
        </TouchableOpacity>
      </View>
    );
  }, [colors.textSecondary, colors.primary, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={chats.length ? styles.list : styles.listEmpty}
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
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: { flex: 1 },
  name: { fontSize: 14, fontWeight: '900' },
  preview: { marginTop: 4, fontSize: 12, fontWeight: '600' },
  right: { alignItems: 'flex-end' },
  time: { fontSize: 11, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 10, fontSize: 16, fontWeight: '800' },
  startBtn: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  startText: { color: '#fff', fontWeight: '900' },
});

export default ChatsListScreen;
