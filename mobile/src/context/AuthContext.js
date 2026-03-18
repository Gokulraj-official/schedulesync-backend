import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { registerForPushNotificationsAsync } from '../utils/notifications';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncPushToken = async () => {
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (!pushToken) return;

      await api.put('/users/push-token', { pushToken });
      await AsyncStorage.setItem('pushToken', pushToken);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const savedUser = await AsyncStorage.getItem('userData');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await AsyncStorage.setItem('userRole', user.role);

      setToken(token);
      setUser(user);

      syncPushToken();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const signup = async (name, email, password, role, department) => {
    try {
      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
        role,
        department,
      });
      const { token, user } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await AsyncStorage.setItem('userRole', user.role);

      setToken(token);
      setUser(user);

      syncPushToken();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
      };
    }
  };

  const logout = async () => {
    try {
      // Get current token before clearing it
      const currentToken = await AsyncStorage.getItem('userToken');
      
      if (currentToken) {
        // Make logout API call with current token
        await api.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error.message);
      // Continue with logout even if API call fails
    } finally {
      try {
        // Clear all stored data
        await AsyncStorage.multiRemove(['userToken', 'userData', 'userRole', 'pushToken']);
      } catch (storageError) {
        console.error('Error clearing AsyncStorage:', storageError);
      }
      
      // Clear auth state - this will trigger Socket disconnection
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
