import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';
import { useNavigation } from 'expo-router';

const ForgotPassword = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'inter-bold': require('../assets/fonts/Inter_800ExtraBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Success',
        'A password reset link has been sent to your email.'
      );
      navigation.navigate('login'); // Navigate back to login after reset
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.TextInput}
        placeholder="Enter your email"
        placeholderTextColor="black"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity onPress={handleResetPassword}>
        <Text style={styles.btnReset}>Send Reset Link</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('login')}>
        <Text style={styles.btnBack}>Back to Login</Text>
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
  title: {
    fontSize: 30,
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
    ...(Platform.OS === 'ios' && {
      width: '100%',
    }),
  },
  btnReset: {
    backgroundColor: 'blue',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  btnBack: {
    backgroundColor: '#4CAE4F',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
});

export default ForgotPassword;
