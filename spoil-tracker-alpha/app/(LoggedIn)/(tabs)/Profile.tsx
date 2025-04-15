import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  Modal,
  Button,
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
import { arrayUnion, doc, getDoc, updateDoc, setDoc, deleteDoc, addDoc, getDocs, collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../services/authContext';
import { useTheme } from 'react-native-paper'; // allows for dark mode, contributed by Kevin
import { createKitchenInvite } from '../../../services/inviteService';

// Global variables for any function that requires to call an icon
const userIcon = require('../../../assets/images/icon.png');
const appleIcon = require('../../../assets/images/apple.png');
const fridgeIcon = require('../../../assets/images/fridge.png');
const milkIcon = require('../../../assets/images/milk.png');
const coinIcon = require('../../../assets/images/coin.png');


export default function HomeScreen() {
  const { colors, dark } = useTheme(); // allows for dark mode, contributed by Kevin
  const { user } = useAuth();
  const userID = user?.uid;
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false); // Establishes modals
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [isIconModalVisible, setIconModalVisible] = useState(false);
  const [isAppIconModalVisible, setAppIconModalVisible] = useState(false);
  const [selectedAppIcon, setSelectedAppIcon] = useState<string | null>(null); // Allows icon to be changed
  const [generatedLink, setGeneratedLink] = useState('');
  const [userData, setUserData] = useState({
    email: '',
    name: '',
    biography: '',
    notificationSetting: 'Notify Everyday',
    favoriteFoods: ['', '', ''],
  }); // User data for Fire Store

  const [leftColumnHeight, setLeftColumnHeight] = useState(0); // Split page into two sections
  const [rightColumnHeight, setRightColumnHeight] = useState(0);

  const [profileIcon, setProfileIcon] = useState<ImageSourcePropType>(userIcon);
  const [isCustomIcon, setIsCustomIcon] = useState(false);

  const [rewardProgress, setRewardProgress] = useState(0);

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
          setRewardProgress(data.rewardProgress || 0);
        } else {
          // Initialize reward data: reward available and no unclaimed rewards.
          await setDoc(rewardDocRef, {weeklyRewardClaimed: false, unclaimedRewards: 0, rewardProgress: 0});
          setRewardAvailable(true);
          setUnclaimedRewards(0);
          setRewardProgress(0);
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
      const newProgress = Math.min(rewardProgress + 1, 4);
      await setDoc(rewardDocRef, {weeklyRewardClaimed: true, unclaimedRewards: 0, rewardProgress: newProgress, rewardCollectedAt: new Date(),}, {merge: true});
      setRewardAvailable(false);
      setUnclaimedRewards(0);
      setRewardProgress(prev => Math.min(prev + 1, 4));
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
            favoriteFoods: data.favoriteFoods || ['', '', ''],
          });
        }
      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
    return () => unsubscribe();
  }, [userID]);

  const generateShareLink = async () => {
    try {
      const link = await createKitchenInvite(userID || '');
      setGeneratedLink(link);
      setShareModalVisible(true);
    } catch (error) {
      alert('Failed to generate link');
    }
  };

  const copyToClipboard = () => {
    Clipboard.setStringAsync(generatedLink);
    alert('Link copied to clipboard!');
  };

  const extractInviteCode = (input: string) => {
    const match = input.trim().match(/([a-zA-Z0-9_-]{10,})$/);
    return match ? match[1] : null;
  };

//Join Kitchen feature  
const [enteredCode, setEnteredCode] = useState('');

