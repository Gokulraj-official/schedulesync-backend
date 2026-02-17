import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const AdminReportsScreen = () => {
  const { colors } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);

  const [deptLoad, setDeptLoad] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [topFaculty, setTopFaculty] = useState([]);
  const [cancelReasons, setCancelReasons] = useState([]);

  const loadReports = async () => {
    try {
      const [d1, d2, d3, d4] = await Promise.all([
        api.get('/admin/reports/department-booking-load'),
        api.get('/admin/reports/peak-hours'),
        api.get('/admin/reports/top-faculty?limit=10'),
        api.get('/admin/reports/cancellation-reasons'),
      ]);

      setDeptLoad(d1.data.report || []);
      setPeakHours(d2.data.report || []);
      setTopFaculty(d3.data.report || []);
      setCancelReasons(d4.data.report || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load reports');
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const exportBookingsCsv = async () => {
    setLoadingCsv(true);
    try {
      const res = await api.get('/admin/reports/bookings.csv', {
        responseType: 'text',
        transformResponse: (r) => r,
      });

      const csvText = typeof res.data === 'string' ? res.data : '';

      await Share.share({
        message: csvText,
      });
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to export CSV');
    } finally {
      setLoadingCsv(false);
    }
  };

  const renderKeyValueList = (items, labelFn, valueFn) => {
    if (!items?.length) {
      return <Text style={[styles.emptySmall, { color: colors.textSecondary }]}>No data</Text>;
    }

    return items.slice(0, 12).map((it, idx) => (
      <View key={idx} style={styles.kvRow}>
        <Text style={[styles.kvLabel, { color: colors.text }]} numberOfLines={1}>
          {labelFn(it)}
        </Text>
        <Text style={[styles.kvValue, { color: colors.textSecondary }]}>{valueFn(it)}</Text>
      </View>
    ));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TouchableOpacity
        style={[styles.exportBtn, { backgroundColor: colors.primary, opacity: loadingCsv ? 0.7 : 1 }]}
        onPress={exportBookingsCsv}
        disabled={loadingCsv}
      >
        {loadingCsv ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text style={styles.exportText}>Export Bookings CSV (Share)</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Department Booking Load</Text>
        {renderKeyValueList(
          deptLoad,
          (it) => it._id || '—',
          (it) => `${it.totalBookings}`
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Peak Hours</Text>
        {renderKeyValueList(
          peakHours,
          (it) => (it._id === null || it._id === undefined ? '—' : `${it._id}:00`),
          (it) => `${it.totalBookings}`
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Top Faculty</Text>
        {renderKeyValueList(
          topFaculty,
          (it) => `${it.name || '—'} (${it.department || '—'})`,
          (it) => `${it.totalBookings}`
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Cancellation Reasons</Text>
        {renderKeyValueList(
          cancelReasons,
          (it) => it._id || '—',
          (it) => `${it.count}`
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, gap: 12 },
  exportBtn: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportText: { color: '#fff', fontWeight: '900' },
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '900', marginBottom: 8 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 6 },
  kvLabel: { flex: 1, fontSize: 12, fontWeight: '800' },
  kvValue: { fontSize: 12, fontWeight: '800' },
  emptySmall: { fontSize: 12, paddingVertical: 8 },
});

export default AdminReportsScreen;
