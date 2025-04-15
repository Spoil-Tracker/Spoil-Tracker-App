import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useTheme } from 'react-native-paper';

// To live update whenever user edits their account
interface EditAccountRouteParams {
  userID: string;
  currentName: string;
  currentBio?: string;
}

export default function EditAccount() {
  const route = useRoute();
  const { userID, currentName, currentBio } = route.params as EditAccountRouteParams;

  const [name, setName] = useState(currentName || '');
  const [biography, setBiography] = useState(currentBio || '');
  const router = useRouter();

  const {colors, dark} = useTheme();

  // Log the current values for debugging
  useEffect(() => {
    console.log('Current name:', currentName);
  }, [currentName]);

  const updateUserData = async () => {
    try {
      const userRef = doc(db, 'users', userID); // Reference to the user document
      await updateDoc(userRef, {
        name: name,
        biography: biography,
      });
      console.log('User account updated successfully!');

      // Go back to the home screen after update
      router.push('/Profile'); // You can navigate back or to a different screen after the update
    } catch (error) {
      console.error('Error updating user data: ', error);
    }
  };

  return (
    <ScrollView style={{backgroundColor: colors.background}} contentContainerStyle={styles.container}>
      <Text style={[styles.title, {color: colors.onSurface }]}>Edit Account</Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Name:</Text>
        <View style={styles.singleLineInputContainer}>
          <TextInput
            style={[
              styles.input, 
              { 
                color: dark ? '#FFF' : '#000', // Adapts to dark or light mode toggle
                backgroundColor: dark ? '#222' : '#FFF',
                borderColor: dark ? '#444' : '#ccc', 
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={dark ? '#FFF' : '#000'} // Text color adapts to DL toggle for best visibility
            maxLength={250}
          />
          {/* Character limit of 250 that live updates */}
          <Text style={styles.characterCountSingle}>{250 - name.length} / 250</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, {color: colors.onSurface}]}>Biography:</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={[
              styles.textArea,
              {
                color: dark ? '#FFF' : '#000',
                backgroundColor: dark ? '#222' : '#FFF',
                borderColor: dark ? '#444' : '#ccc',
              },
            ]}
            value={biography}
            onChangeText={setBiography}
            placeholder="Enter your biography"
            placeholderTextColor={dark ? '#FFF' : '#000'}
            multiline={true}
            maxLength={2500}
          />
          <Text style={styles.characterCount}>{2500 - biography.length} / 2500</Text>
        </View>
      </View>

      {/* Update Button */}
      <TouchableOpacity style={styles.customButton} onPress={updateUserData}>
        <Text style={styles.customButtonText}>Update Account</Text>
      </TouchableOpacity>

      <View style={styles.space} />

      {/* Go Back Button */}
      <TouchableOpacity style={styles.customButton} onPress={() => router.push('/Profile')}>
        <Text style={styles.customButtonText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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

  singleLineInputContainer: {
    position: 'relative',
    width: '100%',
  },

  characterCountSingle: {
    position: 'absolute',
    right: 8,
    top: 12,
    fontSize: 12,
    color: '#666',
  },

  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    width: '100%',
    textAlignVertical: 'top'
  },

  textAreaContainer: {
    position: 'relative',
    width: '100%',
  },

  characterCount: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    fontSize: 12,
    color: '#666',
  },

  space: {
    marginBottom: 20,
  },

  customButton: {
    backgroundColor: '#4CAE4F',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },

  customButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});