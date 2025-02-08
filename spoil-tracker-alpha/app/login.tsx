import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../services/authContext'; // Importing the context for authentication
import { useRouter } from 'expo-router'; // For routing after login

const Login = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Destructure login from context
  const router = useRouter(); // For navigation after login

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'inter-bold': require('../assets/fonts/Inter_800ExtraBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  const handleLogin = async () => {
    try {
      // Call the login function from context, passing the email and password
      await login(email, password);
      router.push('./Home'); // Navigate to the home page after successful login
    } catch (error: any) {
      console.error('Login error:', error);
      // Show an alert if login fails
      Alert.alert('Login Error', error.message);
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
      <Text style={styles.spoilTrackerText}>Spoil Tracker</Text>

      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Welcome to Spoil Tracker!
      </Text>

      <TextInput
        style={styles.TextInput}
        placeholder="Email"
        placeholderTextColor="black"
        value={email}
        onChangeText={setEmail} // Update email state
      />
      <TextInput
        style={styles.TextInput}
        placeholder="Password"
        placeholderTextColor="black"
        value={password}
        onChangeText={setPassword} // Update password state
        secureTextEntry={true} // Hide password input
      />

      <TouchableOpacity onPress={handleLogin}>
        <Text style={styles.btnLogin}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.forgot}>Forgot Password?</Text>

      <TouchableOpacity onPress={() => router.push('/registration')}>
        <Text style={styles.btnRegister}>Create New Account</Text>
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
  },
  spoilTrackerText: {
    fontSize: 60, // Adjust size as needed
    fontFamily: 'inter-bold', // Using Inter font
    color: '#4CAE4F', // Green color for the text
    marginBottom: 10, // Add space between text and other elements
  },
  TextInput: {
    backgroundColor: 'white',
    alignContent: 'center',
    borderWidth: 2,
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
    ...(Platform.OS === 'ios' && {
      width: '45%',
    }),
  },
  forgot: { textAlign: 'right', color: 'blue', marginTop: 10 },
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

export default Login;
