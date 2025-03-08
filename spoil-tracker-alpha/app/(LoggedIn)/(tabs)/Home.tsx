import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../../../services/authContext'; // Import the authentication context
import { useTheme, Text } from 'react-native-paper'; // Import useTheme and Text from react-native-paper

export default function HomeScreen() {
  // State for Home screen
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();
  const { logout } = useAuth(); // Get the logout function
  const { colors } = useTheme(); // Adds dark mode

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'inter-bold': require('../../../assets/fonts/Inter_800ExtraBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Function to logout the user
  const handleLogout = async () => {
    try {
      await logout(); // Sign out the user
      router.replace('/login'); // Navigate back to the login screen
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // returns everything to the display for the user to see
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.spoilTrackerText, { color: colors.text }]}>
        WELCOME TO THE HOME PAGE!!!
      </Text>

      <TouchableOpacity onPress={() => router.push('/Pantry')}>
        <Text style={styles.btnLogin}>Pantries</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/GroceryList')}>
        <Text style={styles.btnLogin}>Grocery Lists</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/Profile')}>
        <Text style={styles.btnLogin}>My Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/Settings')}>
        <Text style={styles.btnLogin}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.btnLogout}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// style sheet for fonts and colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spoilTrackerText: {
    fontSize: 40,
    fontFamily: 'inter-bold',
    color: '#4CAE4F',
    marginBottom: 10,
  },
  btnLogin: {
    backgroundColor: 'blue',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  btnLogout: {
    backgroundColor: 'red',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
});
