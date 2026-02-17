import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getDevHostIp = () => {
  const hostUri = Constants?.expoConfig?.hostUri;
  if (typeof hostUri === 'string' && hostUri.length) {
    return hostUri.split(':')[0];
  }

  const debuggerHost = Constants?.manifest?.debuggerHost;
  if (typeof debuggerHost === 'string' && debuggerHost.length) {
    return debuggerHost.split(':')[0];
  }

  return null;
};

const configuredApiUrl =
  Constants?.expoConfig?.extra?.apiUrl ||
  Constants?.manifest?.extra?.apiUrl;

const configuredApiUrlFromEnv =
  typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : null;

const devHostIp = getDevHostIp();

const API_URL =
  configuredApiUrlFromEnv ||
  configuredApiUrl ||
  (__DEV__ && devHostIp ? `http://${devHostIp}:5000/api` : 'https://schedulesync-api.onrender.com/api');


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['userToken', 'userRole', 'userData']);
    }
    return Promise.reject(error);
  }
);

export default api;
