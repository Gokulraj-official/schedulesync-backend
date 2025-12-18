import React from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import QRCode from 'react-native-qrcode-svg';

const PublicScheduleScreen = ({ route }) => {
  const { colors } = useTheme();
  const { token } = route.params;
  const publicUrl = `https://schedulesync.app/public/${token}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `View my appointment schedule: ${publicUrl}`,
        title: 'My Schedule',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share link');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { backgroundColor: colors.card }]}>
        <Ionicons name="share-social" size={60} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Public Schedule Link</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Share this link with students or parents to let them view your schedule without logging in
        </Text>

        <View style={styles.qrContainer}>
          <QRCode value={publicUrl} size={200} />
        </View>

        <View style={[styles.urlContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.urlText, { color: colors.text }]} numberOfLines={1}>
            {publicUrl}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: colors.primary }]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#ffffff" />
          <Text style={styles.shareButtonText}>Share Link</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Anyone with this link can view your schedule. You can regenerate the link anytime to
            revoke access.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 30,
  },
  urlContainer: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  urlText: {
    fontSize: 12,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});

export default PublicScheduleScreen;
