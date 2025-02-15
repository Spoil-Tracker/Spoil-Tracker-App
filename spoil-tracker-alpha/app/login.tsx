import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router'; // adds routing after login
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth method
import { auth } from '../services/firebaseConfig';

const Login = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // toggle state on and off
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
    setError('');
    try {
      // calls login function, passing the email and password
      await signInWithEmailAndPassword(auth, email, password);
      router.push('./Home'); // navigates to the home page after successful login
    } catch (error: any) {
      console.error('Login error:', error.code, error.message);
      // shows an alert if login fails
      if (error.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Incorrect email and/or password.');
      } else if (error.code === 'auth/missing-password') {
        setError('Password missing');
      } else {
        setError(`${error.message}`); // debugging error message
      }
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
        <Text>Welcome to Spoil Tracker!</Text>
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}{' '}
      {/* Show error message */}
      <TextInput
        style={styles.TextInput}
        placeholder="Email"
        placeholderTextColor="black"
        value={email}
        onChangeText={setEmail} // Update email state
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="  Password"
          placeholderTextColor="black"
          value={password}
          onChangeText={setPassword} // Update password state
          secureTextEntry={!showPassword} // toggle password visibility
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleLogin}>
        <Text style={styles.btnLogin}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/forgotPassword')}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 25,
    ...(Platform.OS === 'ios' && {
      width: '45%',
    }),
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 25,
    marginTop: 10,
    paddingHorizontal: 5,
    ...(Platform.OS === 'ios' && {
      width: '45%',
    }),
  },
  passwordInput: {
    flex: 1,
    padding: 10,
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
  error: {
    color: 'red',
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default Login;
