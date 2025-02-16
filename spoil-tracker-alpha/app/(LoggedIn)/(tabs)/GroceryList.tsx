import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import ListSection from '../../../components/ListSection';
import CreateListModal from '../../../components/CreateListModal';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from 'react-native-paper'; // allows for dark mode

// Get screen width for responsive design
const SCREEN_WIDTH = Dimensions.get('window').width;

// Sorting options for lists
const SORT_OPTIONS = [{ label: 'Alphabetical', value: 'alphabetical' }];

/**
 screen component for displaying a user's grocery lists
 allows filtering, sorting, and list creation
 */
const ButtonListScreen = () => {
  const [completedLists, setCompletedLists] = useState<string[]>([]);
  const [incompleteLists, setIncompleteLists] = useState<string[]>([]);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortCriteria, setSortCriteria] = useState('alphabetical'); // Current sort selection
  const [searchQuery, setSearchQuery] = useState(''); // User input for filtering lists
  const { colors } = useTheme();

  /**
   fetches the user's grocery lists from Firestore
   lists are categorized into completed and incomplete
   */
  const fetchLists = async () => {
    setLoading(true);
    try {
      // Get the currently logged-in user
      const auth = getAuth();
      const currentUser = auth.currentUser;

      // Check if the user is logged in
      if (!currentUser) {
        alert('User is not logged in');
        setLoading(false);
        return;
      }

      // Create a query to fetch grocery lists where user_id matches the current user
      const groceryListsQuery = query(
        collection(db, 'grocery_lists'),
        where('owner_id', '==', currentUser.uid) // Filter by user_id
      );

      const querySnapshot = await getDocs(groceryListsQuery);
      const completed = [];
      const incomplete = [];

      // Process fetched lists
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data?.name) {
          // Format date helper function
          const formatDate = (isoString: string) => {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
          };

          // Categorize lists based on completion status
          if (data.completed) {
            completed.push({
              id: doc.id,
              name: String(data.name),
              completed: data.completed,
              created: data.created ? formatDate(data.created) : 'Unknown Date',
              description: data.description,
            });
          } else {
            incomplete.push({
              id: doc.id,
              name: String(data.name),
              completed: data.completed,
              created: data.created ? formatDate(data.created) : 'Unknown Date',
              description: data.description,
            });
          }
        }
      });

      // Set the lists for completed and incomplete items
      // Update state with fetched lists
      setCompletedLists(completed);
      setIncompleteLists(incomplete);
    } catch (error) {
      console.error('Error fetching grocery lists: ', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   fetch lists on component mount and screen size change.
   */
  useEffect(() => {
    fetchLists();
    const subscription = Dimensions.addEventListener('change', () => {
      setScreenWidth(Dimensions.get('window').width);
    });

    // Listen for screen dimension changes
    return () => {
      subscription.remove();
    };
  }, []);

  /**
   fetch lists when the screen comes into focus
   */
  useFocusEffect(
    React.useCallback(() => {
      fetchLists();
    }, [])
  );

  // Determine if the screen width is considered small
  const isSmallScreen = screenWidth < 800;

  /**
   sorts lists based on the selected sorting criteria
   @param {Array} lists - The list of grocery lists to be sorted
   @returns {Array} - Sorted list.
   */
  const sortLists = (lists) => {
    if (sortCriteria === 'alphabetical') {
      return lists.sort((a, b) => a.name.localeCompare(b.name));
    }
    return lists; // Default no sort (you could add more sorting criteria here)
  };

  /**
   filters lists based on the user's search query
   @param {Array} lists - The list of grocery lists to filter
   @returns {Array} - Filtered list
   */
  const filterLists = (lists) => {
    return lists.filter((list) =>
      list.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Sorted and filtered lists
  const sortedCompletedLists = sortLists(filterLists(completedLists));
  const sortedIncompleteLists = sortLists(filterLists(incompleteLists));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        style={styles.scrollView}
      >
        <Text style={styles.title}>Grocery Lists</Text>

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
          <View
            style={[
              styles.contentContainer,
              isSmallScreen ? styles.columnLayout : styles.rowLayout,
            ]}
          >
            {/* Completed Lists Section */}
            <ListSection
              title="Completed Lists"
              lists={sortedCompletedLists}
              fetchLists={fetchLists}
            />

            {/* Incomplete Lists Section */}
            <ListSection
              title="Incomplete Lists"
              lists={sortedIncompleteLists}
              fetchLists={fetchLists}
            />
          </View>
        )}

        {/* Create List Modal */}
        <CreateListModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          fetchLists={fetchLists}
        />
      </ScrollView>

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
    fontSize: 22,
    fontFamily: 'inter-bold',
    color: '#2196F3',
    marginBottom: 10,
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
});

export default ButtonListScreen;
