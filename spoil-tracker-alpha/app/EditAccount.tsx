import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import styles from './SettingsPageStyleSheet';

interface EditAccountRouteParams {
  userID: string;
  currentFirstName: string;
  currentLastName: string;
  currentAvatar: string;
}

export default function EditAccount() {
  const route = useRoute();
  const { userID, currentFirstName, currentLastName, currentAvatar } =
    route.params as EditAccountRouteParams;

  const [firstName, setFirstName] = useState(currentFirstName || '');
  const [lastName, setLastName] = useState(currentLastName || '');
  const [avatar, setAvatar] = useState(currentAvatar || '');
  const router = useRouter();

  // Function to pick an image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      console.log("Selected image URI:", result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    } else {
      Alert.alert("No image selected", "Please select an image to upload.");
    }
    
  };

  // Function to upload image to Firebase Storage
  const uploadImage = async (imageUri: string) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `avatars/${userID}.jpg`);

      console.log("Uploading image...");

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      console.log("Download URL:", downloadURL);
      setAvatar(downloadURL);
      updateUserAvatar(downloadURL);
    } catch (error) {
      Alert.alert('Upload Failed', 'Error uploading image.');
      console.error(error);
    }
  };

  // Function to update Firestore with avatar URL
  const updateUserAvatar = async (avatarUrl: string) => {
    try {
      const userRef = doc(db, 'user_profiles', userID);
      await updateDoc(userRef, { avatar: avatarUrl });
      
      console.log("Firestore updated with avatar URL:", avatarUrl);
      setAvatar(avatarUrl); // ✅ Update state
      Alert.alert('Success', 'Avatar updated successfully!');

    } catch (error) {
      Alert.alert('Error', 'Failed to update avatar.');
      console.error(error);
    }
  };

  // Function to update name fields
  const updateUserData = async () => {
    try {
      const userRef = doc(db, 'user_profiles', userID);
      await updateDoc(userRef, { name: `${firstName} ${lastName}` });
      Alert.alert('Success', 'Profile updated successfully!');
      router.push('/Profile');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Account</Text>

      {/* Avatar Preview */}
      <TouchableOpacity onPress={pickImage}>
        <Image source={{ uri: avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
        <Text style={styles.avatarText}>Tap to Change</Text>
      </TouchableOpacity>

      {/* First Name Input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
        />
      </View>

      {/* Last Name Input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
        />
      </View>

      {/* Update Account Button */}
      <TouchableOpacity style={styles.button} onPress={updateUserData}>
        <Text style={styles.buttonText}>Update Account</Text>
      </TouchableOpacity>

      {/* Go Back Button */}
      <TouchableOpacity style={[styles.button, styles.disabledButton]} onPress={() => router.push('/Profile')}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
