import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from '@/app/(LoggedIn)/SettingsPageStyleSheet';

const SettingsPage = (): JSX.Element => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [notificationSetting, setNotificationSetting] = useState('Notify Everyday');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handleUsernameChange = () => {
    if (username.trim() === '') {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }
    Alert.alert('Success', 'Username updated successfully.');
  };

  const handlePasswordChange = () => {
    if (password.trim().length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    Alert.alert('Success', 'Password updated successfully.');
  };

  const handleEmailVerification = () => {
    setEmailVerified(true);
    Alert.alert('Success', 'Email verified successfully.');
  };

  const handleNotificationChange = (setting: string) => {
    setNotificationSetting(setting);
    Alert.alert('Success', `Notification setting changed to: ${setting}`);
  };

  const handlePhoneNumberSave = () => {
    const phoneRegex = /^[0-9]{10,15}$/; 

    if (phoneNumber.trim() === '') {
      Alert.alert('Success', 'Phone number removed.');
      return;
    }

    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Invalid phone number. Please enter a valid number.');
      return;
    }

    Alert.alert('Success', 'Phone number saved successfully.');
  };

  return (
    <View style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      <Text style={[styles.title, darkMode ? styles.darkText : styles.lightText]}>Settings</Text>

      <View style={styles.contentContainer}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>New Username:</Text>
            <TextInput
              style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your new username"
              placeholderTextColor={darkMode ? "#ddd" : "#555"}
            />
            <TouchableOpacity style={styles.button} onPress={handleUsernameChange}>
              <Text style={styles.buttonText}>Change Username</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>New Password:</Text>
            <TextInput
              style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your new password"
              placeholderTextColor={darkMode ? "#ddd" : "#555"}
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

        {/* Divider */}
        <View style={styles.divider} />

        {/* Right Section (Notifications, Phone, Theme Toggle) */}
        <View style={styles.rightSection}>
          <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>Notification Settings:</Text>
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
            <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>Phone Number (Optional):</Text>
            <TextInput
              style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              placeholderTextColor={darkMode ? "#ddd" : "#555"}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.button} onPress={handlePhoneNumberSave}>
              <Text style={styles.buttonText}>Save Phone Number</Text>
            </TouchableOpacity>
          </View>

          {/* Theme Toggle */}
          <View style={styles.formGroup}>
            <TouchableOpacity style={styles.button} onPress={() => setDarkMode(!darkMode)}>
              <Text style={styles.buttonText}>
                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SettingsPage;
