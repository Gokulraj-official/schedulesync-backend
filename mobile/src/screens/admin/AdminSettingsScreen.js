import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const AdminSettingsScreen = () => {
  const { colors } = useTheme();

  const [settings, setSettings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSettings(res.data.settings || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load settings');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const openEdit = (item) => {
    setEditKey(item?.key || '');
    const value = item?.value;
    const str = value === undefined ? '' : JSON.stringify(value);
    setEditValue(str);
    setEditOpen(true);
  };

  const saveSetting = async () => {
    if (!editKey.trim()) return;

    let parsed = null;
    try {
      parsed = editValue.trim() ? JSON.parse(editValue) : null;
    } catch (e) {
      Alert.alert('Invalid JSON', 'Value must be valid JSON (example: true, 10, "text", {"a":1})');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/admin/settings/${encodeURIComponent(editKey.trim())}`, { value: parsed });
      setEditOpen(false);
      await loadSettings();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => {
    const valueText = item?.value === undefined ? 'null' : JSON.stringify(item.value);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => openEdit(item)}
      >
        <View style={styles.rowBetween}>
          <View style={styles.col}>
            <Text style={[styles.key, { color: colors.text }]}>{item.key}</Text>
            <Text style={[styles.value, { color: colors.textSecondary }]} numberOfLines={2}>
              {valueText}
            </Text>
          </View>
          <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}
>
      <FlatList
        data={settings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="settings-outline" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No settings</Text>
          </View>
        }
      />

      <Modal
        visible={editOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!saving) setEditOpen(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (!saving) setEditOpen(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Setting</Text>

                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Key</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  value={editKey}
                  onChangeText={setEditKey}
                  placeholder="key"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Value (JSON)</Text>
                <TextInput
                  style={[styles.inputMultiline, { borderColor: colors.border, color: colors.text }]}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder='{"maintenance": false}'
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { borderColor: colors.border }]}
                    onPress={() => setEditOpen(false)}
                    disabled={saving}
                  >
                    <Text style={[styles.modalBtnText, { color: colors.text }]}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtnPrimary, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
                    onPress={saveSetting}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.modalBtnPrimaryText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
  col: { flex: 1 },
  key: { fontSize: 14, fontWeight: '900' },
  value: { marginTop: 6, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 10, fontSize: 16 },
  modalCard: { borderWidth: 1, borderRadius: 12, padding: 14 },
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 18, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalTitle: { fontSize: 16, fontWeight: '900' },
  modalLabel: { marginTop: 10, fontSize: 12, fontWeight: '800' },
  input: { marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 },
  inputMultiline: { marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 90 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalBtn: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  modalBtnText: { fontWeight: '800' },
  modalBtnPrimary: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  modalBtnPrimaryText: { color: '#fff', fontWeight: '900' },
});

export default AdminSettingsScreen;
