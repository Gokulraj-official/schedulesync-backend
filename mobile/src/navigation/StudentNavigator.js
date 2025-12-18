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
import FavoritesScreen from '../screens/student/FavoritesScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import EditStudentProfileScreen from '../screens/student/EditStudentProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="StudentHome" component={StudentHomeScreen} options={{ headerShown: false }} />
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
      <Tab.Screen name="Favorites" component={FavoritesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
