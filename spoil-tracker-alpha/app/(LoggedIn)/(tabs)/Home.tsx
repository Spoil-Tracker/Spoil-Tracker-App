import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { useRouter, Link, usePathname } from 'expo-router';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../../services/authContext'; // Import the authentication context
import { useTheme, Text, Icon } from 'react-native-paper'; // Import useTheme and Text from react-native-paper
import { db, auth } from '../../../services/firebaseConfig'; // imports authentication
import { doc, getDoc, getDocs, collection } from 'firebase/firestore'; // imports user information from firestore
import { onAuthStateChanged, getAuth } from 'firebase/auth'; // gets authentication from firebase
import { fetchPantries } from '../../../src/utils/pantryUtils'; // calls fetchpantries to display on home
import { fetchGroceryLists } from '../../../src/utils/groceryUtils'; // calls fetchgrocerylists to display on home
import { MaterialCommunityIcons } from '@expo/vector-icons'; // for fridge icon
import CalorieProgress from '../../../components/calorieProgress'; // // calls calorieprogress to display on home

export default function HomeScreen() {
  // State for Home screen
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();
  const { logout } = useAuth(); // Get the logout function
  const { colors } = useTheme(); // Adds dark mode
  const [username, setUsername] = useState('');
  const [pantries, setPantries] = useState<any[]>([]); // pantries to display on home
  const [loading, setLoading] = useState(true);
  const [grocery, setGrocery] = useState<any[]>([]); // groceries to display on home
  const user = getAuth().currentUser; // gets user auth to display username on home
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width
  );
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const pathname = usePathname();
  const [pageTimes, setPageTimes] = useState<{[key: string]: number}>({});
  const [lastPageChange, setLastPageChange] = useState<number>(Date.now());
  const [familyInfo, setFamilyInfo] = useState({
    name: 'Best Family Ever',
    sharedPantries: 4,
    sharedLists: 2
  });

  // function to fetch incomplete lists in order to display those on home
  const fetchIncompleteLists = async () => {
    setLoading(true);
    try {
      const { incomplete } = await fetchGroceryLists();
      setGrocery(incomplete);
    } catch (error) {
      console.error('Error fetching incomplete lists: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncompleteLists();
  }, []);

  // function to display correct text
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'inter-bold': require('../../../assets/fonts/Inter_800ExtraBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  // fetches user's pantries to display on home
  useEffect(() => {
    if (!user) return; // Don't fetch if user is null

    fetchPantries(user)
      .then(setPantries)
      .catch((error) => {
        console.error('Error fetching pantries:', error);
      });
  }, [user]); // Re-run when user changes

  // fetches user's username to display on home
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setUsername(userSnap.data().username);
          } else {
            console.warn('User document does not exist.');
          }
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      } else {
        setUsername('');
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Function to update recent pages
  const updateRecentPages = (newPage: string) => {
    setRecentPages(prevPages => {
      // Remove the new page if it already exists in the list
      const filteredPages = prevPages.filter(page => page !== newPage);
      // Add the new page to the beginning
      const updatedPages = [newPage, ...filteredPages];
      // Keep only the last 3 pages
      return updatedPages.slice(0, 3);
    });
  };

  // Update recent pages when pathname changes
  useEffect(() => {
    if (pathname) {
      // Extract the page name from the path
      const pageName = pathname.split('/').pop() || '';
      // Format the page name for display
      const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      updateRecentPages(formattedPageName);
    }
  }, [pathname]);

  // Function to format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h`;
    }
  };

  // Update time spent on previous page
  useEffect(() => {
    const interval = setInterval(() => {
      if (recentPages.length > 0) {
        const currentPage = recentPages[0];
        const timeSpent = Math.floor((Date.now() - lastPageChange) / 1000);
        setPageTimes(prev => ({
          ...prev,
          [currentPage]: timeSpent
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [recentPages, lastPageChange]);

  // Update lastPageChange when pathname changes
  useEffect(() => {
    setLastPageChange(Date.now());
  }, [pathname]);

  // Fetch family information
  useEffect(() => {
    const fetchFamilyInfo = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const familyQuerySnapshot = await getDocs(collection(db, 'family'));
        const foundFamily = familyQuerySnapshot.docs.find(docSnap => {
          const data = docSnap.data();
          return data.members?.includes(currentUser.uid);
        });

        if (foundFamily) {
          const data = foundFamily.data();
          setFamilyInfo({
            name: data.name || 'Best Family Ever',
            sharedPantries: data.kitchenItems?.length || 0,
            sharedLists: data.groceryLists?.length || 0
          });
        }
      } catch (error) {
        console.error('Error fetching family info:', error);
      }
    };

    fetchFamilyInfo();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Function to logout the user
  const handleLogout = async () => {
    try {
      await logout(); // Sign out the user
      router.replace('/login'); // Navigate back to the login screen
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // call the first four pantries and grocery lists from firebase
  const limitedPantries = pantries.slice(0, 4);
  const limitedGroceryLists = grocery.slice(0, 4);

  const isSmallScreen = screenWidth < 800; // checks display size

  // Returns everything to the display for the user to see
  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.container}>
        {/* Welcome Header and Logout */}
        <View style={styles.header}>
          <Text style={[styles.spoilTrackerText, { color: colors.onSurface }]}>
            Welcome, {username ? username : 'Loading...'}!
          </Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.btnLogout}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Pantry and Grocery Lists Container */}
        <View
          style={[
            styles.sectionsContainer,
            styles.rowLayout
          ]}
        >
          {/* Pantry Section */}
          <View
            style={[styles.listSection, isSmallScreen ? {} : styles.halfWidth]}
          >
            <Text style={[styles.spoilTrackerText, { color: 'black' }]}>
              Pantries
            </Text>
            <FlatList
              horizontal={!isSmallScreen} // Horizontal on larger screens
              data={limitedPantries} // Use the limited list of pantries
              renderItem={({ item }) => (
                <View style={styles.pantryCard}>
                  <Link href={`../PantryUI?id=${item.id}`} asChild>
                    <Pressable style={styles.pantryPressable}>
                      <Text style={[styles.pantryName]}>
                        {String(item.name)}
                      </Text>
                      <MaterialCommunityIcons
                        name="fridge" // Use "fridge" for a filled icon
                        size={80} // Icon size
                        color="black" // Use theme color for the icon
                      />
                    </Pressable>
                  </Link>
                </View>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.flatListContent}
              showsHorizontalScrollIndicator={false} // Hide the horizontal scrollbar
              numColumns={isSmallScreen ? 2 : undefined}
              columnWrapperStyle={
                isSmallScreen ? styles.columnWrapper : undefined
              }
            />
          </View>

          {/* Grocery Section */}
          <View
            style={[styles.listSection, isSmallScreen ? {} : styles.halfWidth]}
          >
            <Text style={[styles.spoilTrackerText, { color: 'black' }]}>
              Grocery Lists
            </Text>
            <FlatList
              horizontal={!isSmallScreen} // Horizontal on larger screens
              data={limitedGroceryLists} // Use the limited list of grocery lists
              renderItem={({ item }) => (
                <View style={styles.pantryCard}>
                  <Link href={`../ListUI?id=${item.id}`} asChild>
                    <Pressable style={styles.pantryPressable}>
                      <Text style={[styles.pantryName]}>
                        {String(item.name)}
                      </Text>
                      <MaterialCommunityIcons
                        name="cart-outline" // Use a grocery-related icon
                        size={80} // Icon size
                        color="black" // Use theme color for the icon
                      />
                    </Pressable>
                  </Link>
                </View>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.flatListContent}
              showsHorizontalScrollIndicator={false} // Hide the horizontal scrollbar
              numColumns={isSmallScreen ? 2 : undefined}
              columnWrapperStyle={
                isSmallScreen ? styles.columnWrapper : undefined
              }
            />
          </View>
        </View>

        <View
          style={[
            styles.sectionsContainer,
            styles.rowLayout
          ]}
        >
          {/* Nutrition Section */}
          <View
            style={[styles.listSection, isSmallScreen ? {} : styles.halfWidth]}
          >
            <Text style={[styles.spoilTrackerText, { color: 'black' }]}>
              Nutrition
            </Text>
            <CalorieProgress
              totalCalories={2000} // test data
              consumedCalories={1698} // test data
            />
          </View>

          {/*Recent Activity Section */}
          <View
            style={[styles.listSection, isSmallScreen ? {} : styles.halfWidth]}
          >
            <Text style={[styles.spoilTrackerText, {color: 'black'}]}>
              Recent Activity
            </Text>
            <View style={styles.recentActivityList}>
              {recentPages.map((page, index) => (
                <View key={index} style={styles.recentActivityItem}>
                  <View style={styles.recentActivityBox}>
                    <Text style={styles.recentActivityText}>
                      {index + 1}. {page}
                    </Text>
                  </View>
                  <Text style={styles.timeText}>
                    {formatTime(pageTimes[page] || 0)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Family Section */}
        <View
          style={[
            styles.sectionsContainer,
            styles.rowLayout
          ]}
        >
          <View
            style={[styles.listSection, isSmallScreen ? {} : styles.halfWidth]}
          >
            <Text style={[styles.spoilTrackerText, {color: 'black'}]}>
              Family
            </Text>
            <View style={styles.familyContainer}>
              {/* Family Info Section */}
              <View style={styles.familyInfoSection}>
                <View style={styles.infoBox}>
                  <View style={styles.infoItem}>
                    <Text style={[styles.label, {color: '#3568A6'}]}>Name:</Text>
                    <Text style={[styles.detail, {color: 'black'}]}>{familyInfo.name}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={[styles.label, {color: '#3568A6'}]}>Shared Pantries:</Text>
                    <Text style={[styles.detail, {color: 'black'}]}>{familyInfo.sharedPantries}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={[styles.label, {color: '#3568A6'}]}>Shared Lists:</Text>
                    <Text style={[styles.detail, {color: 'black'}]}>{familyInfo.sharedLists}</Text>
                  </View>
                </View>
              </View>

              {/* Family Members Section */}
              <View style={styles.familyMembersSection}>
                <View style={styles.memberTitleContainer}>
                  <Text style={[styles.memberTitle, {color: '#3568A6'}]}>Family Members:</Text>
                </View>
                <Text style={styles.memberText}>
                  You are not part of any family yet.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// style sheet for fonts and colors
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  spoilTrackerText: {
    fontSize: 24,
    fontFamily: 'inter-bold',
    color: '#4CAE4F',
    marginBottom: 10,
  },
  btnLogout: {
    backgroundColor: 'red',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 10,
    width: 90,
  },
  listSection: {
    margin: 10,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    height: 250,
  },
  flatListContent: {
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  pantryCard: {
    width: 150, // Fixed width for each pantry card
    height: 150, // Fixed height for each pantry card
    backgroundColor: '#FFF1DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderRadius: 8,
    marginHorizontal: 8, // Space between cards
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    flexDirection: 'column',
    borderColor: '#954535',
    borderWidth: 2,
  },
  pantryPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pantryName: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  // New styles for responsive layout
  sectionsContainer: {
    marginBottom: 24,
  },
  rowLayout: {
    flexDirection: 'row', // Side by side on larger screens
    justifyContent: 'space-between', // Add space between sections
  },
  listsection: {
    marginBottom: 24,
  },
  columnLayout: {
    flexDirection: 'column', // Stacked on smaller screens
  },
  halfWidth: {
    width: '48%',
  },
  recentActivityList: {
    marginTop: 10,
  },
  recentActivityItem: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentActivityBox: {
    backgroundColor: '#4CAE4F',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: '70%',
  },
  recentActivityText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  timeText: {
    marginLeft: 10,
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    width: '90%',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoItem: {
    marginBottom: 10,
    width: '100%',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  detail: {
    fontSize: 18,
    marginTop: 5,
  },
  familyContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  familyInfoSection: {
    flex: 1,
    paddingRight: 20,
    height: '100%',
  },
  familyMembersSection: {
    flex: 1,
    paddingLeft: 20,
    height: '100%',
  },
  memberTitleContainer: {
    marginBottom: 10,
  },
  memberTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberText: {
    fontStyle: 'italic',
    fontSize: 16,
    color: 'black',
  },
});