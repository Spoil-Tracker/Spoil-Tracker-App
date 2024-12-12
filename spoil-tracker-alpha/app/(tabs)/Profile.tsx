import React, { useEffect, useState } from 'react';
import { Text, View, Button, Modal, StyleSheet } from 'react-native';
import { useRouter, router } from 'expo-router';
import { db } from '@/services/firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/services/authContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const userID = user?.uid;
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    if (!userID) return;

    const fetchOrCreateUserData = async () => {
      try {
        const userDocRef = doc(db, 'user_profiles', userID);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('User document data:', data);

          setUserData({
            email: data.email,
            firstName: data.name.split(' ')[0],
            lastName: data.name.split(' ')[1],
          });
        } else {
          console.log('No user document found. Creating one...');
          const newUserData = {
            email: user.email,
            name: user.displayName || 'New User',
            createdAt: new Date().toISOString(),
          };

          await setDoc(userDocRef, newUserData);
          console.log('New user document created');

          setUserData({
            email: newUserData.email,
            firstName: newUserData.name.split(' ')[0],
            lastName: newUserData.name.split(' ')[1] || '',
          });
        }
      } catch (error) {
        console.error('Error fetching or creating user data:', error);
      }
    };

    fetchOrCreateUserData();
  }, [userID, user]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible); // Toggle the modal visibility
  };

  const handleDeleteAccount = async () => {
    if (!userID) return;

    try {
      // Reference to the user document by userID
      const userRef = doc(db, 'user_profiles', userID);

      //Delete the user document from Firestore
      await deleteDoc(userRef);

      //console.log("User account deleted successfully.");

      // Optionally, navigate to a different screen (e.g., home page)
      router.push('/home'); // Redirect to the Home screen

      // Close the modal after deletion
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting user account: ', error);
    }
  };

  //const handleDeleteAccount = () => {
  //console.log("Account Deleted");
  //Add logic to permanently delete the account (API call or similar)
  //router.push("/"); // Navigate to Home Screen after deletion
  //setModalVisible(false); // Close the modal after deletion
  //};

  return (
    <View style={styles.container}>
      {/* First Group */}
      <View style={styles.group}>
        <Text style={styles.title}>My Account</Text>
        <Text>Your user account details</Text>
        <View style={styles.space} />
        <Text>Email: {userData.email || 'Loading...'}</Text>
        <Text>First Name: {userData.firstName || 'Loading...'}</Text>
        <Text>Last Name: {userData.lastName || 'Loading...'}</Text>
        <Text>Date joined: </Text>
        <View style={styles.space2} />
        <Button
          title="Edit Account"
          onPress={() =>
            router.push({
              pathname: '/EditAccount',
              params: {
                userID, // Pass the userID
                currentFirstName: userData.firstName,
                currentLastName: userData.lastName,
              },
            })
          }
        />
      </View>

      {/* Second Group */}
      <View style={styles.group}>
        <Text style={styles.dangerText}>Permanently Delete Your Account</Text>
        <Button title="Delete Account" onPress={toggleModal} />
      </View>

      {/* Modal for Delete Confirmation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal} // Handle closing the modal
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to permanently delete your account? This
              action cannot be undone.
            </Text>

            {/* Buttons for the modal */}
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={toggleModal} />
              <Button
                title="Permanently Delete Account"
                color="red"
                onPress={handleDeleteAccount}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF9F2',
    padding: 16,
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
  dangerText: {
    //marginTop: 16,
    marginBottom: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  space: {
    marginBottom: 15,
  },
  space2: {
    marginBottom: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay background with opacity
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
