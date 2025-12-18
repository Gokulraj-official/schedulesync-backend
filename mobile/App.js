import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LogBox } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import FacultyNavigator from './src/navigation/FacultyNavigator';
import StudentNavigator from './src/navigation/StudentNavigator';
import SplashScreen from './src/screens/SplashScreen';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  const linking = {
    prefixes: [],
    config: {
      screens: {
        Auth: 'auth',
        Faculty: 'faculty',
        Student: 'student',
      },
    },
  };

  return (
    <NavigationContainer
      linking={linking}
      fallback={<SplashScreen />}
      onReady={() => {
        console.log('Navigation ready');
      }}
    >
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {!token ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{ animationTypeForReplace: !token ? 'pop' : 'push' }}
          />
        ) : user?.role === 'faculty' ? (
          <Stack.Screen name="Faculty" component={FacultyNavigator} />
        ) : (
          <Stack.Screen name="Student" component={StudentNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
