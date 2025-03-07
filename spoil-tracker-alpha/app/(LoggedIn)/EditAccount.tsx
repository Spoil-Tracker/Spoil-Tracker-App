import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

interface EditAccountRouteParams {
  userID: string;
  currentUserName: string;
}

export default function EditAccount() {
  const route = useRoute();
  const { userID, currentUserName } =
    route.params as EditAccountRouteParams;

  const [username, setUserName] = useState(currentUserName || '');
  const router = useRouter();

  // Log the current values for debugging
  useEffect(() => {
    console.log('Current user name:', currentUserName);
  }, [currentUserName]);

  const updateUserData = async () => {
    try {
      const userRef = doc(db, 'users', userID); // Reference to the user document
      await updateDoc(userRef, {
        username: username,
      });
      console.log('User account updated successfully!');

      // Go back to the home screen after update
      router.push('/Profile'); // You can navigate back or to a different screen after the update
    } catch (error) {
      console.error('Error updating user data: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Account</Text>

      {/* User Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>User Name:</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUserName}
          placeholder="Enter your user name"
        />
      </View>

  

      {/* Update Button */}
      <Button title="Update Account" onPress={updateUserData} />

      <View style={styles.space} />

      {/* Go Back Button */}
      <Button title="Go Back" onPress={() => router.push('/Profile')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF9F2',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4CAE4F',
    marginBottom: 16,
  },
  inputContainer: {
    width: '50%',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 40,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 16,
    width: '100%',
  },
  space: {
    marginBottom: 20,
  },
});
