import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { db, auth } from '../../../services/firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../services/authContext';
import { useTheme } from 'react-native-paper'; // allows for dark mode, contributed by Kevin

const userIcon = require('../../../assets/images/icon.png');
const appleIcon = require('../../../assets/images/apple.png');
const fridgeIcon = require('../../../assets/images/fridge.png');
const milkIcon = require('../../../assets/images/milk.png');

export default function HomeScreen() {
  const { colors, dark } = useTheme(); // allows for dark mode, contributed by Kevin
  const { user } = useAuth();
  const userID = user?.uid;
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [isIconModalVisible, setIconModalVisible] = useState(false);
  const [isAppIconModalVisible, setAppIconModalVisible] = useState(false);
  const [selectedAppIcon, setSelectedAppIcon] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [userData, setUserData] = useState({
    email: '',
    name: '',
    biography: '',
    notificationSetting: 'Notify Everyday',
  });

  const [leftColumnHeight, setLeftColumnHeight] = useState(0);
  const [rightColumnHeight, setRightColumnHeight] = useState(0);

  const [profileIcon, setProfileIcon] = useState<ImageSourcePropType>(userIcon);
  const [isCustomIcon, setIsCustomIcon] = useState(false);

  // Reward notification state.
  const [rewardAvailable, setRewardAvailable] = useState(false);
  const [unclaimedRewards, setUnclaimedRewards] = useState(0);

  useEffect(() => {
    const loadProfileIcon = async () => {
      try {
        const storedIcon = await AsyncStorage.getItem('profileIcon');
        if (storedIcon) {
          if (storedIcon.startsWith('appIcon:')) {
            const iconName = storedIcon.replace('appIcon:', '');
            let icon;
            if (iconName === 'Apple') {
              icon = appleIcon;
            } else if (iconName === 'Fridge') {
              icon = fridgeIcon;
            } else if (iconName === 'Milk') {
              icon = milkIcon;
            }
            setProfileIcon(icon);
            setIsCustomIcon(true);
          } else {
            setProfileIcon({uri: storedIcon});
            setIsCustomIcon(true);
          }
        } else {
          setProfileIcon(userIcon);
          setIsCustomIcon(false);
        }
      } catch (e) {
        console.error('Failed to load profile icon', e);
      }
    };
    loadProfileIcon();
  }, []);

  // Fetch or initialize reward state from Firestore.
  useEffect(() => {
    if (!userID) return;
    const fetchRewardData = async () => {
      try {
        const rewardDocRef = doc(db, 'user_rewards', userID);
        const rewardDoc = await getDoc(rewardDocRef);
        if (rewardDoc.exists()) {
          const data = rewardDoc.data();
          // If user has not claimed reward, then it will be available.
          setRewardAvailable(!data.weeklyRewardClaimed);
          setUnclaimedRewards(data.unclaimedRewards || 0);
        } else {
          // Initialize reward data: reward available and no unclaimed rewards.
          await setDoc(rewardDocRef, {weeklyRewardClaimed: false, unclaimedRewards: 0});
          setRewardAvailable(true);
          setUnclaimedRewards(0);
        }
      } catch (error) {
        console.error('Error fetching reward data:', error);
      }
    };
    fetchRewardData();
  }, [userID]);

  // Handle the weekly reward notification.
  const handleClaimReward = async () => {
    if (!userID) return;
    const rewardDocRef = doc(db, 'user_rewards', userID);
    try {
      // Mark reward as claimed.
      await setDoc(rewardDocRef, {weeklyRewardClaimed: true, unclaimedRewards: 0});
      setRewardAvailable(false);
      setUnclaimedRewards(0);
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const handleIgnoreReward = async () => {
    if (!userID) return;
    const rewardDocRef = doc(db, 'user_rewards', userID);
    try {
      // Mark the weekly reward as dismissed and increment unclaimed rewards.
      const newCount = 1;
      await setDoc(rewardDocRef, {weeklyRewardClaimed: true, unclaimedRewards: newCount});
      setRewardAvailable(false);
      setUnclaimedRewards(newCount);
    } catch (error) {
      console.error('Error ignoring reward:', error);
    }
  };

  const handleShowRewardNotification = () => {
    setRewardAvailable(true);
  }

  useEffect(() => {
    if (!userID) return;

    const userDocRef = doc(db, 'users', userID);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapShot) => {
        if (docSnapShot.exists()) {
          const data = docSnapShot.data();
          console.log('User document updated:', data);
          setUserData({
            email: data.email,
            name: data.name || '',
            biography: data.biography || '',
            notificationSetting: data.notificationSetting || 'Notify Everyday',
          });
        }
      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
    return () => unsubscribe();
  }, [userID]);

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
      const rewardRef = doc(db, 'user_rewards', userID);
      await deleteDoc(rewardRef);

      // Reference to the user document by userID
      const userRef = doc(db, 'users', userID);

      // Delete the user document from Firestore
      await deleteDoc(userRef);

      // Delete the user's authentication account
      await deleteUser(user);

      console.log('User account, rewards, and authentication deleted successfully.');

      // Redirect to the login screen
      router.push('/login');

      // Close the modal after deletion
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting user account: ', error);
    }
  };

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      alert("Permission to access the gallery is required!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setProfileIcon({uri: asset.uri});
      setIsCustomIcon(true);
      await AsyncStorage.setItem('profileIcon', asset.uri);
      setIconModalVisible(false);
    }
  };

  return (
    // allows for dark mode, contributed by Kevin
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      {/* Unclaimed rewards storage */}
      {userData.notificationSetting !== 'Notify Never' && unclaimedRewards > 0 && (
        <TouchableOpacity style={styles.unclaimedBadge} onPress={handleShowRewardNotification}>
          <Text style={styles.unclaimedBadgeText}>{unclaimedRewards}</Text>
        </TouchableOpacity>
      )}

      {/* Weekly reward notification */}
      {userData.notificationSetting !== 'Notify Never' && rewardAvailable && (
        <View style={styles.topRightNotification}>
          <Text style={styles.notificationText}>
            Your weekly reward is available to claim!
          </Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.claimButton} onPress={handleClaimReward}>
              <Text style={styles.customButtonText}>Claim</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ignoreButton} onPress={handleIgnoreReward}>
              <Text style={styles.customButtonText}>Ignore</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.accountHeader}>
        <TouchableOpacity onPress={() => setIconModalVisible(true)}>
          <Image source={profileIcon} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.accountTitle}>My Account</Text>
      </View>

      <View style={styles.columnsContainer}>
        <View
          style={styles.leftColumn}
          onLayout={(event) => setLeftColumnHeight(event.nativeEvent.layout.height)}
        >
          {/* First Group */}
          <View style={styles.group}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.info}>{userData.email || 'Loading...'}</Text>

            <Text style={styles.label}>Name</Text>
            <Text style={styles.info}>{userData.name || 'Loading...'}</Text>

            <Text style={styles.label}>Biography</Text>
            <Text style={styles.info}>{userData.biography || 'No biography set'}</Text>

            <View style={styles.space2} />
            <TouchableOpacity
              style={styles.customButton}
              onPress={() =>
                router.push({
                  pathname: '/EditAccount',
                  params: {
                    userID, // Pass the userID
                    currentName: userData.name,
                    currentBio: userData.biography,
                  },
                })
              }
            >
              <Text style={styles.customButtonText}>Edit Account</Text>
            </TouchableOpacity>
          </View>
          {/* Second Group */}
          <View style={styles.group}>
            <Text style={styles.dangerText}>Permanently Delete Your Account</Text>
            <TouchableOpacity style={styles.customButton} onPress={toggleModal}>
              <Text style={styles.customButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.divider, {height: Math.max(leftColumnHeight, rightColumnHeight)}]} />

        <View
          style={styles.rightColumn}
          onLayout={(event) => setRightColumnHeight(event.nativeEvent.layout.height)}
        >
          {/* Share Kitchen Section */}
          <View style={styles.group}>
            <Text style={styles.info}>
              Share your kitchen with friends and family to manage together.
            </Text>
            <TouchableOpacity style={styles.customButton} onPress={generateShareLink}>
              <Text style={styles.customButtonText}>Share Kitchen</Text>
            </TouchableOpacity>
          </View>
        </View>
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
              style={[
                styles.linkBox, 
                {
                  color: dark ? '#FFF' : '#000',
                  backgroundColor: dark ? '#222' : '#f5f5f5',
                  borderColor: dark ? '#444' : '#ccc',
                },
              ]}
              value={generatedLink}
              editable={false}
            />
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyToClipboard}
            >
              <Text style={styles.copyButtonText}>Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.customButton} onPress={() => setShareModalVisible(false)}>
              <Text style={styles.customButtonText}>Close</Text>
            </TouchableOpacity>
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
              <TouchableOpacity style={styles.customButton} onPress={toggleModal}>
                <Text style={styles.customButtonText}>No! I change my mind!</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.customButton, { backgroundColor: 'red' }]} onPress={handleDeleteAccount}>
                <Text style={styles.customButtonText}>Yes! Delete it forever!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isIconModalVisible}
        onRequestClose={() => setIconModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.iconModalContainer}>
            <Text style={styles.modalTitle}>Change Profile Icon</Text>
            <View style={styles.iconOptionsContainer}>
              <TouchableOpacity
                style={styles.iconOptionButton}
                onPress={async () => {
                  setIconModalVisible(false);
                  setAppIconModalVisible(true);
                }}
              >
                <Text style={styles.customButtonText}>Use App Provided</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconOptionButton} onPress={pickImage}>
                <Text style={styles.customButtonText}>Use Custom Image</Text>
              </TouchableOpacity>
            </View>
            {isCustomIcon && (
              <TouchableOpacity 
                style={[styles.customButton, {backgroundColor: 'red', width: '80%', marginVertical: 8}]} 
                onPress={async () => {
                  setProfileIcon(userIcon);
                  setIsCustomIcon(false);
                  await AsyncStorage.removeItem('profileIcon');
                }}
              >
                <Text style={styles.customButtonText}>Use Default Icon</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.customButton} onPress={() => setIconModalVisible(false)}>
              <Text style={styles.customButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAppIconModalVisible}
        onRequestClose={() => setAppIconModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select an Icon</Text>
            <View style={styles.appIconsRow}>
              <TouchableOpacity 
                onPress={() => setSelectedAppIcon('Apple')}
                style={[styles.iconModalContainer, selectedAppIcon === 'Apple' && styles.selectedIconContainer]}
              >
                <Image source={appleIcon} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSelectedAppIcon('Fridge')}
                style={[styles.iconModalContainer, selectedAppIcon === 'Fridge' && styles.selectedIconContainer]}
              >
                <Image source={fridgeIcon} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSelectedAppIcon('Milk')}
                style={[styles.iconModalContainer, selectedAppIcon === 'Milk' && styles.selectedIconContainer]}  
              >
                <Image source={milkIcon} style={styles.icon} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.customButton, {flex: 1, marginRight: 10}]} onPress={() => {
                setAppIconModalVisible(false);
                setIconModalVisible(true);
              }}>
                <Text style={styles.customButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.customButton, {flex: 1, marginLeft: 10}]} onPress={async () => {
                if (!selectedAppIcon) return;
                let newIcon;
                if (selectedAppIcon === 'Apple') {
                  newIcon = appleIcon;
                } else if (selectedAppIcon === 'Fridge') {
                  newIcon = fridgeIcon;
                } else if (selectedAppIcon === 'Milk') {
                  newIcon = milkIcon;
                }
                setProfileIcon(newIcon);
                setIsCustomIcon(true);
                await AsyncStorage.setItem('profileIcon', 'appIcon:' + selectedAppIcon);
                setAppIconModalVisible(false);
              }} disabled={!selectedAppIcon}>
                <Text style={styles.customButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    fontSize: 60,
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
    width: 100, // Adjust the size as needed
    height: 100, // Adjust the size as needed
    marginRight: 10,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 16,
  },
  leftColumn: {
    flex: 1,
    alignItems: 'center',
  },
  rightColumn: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 2,
    backgroundColor: '#4CAE4F'
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
  iconModalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center'
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

  topRightNotification: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4CAE4F',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },

  notificationText: {
    color: 'white',
    fontSize: 14,
  },

  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },

  claimButton: {
    backgroundColor: '#2E7D32',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },

  ignoreButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
  },

  unclaimedBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'red',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  unclaimedBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  },

  iconOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },

  iconOptionButton: {
    flex: 1,
    backgroundColor: '#4CAE4F',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  appIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: '20%',
  },

  iconContainer: {
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 10,
  },

  selectedIconContainer: {
    borderWidth: 2,
    borderColor: '#4CAE4F',
  },
});