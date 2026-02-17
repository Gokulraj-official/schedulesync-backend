import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import FacultyDiscoveryScreen from '../screens/student/FacultyDiscoveryScreen';
import FacultyDetailScreen from '../screens/student/FacultyDetailScreen';
import AvailableSlotsScreen from '../screens/student/AvailableSlotsScreen';
import BookSlotScreen from '../screens/student/BookSlotScreen';
import MyBookingsScreen from '../screens/student/MyBookingsScreen';
import BookingDetailScreen from '../screens/student/BookingDetailScreen';
import BookingChatScreen from '../screens/shared/BookingChatScreen';
import FavoritesScreen from '../screens/student/FavoritesScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import EditStudentProfileScreen from '../screens/student/EditStudentProfileScreen';
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import NotificationDetailScreen from '../screens/shared/NotificationDetailScreen';
import ChatsListScreen from '../screens/shared/ChatsListScreen';
import NewChatScreen from '../screens/shared/NewChatScreen';
import DirectChatScreen from '../screens/shared/DirectChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="StudentHome" component={StudentHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ChatsList" component={ChatsListScreen} options={{ title: 'Chats' }} />
    <Stack.Screen name="NewChat" component={NewChatScreen} options={{ title: 'New Chat' }} />
    <Stack.Screen name="DirectChat" component={DirectChatScreen} options={{ title: 'Chat' }} />
  </Stack.Navigator>
);

const DiscoverStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FacultyDiscovery" component={FacultyDiscoveryScreen} options={{ title: 'Find Faculty' }} />
    <Stack.Screen name="FacultyDetail" component={FacultyDetailScreen} options={{ title: 'Faculty Details' }} />
    <Stack.Screen name="AvailableSlots" component={AvailableSlotsScreen} options={{ title: 'Available Slots' }} />
    <Stack.Screen name="BookSlot" component={BookSlotScreen} options={{ title: 'Book Appointment' }} />
  </Stack.Navigator>
);

const BookingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
    <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking Details' }} />
    <Stack.Screen name="BookingChat" component={BookingChatScreen} options={{ title: 'Chat' }} />
  </Stack.Navigator>
);

const FavoritesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FavoritesList" component={FavoritesScreen} options={{ title: 'Favorites' }} />
    <Stack.Screen name="FacultyDetail" component={FacultyDetailScreen} options={{ title: 'Faculty Details' }} />
    <Stack.Screen name="AvailableSlots" component={AvailableSlotsScreen} options={{ title: 'Available Slots' }} />
    <Stack.Screen name="BookSlot" component={BookSlotScreen} options={{ title: 'Book Appointment' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="EditStudentProfile" component={EditStudentProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
  </Stack.Navigator>
);

const NotificationsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="NotificationsList" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} options={{ title: 'Notification' }} />
  </Stack.Navigator>
);

const StudentNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'NotificationsTab') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Discover" component={DiscoverStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="NotificationsTab" component={NotificationsStack} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Favorites" component={FavoritesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
