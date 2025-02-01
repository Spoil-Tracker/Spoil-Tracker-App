import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';

export default function Registration() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'inter-bold': require('@/assets/fonts/Inter_800ExtraBold.ttf'),
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

  return (
    <View style={styles.container}>
      <Text style={styles.spoilTrackerText}>WELCOME TO THE HOME PAGE!!!</Text>

      <TouchableOpacity onPress={() => router.push('../../login')}>
        <Text style={styles.btnLogin}>Back to Login Button</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('../Pantry')}>
        <Text style={styles.btnLogin}>Pantries</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('../GroceryList')}>
        <Text style={styles.btnLogin}>Grocery Lists</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('../Profile')}>
        <Text style={styles.btnLogin}>My Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('../Settings')}>
        <Text style={styles.btnLogin}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF9F2',
  },
  spoilTrackerText: {
    fontSize: 40, // Adjust size as needed
    fontFamily: 'inter-bold', // Using Inter font
    color: '#4CAE4F', // Green color for the text
    marginBottom: 10, // Add space between text and other elements
  },
  TextInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
    ...(Platform.OS === 'ios' && {
      width: '45%',
    }),
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
  btnRegister: {
    backgroundColor: '#4CAE4F',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
});
