import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useTheme } from 'react-native-paper';

interface EditAccountRouteParams {
  userID: string;
  currentName: string;
}

export default function EditAccount() {
  const route = useRoute();
  const { userID, currentName } = route.params as EditAccountRouteParams;

  const [name, setName] = useState(currentName || '');
  const router = useRouter();

  const {colors} = useTheme();

  // Log the current values for debugging
  useEffect(() => {
    console.log('Current name:', currentName);
  }, [currentName]);

  const updateUserData = async () => {
    try {
      const userRef = doc(db, 'users', userID); // Reference to the user document
      await updateDoc(userRef, {
        name: name,
      });
      console.log('User account updated successfully!');

      // Go back to the home screen after update
      router.push('/Profile'); // You can navigate back or to a different screen after the update
    } catch (error) {
      console.error('Error updating user data: ', error);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.onSurface }]}>Edit Account</Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Name:</Text>
        <TextInput
          style={[styles.input, { color: colors.onSurface }]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colors.outline || '#ccc'}
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
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
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