const handleJoinKitchen = async () => {
  const code = extractInviteCode(enteredCode);
  const currentUser = auth.currentUser;
  if (!code || !currentUser) {
    alert('Invalid share code or user');
    return;
  }

  try {
    const inviteRef = doc(db, 'invites', code);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      alert('Invite code not found or expired');
      return;
    }

    const inviteData = inviteSnap.data();
    const ownerID = inviteData.owner_id;

    // Reference to the family doc
    const familySnapshot = await getDocs(collection(db, 'family'));
    let foundFamilyDoc = null;
    let familyID = '';

    familySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.owner_id === ownerID) {
        foundFamilyDoc = docSnap;
        familyID = docSnap.id;
      }
    });

    if (!foundFamilyDoc) {
      // Create the family document
      const newFamilyRef = await addDoc(collection(db, 'family'), {
        owner_id: ownerID,
        members: [ownerID, currentUser.uid],
        shared_pantries: [],
        shared_lists: [],
        createdAt: new Date().toISOString(),
      });
    } else {
      // Add user to existing members array
      await updateDoc(doc(db, 'family', familyID), {
        members: arrayUnion(currentUser.uid),
      });
    }

    alert('Successfully joined the kitchen!');
  } catch (err) {
    console.error('Error joining kitchen:', err);
    alert('Failed to join the kitchen.');
  }
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

  const handleFavoriteFoodChange = async (index: number, value: string) => {
    const updatedFoods = [...userData.favoriteFoods];
    updatedFoods[index] = value;
    setUserData({...userData, favoriteFoods: updatedFoods});
    if (userID) {
      const userDocRef = doc(db, 'users', userID);
      try {
        await setDoc(userDocRef, {favoriteFoods: updatedFoods}, {merge: true});
      } catch (error) {
        console.error('Error updating favorite foods: ', error);
      }
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
          <View style={styles.rewardContainer}>
            <Text style={[styles.rewardTitle, { color: dark ? '#FFF' : '#000' }]}>
              Reward Progress: Level 1
            </Text>
            <View style={styles.rewardMeterRow}>
              <Image source={coinIcon} style={styles.coinIcon} />
              <View style={styles.rewardMeter}>
                <View style={[styles.rewardBar, rewardProgress >= 1 && styles.rewardBarFilled]} />
                <View style={[styles.rewardBar, rewardProgress >= 2 && styles.rewardBarFilled]} />
                <View style={[styles.rewardBar, rewardProgress >= 3 && styles.rewardBarFilled]} />
                <View style={[styles.rewardBar, rewardProgress >= 4 && styles.rewardBarFilled]} />
              </View>
            </View>
          </View>

          <View style={[styles.group, {marginBottom: 16}]}>
            <Text style={styles.favoriteFoodTitle}>Favorite Food(s)</Text>
            <TextInput
              style={styles.favoriteFoodInput}
              value={userData.favoriteFoods[0]}
              onChangeText={(text) => handleFavoriteFoodChange(0, text)}
              maxLength={25}
              placeholder="Favorite Food 1"
              placeholderTextColor="#FFF"
            />
            <TextInput
              style={styles.favoriteFoodInput}
              value={userData.favoriteFoods[1]}
              onChangeText={(text) => handleFavoriteFoodChange(1, text)}
              maxLength={25}
              placeholder="Favorite Food 2"
              placeholderTextColor="#FFF"
            />
            <TextInput
              style={styles.favoriteFoodInput}
              value={userData.favoriteFoods[2]}
              onChangeText={(text) => handleFavoriteFoodChange(2, text)}
              maxLength={25}
              placeholder="Favorite Food 3"
              placeholderTextColor="#FFF"
            />
          </View>

          {/* Share Kitchen Section */}
          <View style={styles.group}>
            <Text style={styles.info}>
              Share your kitchen with friends and family to manage the kitchen
              together.
            </Text>
            <Button title="Share Kitchen" onPress={generateShareLink} />
            <View style={{ marginTop: 20 }}>
              <Text style={styles.label}>Have a Share Code?</Text>
              <TextInput
                placeholder="Enter share code..."
                value={enteredCode}
                onChangeText={setEnteredCode}
                style={styles.shareInput}
              />
              <TouchableOpacity style={styles.customButton} onPress={handleJoinKitchen}>
                <Text style={styles.joinButtonText}>Join Kitchen</Text>
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
                <Text style={styles.customButtonText}>No! I changed my mind!</Text>
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
  shareInput: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },

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
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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

  favoriteFoodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },

  favoriteFoodInput: {
    backgroundColor: '#4CAE4F',
    color: '#FFF',
    fontWeight: 'bold',
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
  },

  rewardContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },

  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  rewardMeterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  coinIcon: {
    width: 60,
    height: 60,
    marginRight: 8,
  },

  rewardMeter: {
    flexDirection: 'row',
  },

  rewardBar: {
    width: 30,
    height: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 4,
    backgroundColor: 'transparent',
  },

  rewardBarFilled: {
    backgroundColor: '#4CAE4F',
    borderColor: '#4CAE4F',
  }
});
