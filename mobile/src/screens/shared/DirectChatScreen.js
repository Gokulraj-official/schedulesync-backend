import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useHeaderHeight } from '@react-navigation/elements';

const DirectChatScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { socket } = useSocket();
  const headerHeight = useHeaderHeight();
  const { chatId } = route.params;

  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');

  const listRef = useRef(null);

  const myId = user?.id || user?._id;

  const other = useMemo(() => {
    const parts = chat?.participants || [];
    return parts.find((p) => (p?._id || p)?.toString?.() !== myId?.toString?.());
  }, [chat?.participants, myId]);

  const messages = useMemo(() => chat?.messages || [], [chat]);

  const loadChat = async () => {
    try {
      const res = await api.get(`/chat/direct/${chatId}`);
      setChat(res.data.chat);

      const title = other?.name || res.data.chat?.participants?.find((p) => p._id !== myId)?.name || 'Chat';
      navigation.setOptions({ title });
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
  }, [chatId]);

  useEffect(() => {
    if (!socket) return;

    const handler = (payload) => {
      const incomingChatId = payload?.chatId?.toString?.() || String(payload?.chatId || '');
      const currentChatId = chatId?.toString?.() || String(chatId || '');
      if (incomingChatId !== currentChatId) return;

      setChat((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), payload.message],
          lastMessage: new Date().toISOString(),
        };
      });
    };

    socket.on('direct_message', handler);
    return () => {
      socket.off('direct_message', handler);
    };
  }, [socket, chatId]);

  useEffect(() => {
    if (!listRef.current) return;
    if (!messages.length) return;
    setTimeout(() => {
      listRef.current?.scrollToEnd?.({ animated: true });
    }, 50);
  }, [messages.length]);

  const sendMessage = async () => {
    const msg = text.trim();
    if (!msg) return;

    setSending(true);
    try {
      const res = await api.post(`/chat/direct/${chatId}/message`, { message: msg });
      setChat(res.data.chat);
      setText('');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const senderId = item.sender?._id || item.sender;
    const mine = senderId?.toString?.() === myId?.toString?.();

    return (
      <View style={[styles.msgRow, mine ? styles.right : styles.left]}>
        <View
          style={[
            styles.bubble,
            { backgroundColor: mine ? colors.primary : colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.msgText, { color: mine ? '#fff' : colors.text }]}>{item.message}</Text>
          <Text style={[styles.time, { color: mine ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
            {moment(item.createdAt).format('h:mm A')}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight + 12}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item, idx) => item._id || `${idx}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />

      <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: sending ? 0.7 : 1 }]}
          onPress={sendMessage}
          disabled={sending}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12, paddingBottom: 16 },
  msgRow: { flexDirection: 'row', marginBottom: 10 },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '82%', borderWidth: 1, borderRadius: 12, padding: 10 },
  msgText: { fontSize: 15, lineHeight: 20 },
  time: { marginTop: 6, fontSize: 11 },
  inputRow: {
    borderTopWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: { flex: 1, minHeight: 40, maxHeight: 120, fontSize: 15 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});

export default DirectChatScreen;
