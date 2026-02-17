import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const NewChatScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/users/chat-contacts', {
        params: { q: q.trim() || undefined },
      });
      setUsers(res.data.users || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load contacts');
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(t);
  }, [q, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'New Chat' });
  }, [navigation]);

  const startChat = useCallback(
    async (u) => {
      try {
        const res = await api.post(`/chat/direct/user/${u._id}`);
        const chatId = res.data.chat?._id;
        if (!chatId) throw new Error('Chat not created');
        navigation.replace('DirectChat', { chatId });
      } catch (e) {
        Alert.alert('Error', e.response?.data?.message || 'Failed to start chat');
      }
    },
    [navigation]
  );

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => startChat(item)}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons name={item.role === 'faculty' ? 'school-outline' : 'person-outline'} size={18} color="#fff" />
        </View>
        <View style={styles.mid}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={1}>
            {(item.role || '').toUpperCase()} • {item.department || '—'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const empty = useMemo(() => {
    return (
      <View style={styles.empty}>
        <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No contacts</Text>
      </View>
    );
  }, [colors.textSecondary]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.search, { color: colors.text }]}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={users.length ? styles.list : styles.listEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={empty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: {
    margin: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  search: { flex: 1, fontSize: 14 },
  list: { padding: 12, paddingTop: 0 },
  listEmpty: { padding: 12, paddingTop: 0, flexGrow: 1 },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  mid: { flex: 1 },
  name: { fontSize: 14, fontWeight: '900' },
  sub: { marginTop: 4, fontSize: 12, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 10, fontSize: 16, fontWeight: '800' },
});

export default NewChatScreen;
