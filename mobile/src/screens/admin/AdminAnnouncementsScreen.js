import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const AdminAnnouncementsScreen = () => {
  const { colors } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [department, setDepartment] = useState('');
  const [sendPush, setSendPush] = useState(false);

  const canSend = useMemo(() => {
    if (!title.trim() || !body.trim()) return false;
    if (audience === 'department' && !department.trim()) return false;
    return true;
  }, [title, body, audience, department]);

  const loadAnnouncements = async () => {
    try {
      const res = await api.get('/admin/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load announcements');
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const submit = async () => {
    if (!canSend) return;

    try {
      await api.post('/admin/announcements', {
        title: title.trim(),
        body: body.trim(),
        audience,
        department: audience === 'department' ? department.trim() : undefined,
        sendPush,
      });

      setTitle('');
      setBody('');
      setAudience('all');
      setDepartment('');
      setSendPush(false);

      await loadAnnouncements();
      Alert.alert('Success', 'Announcement sent');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to send announcement');
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {moment(item.createdAt).fromNow()} • {item.audience?.toUpperCase()}
          {item.audience === 'department' ? ` • ${item.department || ''}` : ''}
        </Text>
        <Text style={[styles.body, { color: colors.text }]}>{item.body}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}
>
      <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}
>
        <Text style={[styles.formTitle, { color: colors.text }]}>New Announcement</Text>

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
        />

        <TextInput
          style={[styles.inputMultiline, { borderColor: colors.border, color: colors.text }]}
          value={body}
          onChangeText={setBody}
          placeholder="Message"
          placeholderTextColor={colors.textSecondary}
          multiline
        />

        <View style={[styles.pickerWrap, { borderColor: colors.border }]}>
          <Picker
            selectedValue={audience}
            onValueChange={(v) => setAudience(v)}
            style={{ color: colors.text }}
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Faculty" value="faculty" />
            <Picker.Item label="Students" value="student" />
            <Picker.Item label="Department" value="department" />
          </Picker>
        </View>

        {audience === 'department' && (
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={department}
            onChangeText={setDepartment}
            placeholder="Department"
            placeholderTextColor={colors.textSecondary}
          />
        )}

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>Send Push</Text>
          <Switch value={sendPush} onValueChange={setSendPush} />
        </View>

        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: canSend ? 1 : 0.6 }]}
          onPress={submit}
          disabled={!canSend}
        >
          <Ionicons name="send-outline" size={18} color="#fff" />
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="megaphone-outline" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No announcements</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { borderWidth: 1, borderRadius: 12, margin: 12, padding: 12 },
  formTitle: { fontSize: 16, fontWeight: '900' },
  input: { marginTop: 10, borderWidth: 1, borderRadius: 10, padding: 10 },
  inputMultiline: { marginTop: 10, borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 80 },
  pickerWrap: { marginTop: 10, borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  switchRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontWeight: '800' },
  sendBtn: {
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '900' },
  list: { padding: 12, paddingTop: 0 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '900' },
  meta: { marginTop: 6, fontSize: 12 },
  body: { marginTop: 8, fontSize: 14, lineHeight: 20 },
  empty: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { marginTop: 10, fontSize: 16 },
});

export default AdminAnnouncementsScreen;
