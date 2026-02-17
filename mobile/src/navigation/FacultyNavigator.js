import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import FacultyHomeScreen from '../screens/faculty/FacultyHomeScreen';
import SlotManagementScreen from '../screens/faculty/SlotManagementScreen';
import CreateSlotScreen from '../screens/faculty/CreateSlotScreen';
import EditSlotScreen from '../screens/faculty/EditSlotScreen';
import BookingManagementScreen from '../screens/faculty/BookingManagementScreen';
import BookingDetailsScreen from '../screens/faculty/BookingDetailsScreen';
import BookingChatScreen from '../screens/shared/BookingChatScreen';
import FacultyProfileScreen from '../screens/faculty/FacultyProfileScreen';
import EditProfileScreen from '../screens/faculty/EditProfileScreen';
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import NotificationDetailScreen from '../screens/shared/NotificationDetailScreen';
import ChatsListScreen from '../screens/shared/ChatsListScreen';
import NewChatScreen from '../screens/shared/NewChatScreen';
import DirectChatScreen from '../screens/shared/DirectChatScreen';
import PublicScheduleScreen from '../screens/faculty/PublicScheduleScreen';
import CalendarViewScreen from '../screens/faculty/CalendarViewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FacultyHome" component={FacultyHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CalendarView" component={CalendarViewScreen} options={{ title: 'Calendar' }} />
    <Stack.Screen name="ChatsList" component={ChatsListScreen} options={{ title: 'Chats' }} />
    <Stack.Screen name="NewChat" component={NewChatScreen} options={{ title: 'New Chat' }} />
    <Stack.Screen name="DirectChat" component={DirectChatScreen} options={{ title: 'Chat' }} />
  </Stack.Navigator>
);

const SlotsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="SlotManagement" component={SlotManagementScreen} options={{ title: 'My Slots' }} />
    <Stack.Screen name="CreateSlot" component={CreateSlotScreen} options={{ title: 'Create Slot' }} />
    <Stack.Screen name="EditSlot" component={EditSlotScreen} options={{ title: 'Edit Slot' }} />
  </Stack.Navigator>
);

const BookingsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen name="BookingManagement" component={BookingManagementScreen} options={{ title: 'Bookings' }} />
    <Stack.Screen 
      name="BookingDetails" 
      component={BookingDetailsScreen} 
      options={{ 
        title: 'Booking Details',
        headerBackTitle: 'Back',
      }} 
    />
    <Stack.Screen name="BookingChat" component={BookingChatScreen} options={{ title: 'Chat' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FacultyProfile" component={FacultyProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    <Stack.Screen name="PublicSchedule" component={PublicScheduleScreen} options={{ title: 'Public Schedule' }} />
  </Stack.Navigator>
);

const NotificationsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="NotificationsList" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} options={{ title: 'Notification' }} />
  </Stack.Navigator>
);

const FacultyNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Slots') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'NotificationsTab') {
            iconName = focused ? 'notifications' : 'notifications-outline';
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
      <Tab.Screen
        name="Slots"
        component={SlotsStack}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Slots', { screen: 'SlotManagement' });
          },
        })}
      />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="NotificationsTab" component={NotificationsStack} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default FacultyNavigator;
