import React, { useState, useEffect } from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { auth } from '@/services/firebaseConfig'; // Import Firebase auth config
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import {
  updatePassword,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from 'firebase/auth';
import Banner from '@/components/Banner'; // Import the Banner component
import styles from '../SettingsPageStyleSheet'; // Import your existing styles

const SettingsPage = (): JSX.Element => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState<'success' | 'error'>('success');
  const [notificationSetting, setNotificationSetting] = useState('Notify Everyday');
  const [phoneNumber, setPhoneNumber] = useState('');

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
      await verifyBeforeUpdateEmail(user, username);
      setBannerMessage('Verification email sent. Please check your inbox.');
      setBannerType('success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setBannerMessage('Failed to update email: ' + errorMessage);
      setBannerType('error');
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
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setBannerMessage('Failed to update password: ' + errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setBannerMessage('Failed to send verification email: ' + errorMessage);
      setBannerType('error');
    }
  };

  const handleNotificationChange = (setting: string) => 
  {
    setNotificationSetting(setting);
    setBannerMessage(`Notification setting changed to: ${setting}`);
    setBannerType('success');
  };

  const handlePhoneNumberSave = () => 
  {
    const phoneRegex = /^[0-9]{10,15}$/;

    if (phoneNumber.trim() === '') {
      setBannerMessage('Phone number removed.');
      setBannerType('success');
      return;
    }

    if (!phoneRegex.test(phoneNumber)) {
      setBannerMessage('Invalid phone number. Please enter a valid number.');
      setBannerType('error');
      return;
    }

    setBannerMessage('Phone number saved successfully.');
    setBannerType('success');
  };

  return (
    <View style={styles.container}>
      {/* Display the banner if there is a message */}
      {bannerMessage && <Banner message={bannerMessage} type={bannerType} />}

      <Text style={styles.title}>Settings</Text>

      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
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

        {/* Divider for two sections */}
        <View style={styles.divider} />

        <View style={styles.rightSection}>
          <Text style={styles.label}>Notification Settings:</Text>

          {['Notify Everyday', 'Notify Weekly', 'Notify Monthly', 'Notify Never'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.notificationOption,
                notificationSetting === option && styles.selectedOption,
              ]}
              onPress={() => handleNotificationChange(option)}
            >
              <Text style={styles.notificationText}>{option}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number (Optional):</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.button} onPress={handlePhoneNumberSave}>
              <Text style={styles.buttonText}>Save Phone Number</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SettingsPage;
