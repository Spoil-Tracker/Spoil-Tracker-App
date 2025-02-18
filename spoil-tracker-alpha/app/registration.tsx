import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { useNavigation } from 'expo-router';
import {
  TextInput,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import Firebase function
import { auth, db } from '../services/firebaseConfig'; // Import Firebase auth configuration
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import {
  createAccount
} from '@/components/Account/AccountService';

const Registration = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm password
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
    if (!username || !email || !password) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // registration through firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        createdAt: new Date(),
      });

      await createAccount(user.uid, username, "user");

      Alert.alert('Success', 'Account created successfully!');
      // navigates to login or home after successful registration
      navigation.navigate('login');
    } catch (error: any) {
      setError(error.message); // displays error message if registration fails
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
        placeholder="Username"
        placeholderTextColor="black"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.TextInput}
        placeholder="Email address"
        placeholderTextColor="black"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Password Input with Toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.TextInputPassword}
          placeholder="Password"
          placeholderTextColor="black"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input with Toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.TextInputPassword}
          placeholder="Confirm Password"
          placeholderTextColor="black"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? 'eye-off' : 'eye'}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

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
    alignContent: 'center',
    borderWidth: 2,
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
    paddingHorizontal: 30,
    ...(Platform.OS === 'ios' && {
      width: '55%',
    }),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 25,
    marginTop: 10,
    paddingHorizontal: 10,
    ...(Platform.OS === 'ios' && {
      width: '45%',
    }),
  },
  TextInputPassword: {
    flex: 1,
    padding: 10,
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
