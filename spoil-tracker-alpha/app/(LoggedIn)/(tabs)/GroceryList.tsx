import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Dimensions, 
  Pressable, 
  ActivityIndicator, 
  TextInput, 
  ScrollView 
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import ListSection from '../../../components/GroceryList/ListSection';
import CreateListModal from '@/components/GroceryList/CreateListModal';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import {
  GroceryList,
  fetchAllGroceryLists
} from '@/components/GroceryList/GroceryListService';
import {
  getAccountByOwnerID,
  getCustomItemsFromAccount
} from '@/components/Account/AccountService';
import CustomItemsMenu from '@/components/Food/CustomItems';
import { useTheme } from 'react-native-paper'; // allows for dark mode
import { useAuth } from '@/services/authContext';

// Get screen width for responsive design
const SCREEN_WIDTH = Dimensions.get('window').width;

// Sorting options for lists
const SORT_OPTIONS = [
  { label: 'Alphabetical', value: 'alphabetical' }
]

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

/**
 screen component for displaying a user's grocery lists
 allows filtering, sorting, and list creation
 */
const ButtonListScreen = () => {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [completeLists, setCompleteLists] = useState<GroceryList[]>([]);
  const [incompleteLists, setIncompleteLists] = useState<GroceryList[]>([]);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortCriteria, setSortCriteria] = useState('alphabetical');
  const [searchQuery, setSearchQuery] = useState('');

  // fetch just custom items
  const fetchCustomItems = useCallback(async () => {
    if (!user) return;
    try {
      const account = await getAccountByOwnerID(user.uid);
      const items = await getCustomItemsFromAccount(account.id);
      setCustomItems(items);
      console.log('Custom Items refreshed:', items);
    } catch (err) {
      console.error('Error fetching custom items:', err);
    }
  }, [user]);

  // fetch both grocery‑lists and custom items
  const fetchLists = async () => {
    setLoading(true);
    if (!user) {
      alert('User is not logged in');
      setLoading(false);
      return;
    }

    try {
      const account = await getAccountByOwnerID(user.uid);

      // still populate both in one go
      await fetchCustomItems();

      const allLists = await fetchAllGroceryLists(account.id);
      const complete: GroceryList[] = [];
      const incomplete: GroceryList[] = [];

      allLists.forEach((l: GroceryList) => {
        if (l.isComplete) complete.push(l);
        else incomplete.push(l);
      });

      setCompleteLists(complete);
      setIncompleteLists(incomplete);
    } catch (err) {
      console.error('Error fetching grocery lists:', err);
    } finally {
      setLoading(false);
    }
  };

  // on component mount: fetch everything + watch for screen‑size changes
  useEffect(() => {
    fetchLists();

    const dimsSub = Dimensions.addEventListener('change', () => {
      setScreenWidth(Dimensions.get('window').width);
    });

    return () => {
      dimsSub.remove();
    };
  }, [fetchCustomItems]);

  // also refresh custom items whenever this screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchCustomItems();
    }, [fetchCustomItems])
  );

  // Determine if the screen width is considered small
  const isSmallScreen = screenWidth < 800;

  /**
   sorts lists based on the selected sorting criteria
   @param {Array} lists - The list of grocery lists to be sorted
   @returns {Array} - Sorted list.
   */
   const sortLists = (lists: GroceryList[]) => {
    if (sortCriteria === 'alphabetical') {
      return lists.sort((a, b) => a.grocerylist_name.localeCompare(b.grocerylist_name));
    }
    return lists; // Default no sort (you could add more sorting criteria here)
  };
  
  /**
   * Filters lists based on the user's search query.
   * @param {GroceryList[]} lists - The list of grocery lists to filter
   * @returns {GroceryList[]} - Filtered list
   */
  const filterLists = (lists: GroceryList[]) => {
    return lists.filter(list =>
      list.grocerylist_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Sorted and filtered lists
  const sortedcompleteLists = sortLists(filterLists(completeLists));
  const sortedIncompleteLists = sortLists(filterLists(incompleteLists));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        style={styles.scrollView}
      >
        <Text style={[styles.title, {color: "#4CAE4F", fontSize: 40}]}>Inventory</Text>

        <View style={styles.customItemsContainer}>
          <CustomItemsMenu customItems={customItems} onItemsChange={fetchLists} />
        </View>

        <View style={styles.groceryListsContainer}>
          <Text style={[styles.title]}>Grocery Lists</Text>
          {/* Dropdown for sorting */}
          <View style={styles.sortContainer}>
            <Text style={[styles.sortText, { color: colors.text }]}>
              Sort By:
            </Text>
            <Dropdown
              style={styles.dropdown}
              data={SORT_OPTIONS}
              labelField="label"
              valueField="value"
              value={sortCriteria}
              maxHeight={300}
              onChange={(item) => setSortCriteria(item.value)}
            />
          </View>

          {/* Search Bar right below the Sort Dropdown */}
          <TextInput
            style={styles.searchBar}
            placeholder="Search lists..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2196F3"
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={[styles.contentContainer, isSmallScreen ? styles.columnLayout : styles.rowLayout]}>
              {/* complete Lists Section */}
              <ListSection title="Complete Lists" lists={sortedcompleteLists} fetchLists={fetchLists} />

              {/* Incomplete Lists Section */}
              <ListSection
                title="Incomplete Lists"
                lists={sortedIncompleteLists}
                fetchLists={fetchLists}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create List Modal */}
      <CreateListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        fetchLists={fetchLists}
      />

      {/* Floating Button */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.floatingButton}
      >
        <AntDesign name="plus" size={28} color="white" />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  scrollView: {
    width: '100%', // Ensure ScrollView spans the full width
  },
  scrollViewContent: {
    flexGrow: 1, // Ensures the content stretches to take full space
    alignItems: 'center', // Centers content horizontally
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 30,
    fontFamily: 'inter-bold',
    color: '#2196F3',
    marginVertical: 15,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  sortText: {
    fontSize: 16,
    marginRight: 10,
  },
  picker: {
    height: 40,
    width: 120, // Smaller width for dropdown
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  searchBar: {
    minWidth: 300,
    width: '35%',
    height: 40,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginTop: 10, // Space between the sort dropdown and the search bar
  },
  contentContainer: {
    flex: 1,
  },
  columnLayout: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  rowLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000, // Ensure it's above other UI elements
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.7,
    backgroundColor: '#f0f0f0',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#d9534f',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: 'white',
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  customItemsContainer: {
    alignItems: "center",
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: "88%",
    margin: 20
  },
  groceryListsContainer: {
    alignItems: "center",
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    width: "88%",
    shadowRadius: 5,
    margin: 20
  }
});

export default ButtonListScreen;
