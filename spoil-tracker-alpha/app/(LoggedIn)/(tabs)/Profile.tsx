import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  Button,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter, router } from 'expo-router';
import { db, auth } from '../../../services/firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../../services/authContext';
import { useTheme } from 'react-native-paper'; // allows for dark mode, contributed by Kevin

const userIcon = require('../../../assets/images/icon.png');


export default function HomeScreen() {
  const { colors } = useTheme(); // allows for dark mode, contributed by Kevin
  const { user } = useAuth();
  const userID = user?.uid;
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [userData, setUserData] = useState({
    email: '',
    username: '',
  });

  useEffect(() => {
    if (!userID) return;

    const fetchOrCreateUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', userID);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('User document data:', data);

          setUserData({
            email: data.email,
            username: data.username || 'New User',
          });
        } else {
          console.log('No user document found. Creating one...');
          const newUserData = {
            email: user.email,
            username: user.displayName || 'New User',
            createdAt: new Date().toISOString(),
          };

          await setDoc(userDocRef, newUserData);
          console.log('New user document created');

          setUserData({
            email: newUserData.email || '',
            username: newUserData.username || '',
          });
        }
      } catch (error) {
        console.error('Error fetching or creating user data:', error);
      }
    };

    fetchOrCreateUserData();
  }, [userID, user]);

  const generateShareLink = () => {
    const fakeLink = `https://fakelink.com`;
    setGeneratedLink(fakeLink);
    setShareModalVisible(true);
  };

  const copyToClipboard = () => {
    Clipboard.setStringAsync(generatedLink);
    alert('Link copied to clipboard!');
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible); // Toggle the modal visibility
  };

  const handleDeleteAccount = async () => {
    if (!userID) return;

    const user = auth.currentUser;

    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    try {
      // Reference to the user document by userID
      const userRef = doc(db, 'users', userID);
  
      // Delete the user document from Firestore
      await deleteDoc(userRef);

      // Delete the user's authentication account
      await deleteUser(user);

      console.log('User account and authentication deleted successfully.');

      // Redirect to the login screen
      router.push('/login');

      // Close the modal after deletion
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting user account: ', error);
    }
  };

  return (
    // allows for dark mode, contributed by Kevin
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Account Header with Small Image */}
      <View style={styles.accountHeader}>
        <Image source={userIcon} style={styles.icon} />
        <Text style={styles.accountTitle}>My Account</Text>
      </View>

      {/* First Group */}
      <View style={styles.group}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.info}>{userData.email || 'Loading...'}</Text>

        <Text style={styles.label}>User Name</Text>
        <Text style={styles.info}>{userData.username || 'Loading...'}</Text>

      
        <View style={styles.space2} />
        <Button
          title="Edit Account"
          onPress={() =>
            router.push({
              pathname: '/EditAccount',
              params: {
                userID, // Pass the userID
                currentUsername: userData.username,
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

      {/* Share Kitchen Section */}
      <View style={styles.group}>
        <Text style={styles.info}>
          Share your kitchen with friends and family to manage the kitchen
          together.
        </Text>
        <Button title="Share Kitchen" onPress={generateShareLink} />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isShareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Share Kitchen</Text>
            <Text style={styles.modalMessage}>
              Share this link with your family members.
            </Text>
            <TextInput
              style={styles.linkBox}
              value={generatedLink}
              editable={false}
            />
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyToClipboard}
            >
              <Text style={styles.copyButtonText}>Copy Link</Text>
            </TouchableOpacity>
            <Button title="Close" onPress={() => setShareModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal for Delete Confirmation */}
      <Modal
        animationType="slide" // Allows it to be displayed as a pop-up.
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal} // Handle closing the modal
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Warning!</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to permanently delete your account? This
              action cannot be undone.
            </Text>

            {/* Buttons for the modal */}
            <View style={styles.modalButtons}>
              <Button title="No! I change my mind!" onPress={toggleModal} />
              <Button
                title="Yes! Delete it forever!"
                color="red" // Red instead of usual green color to make it stand out more.
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
    padding: 16,
  },
  accountTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4CAE4F',
    marginBottom: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
  },
  icon: {
    width: 40, // Adjust the size as needed
    height: 40, // Adjust the size as needed
    marginRight: 10,
  },
  group: {
    width: '50%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dangerText: {
    //marginTop: 16,
    marginBottom: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
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
    color: '#4CAE4F',
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
  linkBox: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  copyButton: {
    backgroundColor: '#4CAE4F',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  copyButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
