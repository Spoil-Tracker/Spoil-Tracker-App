import React, { useEffect, useState } from 'react';
import { Text, View, Image, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '@/services/firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/services/authContext';

export default function ProfileScreen() {
  const { user } = useAuth();
  const userID = user?.uid;
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    avatar: '',
  });

  useEffect(() => {
    if (!userID) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'user_profiles', userID);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('User document data:', data);

          if (!data.avatar) {
            await updateDoc(userDocRef, {
              avatar: "https://via.placeholder.com/150", // Default Avatar
            });
          }  

          setUserData({
            email: data.email,
            firstName: data.name.split(' ')[0],
            lastName: data.name.split(' ')[1] || '',
            avatar: data.avatar || 'https://via.placeholder.com/100', // Default avatar if none exists
          });
        } else {
          console.log('No user document found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userID]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleDeleteAccount = async () => {
    if (!userID) return;
    try {
      const userRef = doc(db, 'user_profiles', userID);
      await deleteDoc(userRef);
      await deleteUser(user);
      console.log('User account deleted successfully.');

      router.push('/login');
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting user account:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: userData.avatar }} style={styles.avatar} />
        <Text style={styles.avatarText}>{userData.firstName} {userData.lastName}</Text>
      </View>

      {/* User Info Section */}
      <View style={styles.group}>
        <Text style={styles.title}>My Account</Text>
        <Text>Email: <Text style={styles.infoText}>{userData.email || 'Loading...'}</Text></Text>
        <Text>First Name: <Text style={styles.infoText}>{userData.firstName || 'Loading...'}</Text></Text>
        <Text>Last Name: <Text style={styles.infoText}>{userData.lastName || 'Loading...'}</Text></Text>
        <View style={styles.space} />
        <Button
          title="Edit Account"
          onPress={() =>
            router.push({
              pathname: '/EditAccount',
              params: {
                userID,
                currentFirstName: userData.firstName,
                currentLastName: userData.lastName,
                currentAvatar: userData.avatar,
              },
            })
          }
        />
      </View>

      {/* Delete Account Section */}
      <View style={styles.group}>
        <Text style={styles.dangerText}>Permanently Delete Your Account</Text>
        <Button title="Delete Account" onPress={toggleModal} />
      </View>

      {/* Delete Confirmation Modal */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={toggleModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalMessage}>This action cannot be undone.</Text>
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={toggleModal} />
              <Button title="Permanently Delete Account" color="red" onPress={handleDeleteAccount} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🔹 Styles for Profile Page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF9F2',
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#4CAE4F',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  group: {
    width: '50%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontWeight: 'bold',
    color: '#4CAE4F',
  },
  dangerText: {
    marginBottom: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  space: {
    marginBottom: 15,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

