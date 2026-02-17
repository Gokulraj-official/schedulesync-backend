import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminFacultyVerificationScreen from '../screens/admin/AdminFacultyVerificationScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';
import AdminSlotsScreen from '../screens/admin/AdminSlotsScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminAnnouncementsScreen from '../screens/admin/AdminAnnouncementsScreen';
import AdminAuditLogsScreen from '../screens/admin/AdminAuditLogsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminAccountScreen from '../screens/admin/AdminAccountScreen';
import EditAdminProfileScreen from '../screens/admin/EditAdminProfileScreen';
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';

const Stack = createStackNavigator();

const AdminNavigator = () => {
  const { logout } = useAuth();
  const { colors } = useTheme();

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerRight: () => (
          <>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminAccount')}
              style={{ marginRight: 14 }}
            >
              <Ionicons name="person-circle-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmLogout} style={{ marginRight: 12 }}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          </>
        ),
      })}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Panel' }} />
      <Stack.Screen
        name="AdminFacultyVerification"
        component={AdminFacultyVerificationScreen}
        options={{ title: 'Faculty Verification' }}
      />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Users' }} />
      <Stack.Screen name="AdminBookings" component={AdminBookingsScreen} options={{ title: 'Bookings' }} />
      <Stack.Screen name="AdminSlots" component={AdminSlotsScreen} options={{ title: 'Slots' }} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: 'Reports' }} />
      <Stack.Screen name="AdminAnnouncements" component={AdminAnnouncementsScreen} options={{ title: 'Announcements' }} />
      <Stack.Screen name="AdminAuditLogs" component={AdminAuditLogsScreen} options={{ title: 'Audit Logs' }} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="AdminAccount" component={AdminAccountScreen} options={{ title: 'Account' }} />
      <Stack.Screen name="EditAdminProfile" component={EditAdminProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
