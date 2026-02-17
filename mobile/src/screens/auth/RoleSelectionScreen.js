import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const RoleSelectionScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const handleRoleSelect = (role) => {
    navigation.navigate('Login', { role });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require('../../../assets/brand-logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={[styles.title, { color: colors.text }]}>I am a...</Text>

      <TouchableOpacity
        style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleRoleSelect('faculty')}
      >
        <Ionicons name="school" size={60} color={colors.primary} />
        <Text style={[styles.roleTitle, { color: colors.text }]}>Faculty</Text>
        <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
          Manage appointments and availability
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleRoleSelect('student')}
      >
        <Ionicons name="person" size={60} color={colors.secondary} />
        <Text style={[styles.roleTitle, { color: colors.text }]}>Student</Text>
        <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
          Book appointments with faculty
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={[styles.backText, { color: colors.textSecondary }]}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  roleCard: {
    padding: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  roleDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  backText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default RoleSelectionScreen;
