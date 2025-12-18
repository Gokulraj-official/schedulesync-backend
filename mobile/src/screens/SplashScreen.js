import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = () => {
  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <Text style={styles.title}>SchedulSync</Text>
      <Text style={styles.subtitle}>Smart Appointment Scheduling</Text>
      <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  loader: {
    marginTop: 30,
  },
});

export default SplashScreen;
