import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { useNavigation } from 'expo-router';
import {
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import Firebase function
import { auth } from '../services/firebaseConfig'; // Import Firebase auth configuration

const Registration = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    // Hide the header for this screen
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'inter-bold': require('../assets/fonts/Inter_800ExtraBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  const handleRegistration = async () => {
    try {
      // Firebase registration process
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Navigate to login or home after successful registration
      navigation.navigate('login');
    } catch (error: any) {
      setError(error.message); // Display error message if registration fails
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.spoilTrackerText}>Create your account</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.TextInput}
        placeholder="Email address"
        placeholderTextColor="black"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.TextInput}
        placeholder="Password"
        placeholderTextColor="black"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={handleRegistration}>
        <Text style={styles.btnLogin}>Join</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('login')}>
        <Text style={styles.btnRegister}>I already have an account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF9F2',
    padding: 20,
  },
  spoilTrackerText: {
    fontSize: 40,
    fontFamily: 'inter-bold',
    color: '#4CAE4F',
    marginBottom: 20,
  },
  TextInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
    width: '80%',
  },
  btnLogin: {
    backgroundColor: 'blue',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
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
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default Registration;
