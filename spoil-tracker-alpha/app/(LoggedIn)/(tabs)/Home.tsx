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
  useWindowDimensions,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { useAuth } from '../../../services/authContext'; // Import the authentication context
import { useTheme, Text} from 'react-native-paper'; // Import useTheme and Text from react-native-paper
import { db, auth } from '../../../services/firebaseConfig'; // imports authentication
import { doc, getDoc, getDocs, collection } from 'firebase/firestore'; // imports user information from firestore
import { onAuthStateChanged, getAuth } from 'firebase/auth'; // gets authentication from firebase
import { fetchPantries } from '../../../src/utils/pantryUtils'; // calls fetchpantries to display on home
import { MaterialCommunityIcons } from '@expo/vector-icons'; // for fridge icon
import CalorieProgress from '../../../components/calorieProgress'; // // calls calorieprogress to display on home
import SearchSuggestionsComponent from '@/components/searchBar';
import CommunityBoard from '@/components/Community/CommunityBoard';
import { getAccountByOwnerID } from '@/components/Account/AccountService';
import { fetchAllGroceryLists } from '@/components/GroceryList/GroceryListService';
import { SafeAreaView } from 'react-native-safe-area-context';
import FdcSearch from '@/components/FDA_APISearch';
import MealSearch from '@/components/TheMealDB_API';

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
  const { width, height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'home' | 'community'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const [pageTimes, setPageTimes] = useState<Record<string, number>>({});
  const [lastPageChange, setLastPageChange] = useState<number>(Date.now());
  const [familyInfo, setFamilyInfo] = useState({
    name: '',
    sharedPantries: 0,
    sharedLists: 0
  });
  const [appleData, setAppleData] = useState<any>(null);
  const [bananaData, setBananaData] = useState<any>(null);
  const [orangeData, setOrangeData] = useState<any>(null);
  const [grapeData, setGrapeData] = useState<any>(null);
  const [appleJuiceData, setAppleJuiceData] = useState<any>(null);
  const [orangeJuiceData, setOrangeJuiceData] = useState<any>(null);
  const pathname = usePathname();

  // function to fetch incomplete lists in order to display those on home
  const fetchIncompleteLists = async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }
  
    try {
      // get the _array_ of lists
      const account = await getAccountByOwnerID(user.uid);
      const allLists = await fetchAllGroceryLists(account.id);
      // pull out only the ones that aren't complete
      const incomplete = allLists.filter((list: { isComplete: any; }) => !list.isComplete);
      console.log('incomplete lists:', incomplete);
      setGrocery(incomplete);
    } catch (error) {
      console.error('Error fetching incomplete lists:', error);
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

  useEffect(() => {
    const fetchFruitData = async () => {
      try {
        const foodSnapshot = await getDocs(collection(db, 'food_global'));
        const foods = foodSnapshot.docs.map(doc => doc.data());
        setAppleData(foods.find(item => item.food_name === 'Apple'));
        setBananaData(foods.find(item => item.food_name === 'Banana'));
        setOrangeData(foods.find(item => item.food_name === 'Orange'));
        setGrapeData(foods.find(item => item.food_name === 'Grapes'));
        setAppleJuiceData(foods.find(item => item.food_name === 'Apple Juice'));
        setOrangeJuiceData(foods.find(item => item.food_name === 'Orange Juice'));
      } catch (error) {
        console.error('Error fetching fruit data:', error);
      }
    };
    fetchFruitData();
  }, []);

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    // Fetch from Firestore food_global collection
    const foodSnapshot = await getDocs(collection(db, 'food_global'));
    const foods = foodSnapshot.docs.map(doc => doc.data());
    const results = foods.filter((item) =>
      item.food_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  };

  // Handle item click
  const handleItemPress = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

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

  const isSmallScreen = width < 1000; // checks display size

  // Returns everything to the display for the user to see
  // MOBILE LAYOUT
  if (isSmallScreen) {
    return (
      <SafeAreaView style={[styles.mobileContainer, { backgroundColor: colors.background }]}>        
        <View
          style={[
            styles.toggleBar,
            { borderBottomColor: colors.onSurface, backgroundColor: colors.surface },
          ]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === 'home' && {
                borderBottomColor: colors.primary,
                backgroundColor: `${colors.primary}20`,
              },
            ]}
            onPress={() => setActiveTab('home')}>
            <Text
              style={{
                color: activeTab === 'home' ? colors.primary : colors.onSurface,
                fontWeight: activeTab === 'home' ? '700' : '400',
              }}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === 'community' && {
                borderBottomColor: colors.primary,
                backgroundColor: `${colors.primary}20`,
              },
            ]}
            onPress={() => setActiveTab('community')}>
            <Text
              style={{
                color: activeTab === 'community' ? colors.primary : colors.onSurface,
                fontWeight: activeTab === 'community' ? '700' : '400',
              }}>
              Community
            </Text>
          </TouchableOpacity>
        </View>
        {activeTab === 'home' ? (
          <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: 100 }}>
            <SearchSuggestionsComponent />
            <View style={styles.header}>
              <Text style={[styles.spoilTrackerText, { color: '#4CAE4F' }]}>Welcome, {username || 'Loading...'}</Text>
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
                <Text style={[styles.spoilTrackerText, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
                  Pantries
                </Text>
                {isSmallScreen ? (
                  <FlatList
                    key="pantries-grid"
                    data={limitedPantries}
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
                    keyExtractor={item => item.id}
                    numColumns={2}                    // always 2 columns
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                  />
                ) : (
                  <FlatList
                    key="pantries-list"
                    data={limitedPantries}
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
                    keyExtractor={item => item.id}
                    horizontal                         // always horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                  />
                )}
              </View>

              {/* Grocery Section */}
              <View
                style={[styles.listSection, isSmallScreen ? {} : styles.halfWidth]}
              >
                <Text style={[styles.spoilTrackerText, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
                  Grocery Lists
                </Text>
                {isSmallScreen ? (
                  <FlatList
                    key="grocery-grid"
                    data={limitedGroceryLists}
                    renderItem={({ item }) => (
                      <View style={styles.pantryCard}>
                        <Link href={`../ListUI?id=${item.id}`} asChild>
                          <Pressable style={styles.pantryPressable}>
                            <Text style={[styles.pantryName]}>
                              {String(item.grocerylist_name)}
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
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                  />
                ) : (
                  <FlatList
                    key="grocery-list"
                    data={limitedGroceryLists}
                    renderItem={({ item }) => (
                      <View style={styles.pantryCard}>
                        <Link href={`../ListUI?id=${item.id}`} asChild>
                          <Pressable style={styles.pantryPressable}>
                            <Text style={[styles.pantryName]}>
                              {String(item.grocerylist_name)}
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
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                  />
                )}

              </View>
            </View>

            {/* Nutrition Section */}
            <View
              style={[
                styles.sectionsContainer,
                isSmallScreen ? {} : styles.halfWidth,
              ]}
            >
              <Text style={[styles.spoilTrackerText, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
                Nutrition
              </Text>
              <CalorieProgress
                totalCalories={2000} // test data
                consumedCalories={1698} // test data
              />
            </View>
            <FdcSearch></FdcSearch>
            <MealSearch></MealSearch>
          </ScrollView>
        ) : (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <CommunityBoard />
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView style={[styles.mainContent, {height: height - 125}]}>
        {/* Welcome Header and Logout */}
        <SearchSuggestionsComponent></SearchSuggestionsComponent>
        <View style={styles.header}>
          <Text style={[styles.spoilTrackerText, { color: '#4CAE4F' }]}>
            Welcome, {username ? username : 'Loading...'}!
          </Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.btnLogout}>Logout</Text>
          </TouchableOpacity>
        </View>
        {/* Search Bar */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchBarContainerSmall}>
            <View style={[styles.searchIconCircle, { backgroundColor: '#4CAE4F' }]}>
              <MaterialCommunityIcons name="magnify" size={24} color="white" />
            </View>
            <TextInput
              style={styles.searchInputSmall}
              placeholder="Product Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>
        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsDropdownBlock}>
            {searchResults.map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.searchResultItem} onPress={() => handleItemPress(item)}>
                <Text style={styles.searchResultText}>{item.food_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Item Details */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedItem && (
                <>
                  <Text style={styles.modalTitle}>{selectedItem.food_name}</Text>
                  {selectedItem.food_picture_url ? (
                    <Image
                      source={{ uri: selectedItem.food_picture_url }}
                      style={{ width: 50, height: 50, borderRadius: 5, alignSelf: 'center', marginBottom: 10 }}
                      resizeMode="cover"
                    />
                  ) : null}
                  <Text style={styles.modalDescription}>{selectedItem.description || 'No description available.'}</Text>
                  {/* Add more details as needed */}
                  <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeModalText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

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
            <Text style={[styles.spoilTrackerText, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
              Pantries
            </Text>
            {isSmallScreen ? (
              <FlatList
                key="pantries-grid"
                data={limitedPantries}
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
                keyExtractor={item => item.id}
                numColumns={2}                    // always 2 columns
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
              />
            ) : (
              <FlatList
                key="pantries-list"
                data={limitedPantries}
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
                keyExtractor={item => item.id}
                horizontal                         // always horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
              />
            )}
          </View>

          {/* Grocery Section */}
          <View
            style={[styles.listSection, isSmallScreen ? {} : styles.halfWidth]}
          >
            <Text style={[styles.spoilTrackerText, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
              Grocery Lists
            </Text>
            {isSmallScreen ? (
              <FlatList
                key="grocery-grid"
                data={limitedGroceryLists}
                renderItem={({ item }) => (
                  <View style={styles.pantryCard}>
                    <Link href={`../ListUI?id=${item.id}`} asChild>
                      <Pressable style={styles.pantryPressable}>
                        <Text style={[styles.pantryName]}>
                          {String(item.grocerylist_name)}
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
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
              />
            ) : (
              <FlatList
                key="grocery-list"
                data={limitedGroceryLists}
                renderItem={({ item }) => (
                  <View style={styles.pantryCard}>
                    <Link href={`../ListUI?id=${item.id}`} asChild>
                      <Pressable style={styles.pantryPressable}>
                        <Text style={[styles.pantryName]}>
                          {String(item.grocerylist_name)}
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
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
              />
            )}

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
            <Text style={[styles.spoilTrackerText, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
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
            <Text style={[styles.spoilTrackerText, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
              Recent Activity
            </Text>
            <View style={styles.recentActivityList}>
              {recentPages.map((page, index) => (
                <View key={index} style={styles.recentActivityItem}>
                  <View style={styles.recentActivityBox}>
                    <Text style={[styles.recentActivityText, { color: 'black' }]}>
                      {index + 1}. {page}
                    </Text>
                  </View>
                  <Text style={[styles.timeText, { color: 'black' }]}>
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
            <Text style={[styles.spoilTrackerText, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
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
            </View>
          </View>
        </View>

        {/* Produce Feed Section */}
        <View style={styles.produceFeedContainer}>
          <Text style={[styles.spoilTrackerText, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
            Produce Feed
          </Text>
          
          {/* Produce in Season Container */}
          <View style={styles.produceInSeasonContainer}>
            <Text style={[styles.produceInSeasonTitle, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
              Produce in Season
            </Text>
            <View style={styles.appleGrid}>
              <View style={styles.appleItem}>
                {appleData && (
                  <>
                    <Image
                      source={{ uri: appleData.food_picture_url }}
                      style={styles.appleImage}
                    />
                    <Text style={[styles.appleText, { color: 'black' }]}>Apple</Text>
                  </>
                )}
              </View>
              <View style={styles.appleItem}>
                {bananaData && (
                  <>
                    <Image
                      source={{ uri: bananaData.food_picture_url }}
                      style={styles.appleImage}
                    />
                    <Text style={[styles.appleText, { color: 'black' }]}>Banana</Text>
                  </>
                )}
              </View>
              <View style={styles.appleItem}>
                {orangeData && (
                  <>
                    <Image
                      source={{ uri: orangeData.food_picture_url }}
                      style={styles.appleImage}
                    />
                    <Text style={[styles.appleText, { color: 'black' }]}>Orange</Text>
                  </>
                )}
              </View>
              <View style={styles.appleItem}>
                {grapeData && (
                  <>
                    <Image
                      source={{ uri: grapeData.food_picture_url }}
                      style={styles.appleImage}
                    />
                    <Text style={[styles.appleText, { color: 'black' }]}>Grape</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Recommended Products Container */}
        <View style={styles.recommendedContainer}>
          <Text style={[styles.recommendedTitle, { color: '#4CAE4F', textAlign: 'center', fontWeight: 'bold' }]}>
            Recommended Products
          </Text>
          <View style={styles.juiceRow}>
            <View style={styles.juiceItem}>
              {appleJuiceData && (
                <>
                  <Image
                    source={{ uri: appleJuiceData.food_picture_url }}
                    style={styles.juiceImage}
                  />
                  <Text style={[styles.juiceText, { color: 'black' }]}>Apple Juice</Text>
                </>
              )}
            </View>
            <View style={styles.juiceItem}>
              {orangeJuiceData && (
                <>
                  <Image
                    source={{ uri: orangeJuiceData.food_picture_url }}
                    style={styles.juiceImage}
                  />
                  <Text style={[styles.juiceText, { color: 'black' }]}>Orange Juice</Text>
                </>
              )}
            </View>
          </View>
        </View>

        <FdcSearch></FdcSearch>
        <MealSearch></MealSearch>
      </ScrollView>
      <View style={styles.verticalDivider} />
      <SafeAreaView style={[styles.communityContainer, {height: height - 125 }]}>
      <CommunityBoard></CommunityBoard>
      </SafeAreaView>
    </View>
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
    backgroundColor: '#F4F9FA',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,              // ensures shadow is visible
    shadowColor: '#000',
    shadowOffset: { width: -3, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
    flex: 1,
    padding: 15              
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    width: '100%',
    gap: 8,
  },
  spoilTrackerText: {
    fontSize: 24,
    fontFamily: 'inter-bold',
    color: '#4CAE4F',
    marginBottom: 10,
  },
  headerWelcome: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
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
  communityContainer: {
    backgroundColor: '#F4F9FA',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,              // ensures shadow is visible
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
    paddingHorizontal: 10,
    paddingVertical: 2
  },
  verticalDivider: {
    width: 2.5,
    backgroundColor: '#ccc',    // or colors.onSurface
    // make it stretch to the container's full height
    alignSelf: 'stretch',
  },
  // MOBILE-ONLY TAB BAR
  toggleBar: {
    flexDirection: 'row',
    height: 50,
    borderBottomWidth: 1,
  },
  toggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  mobileContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  searchBarRow: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 0,
  },
  searchBarContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    width: 220,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchIconCircle: {
    backgroundColor: '#4CAE4F',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  searchInputSmall: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchResultsDropdownBlock: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    width: 220,
    alignSelf: 'center',
    padding: 0,
    marginTop: 0,
    zIndex: 10,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeModalButton: {
    backgroundColor: '#4CAE4F',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeModalText: {
    color: 'white',
    fontSize: 16,
  },
  recentActivityList: {
    marginTop: 10,
  },
  recentActivityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentActivityBox: {
    flex: 1,
  },
  recentActivityText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  familyContainer: {
    marginTop: 10,
  },
  familyInfoSection: {
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 16,
  },
  produceFeedContainer: {
    marginTop: 20,
  },
  produceInSeasonContainer: {
    marginTop: 10,
  },
  produceInSeasonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  appleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  appleItem: {
    width: '48%',
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  appleImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  appleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendedContainer: {
    marginTop: 20,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  juiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  juiceItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  juiceImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  juiceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
