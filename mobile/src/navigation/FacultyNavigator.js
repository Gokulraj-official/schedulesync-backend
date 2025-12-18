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
import FacultyProfileScreen from '../screens/faculty/FacultyProfileScreen';
import EditProfileScreen from '../screens/faculty/EditProfileScreen';
import PublicScheduleScreen from '../screens/faculty/PublicScheduleScreen';
import CalendarViewScreen from '../screens/faculty/CalendarViewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FacultyHome" component={FacultyHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CalendarView" component={CalendarViewScreen} options={{ title: 'Calendar' }} />
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
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FacultyProfile" component={FacultyProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="PublicSchedule" component={PublicScheduleScreen} options={{ title: 'Public Schedule' }} />
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
      <Tab.Screen name="Slots" component={SlotsStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default FacultyNavigator;
