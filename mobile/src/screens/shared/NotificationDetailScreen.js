import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const NotificationDetailScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const notification = route?.params?.notification;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: notification?.type === 'announcement' ? 'Announcement' : 'Notification',
    });
  }, [navigation, notification?.type]);

  const metaLabel = useMemo(() => {
    if (!notification) return '';
    const created = notification.createdAt ? moment(notification.createdAt).format('MMM D, YYYY • h:mm A') : '';
    const type = (notification.type || '').replace(/_/g, ' ').toUpperCase();
    return [type, created].filter(Boolean).join(' • ');
  }, [notification]);

  if (!notification) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Notification not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{notification.title}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{metaLabel}</Text>
        <Text style={[styles.body, { color: colors.text }]}>{notification.body}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  title: { fontSize: 18, fontWeight: '900' },
  meta: { marginTop: 8, fontSize: 12, fontWeight: '700' },
  body: { marginTop: 12, fontSize: 14, lineHeight: 20 },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: '900' },
});

export default NotificationDetailScreen;
