import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { useRouter, Link } from 'expo-router';
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
import { doc, getDoc } from 'firebase/firestore'; // imports user information from firestore
import { onAuthStateChanged, getAuth } from 'firebase/auth'; // gets authentication from firebase
import { fetchPantries } from '../../../src/utils/pantryUtils'; // calls fetchpantries to display on home
import { fetchGroceryLists } from '../../../src/utils/groceryUtils'; // calls fetchgrocerylists to display on home
import { MaterialCommunityIcons } from '@expo/vector-icons'; // for fridge icon
import CalorieProgress from '../../../components/calorieProgress'; // // calls calorieprogress to display on home
import SearchSuggestionsComponent from '@/components/searchBar';
import CommunityBoard from '@/components/Community/CommunityBoard';

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
      <View style={styles.mainContent}>
        {/* Welcome Header and Logout */}
        <SearchSuggestionsComponent></SearchSuggestionsComponent>
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
            isSmallScreen ? styles.columnLayout : styles.rowLayout,
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

        {/* Nutrition Section */}
        <View
          style={[
            styles.sectionsContainer,
            isSmallScreen ? {} : styles.halfWidth,
          ]}
        >
          <Text style={[styles.spoilTrackerText, { color: colors.onSurface }]}>
            Nutrition
          </Text>
          <CalorieProgress
            totalCalories={2000} // test data
            consumedCalories={1698} // test data
          />
        </View>
      </View>
      <CommunityBoard></CommunityBoard>
    </ScrollView>
  );
}

// style sheet for fonts and colors
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexGrow: 1,
    padding: 8,
    paddingHorizontal: 200,
    minWidth: 1000
  },
  mainContent: {
    flex: 1,                       
    marginRight: 40,              
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
    width: '48%', // Each section takes up 48% of the width on larger screens
  },
});
