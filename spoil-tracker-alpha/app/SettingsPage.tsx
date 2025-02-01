import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './SettingsPageStyleSheet';

const SettingsPage = (): JSX.Element =>
{
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  const handleUsernameChange = () => 
  {
    if (username.trim() === '') 
    {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }
    Alert.alert('Success', 'Username updated successfully.');
  };

  const handlePasswordChange = () => {
    if (password.trim().length < 6) 
    {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    Alert.alert('Success', 'Password updated successfully.');
  };

  const handleEmailVerification = () => 
  {
    setEmailVerified(true);
    Alert.alert('Success', 'Email verified successfully.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>New Username:</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => setUsername(text)}
              placeholder="Enter your new username"
            />
            <TouchableOpacity style={styles.button} onPress={handleUsernameChange}>
              <Text style={styles.buttonText}>Change Username</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholder="Enter your new password"
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

        <View style={styles.divider} />

        <View style={styles.rightSection}>
          <Text>Placeholder</Text>
        </View>
      </View>
    </View>
  );
};

export default SettingsPage;