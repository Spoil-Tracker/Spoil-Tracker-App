import React, { useState, useEffect } from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { auth } from '@/services/firebaseConfig'; // Import your auth from the Firebase config
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import {
  updateProfile,
  sendEmailVerification,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from 'firebase/auth';
import Banner from '@/components/Banner'; // Import the Banner component
import styles from '../SettingsPageStyleSheet'; // Import your existing styles

const SettingsPage = (): JSX.Element => {
  const [username, setUsername] = useState(''); // Username will be used for email address
  const [password, setPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setEmailVerified(currentUser.emailVerified);
    }
  }, []);

  const handleEmailChange = async () => {
    if (!user) {
      setBannerMessage('You must be logged in to update your email.');
      setBannerType('error');
      return;
    }

    if (username.trim() === '') {
      setBannerMessage('Email cannot be empty.');
      setBannerType('error');
      return;
    }

    const credential = EmailAuthProvider.credential(user.email || '', password);
    try {
      await reauthenticateWithCredential(user, credential);

      // Use verifyBeforeUpdateEmail with the username string
      await verifyBeforeUpdateEmail(user, username);
      setBannerMessage(
        'Verification email sent. Please check your inbox to confirm the new email address.'
      );
      setBannerType('success');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setBannerMessage('Incorrect password.');
        setBannerType('error');
      } else {
        setBannerMessage('Failed to update email: ' + error.message);
        setBannerType('error');
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!user) {
      setBannerMessage('You must be logged in to change your password.');
      setBannerType('error');
      return;
    }

    if (password.trim().length < 6) {
      setBannerMessage('Password must be at least 6 characters long.');
      setBannerType('error');
      return;
    }

    try {
      await updatePassword(user, password);
      setBannerMessage('Password updated successfully.');
      setBannerType('success');
    } catch (error) {
      setBannerMessage('Failed to update password: ' + error.message);
      setBannerType('error');
    }
  };

  const handleEmailVerification = async () => {
    if (!user) {
      setBannerMessage('You must be logged in to verify your email.');
      setBannerType('error');
      return;
    }

    if (user.emailVerified) {
      setEmailVerified(true);
      return;
    }

    try {
      await sendEmailVerification(user);
      setBannerMessage('Verification email sent.');
      setBannerType('success');
    } catch (error) {
      setBannerMessage('Failed to send verification email: ' + error.message);
      setBannerType('error');
    }
  };

  return (
    <View style={styles.container}>
      {/* Show Banner if there is a message */}
      {bannerMessage && <Banner message={bannerMessage} type={bannerType} />}

      <Text style={styles.title}>Settings</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>New Email:</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={(text) => setUsername(text)}
          placeholder="Enter your new email"
        />
        <TouchableOpacity style={styles.button} onPress={handleEmailChange}>
          <Text style={styles.buttonText}>Change Email</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>New Password:</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={(text) => setPassword(text)}
          placeholder="Enter your password to confirm"
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <TouchableOpacity
          style={[styles.button, emailVerified && styles.disabledButton]}
          onPress={handleEmailVerification}
          disabled={emailVerified}
        >
          <Text style={styles.buttonText}>
            {emailVerified ? 'Email Verified' : 'Verify Email'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingsPage;
