import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const AdminAccountScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}
>
        <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase?.() || 'A'}</Text>
        </View>

        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>ADMIN</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}
>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

          <TouchableOpacity
            style={[styles.actionItem, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('EditAdminProfile')}
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Ionicons name="key-outline" size={22} color={colors.info} />
            <Text style={[styles.actionText, { color: colors.text }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, { borderColor: colors.border }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 30, paddingTop: 50 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 40, fontWeight: '900', color: '#fff' },
  name: { marginTop: 10, fontSize: 22, fontWeight: '900', color: '#fff' },
  email: { marginTop: 4, color: '#fff', opacity: 0.9 },
  role: { marginTop: 4, color: '#fff', opacity: 0.9, fontWeight: '900' },
  content: { padding: 15 },
  section: { padding: 20, borderRadius: 12, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  actionText: { marginLeft: 10, flex: 1, fontSize: 15, fontWeight: '700' },
});

export default AdminAccountScreen;
