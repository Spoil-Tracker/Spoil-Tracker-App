import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import ListSection from '../../../components/PListSection';
import CreateListModal from '../../../components/GroceryList/CreateListModal';
import { db, auth } from '../../../services/firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from 'react-native-paper'; // allows for dark mode contributed by Kevin
import {
  fetchPantries,
  createNewPantry,
  sortLists,
  filterLists,
} from '../../../src/utils/pantryUtils';

// Sorting options for lists
const SORT_OPTIONS = [
  { label: 'Alphabetical', value: 'alphabetical' },
  { label: 'Recently Viewed', value: 'recent' }, // New option by Kevin
];

const ButtonListScreen = () => {
  const [pantries, setPantries] = useState<any[]>([]);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [newPantryName, setNewPantryName] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // User input for filtering lists
  const [sortCriteria, setSortCriteria] = useState('alphabetical'); // Current sort selection
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(Boolean); // fixed loading by Kevin

  // Fetch pantries
  const fetchPantryList = async () => {
    setLoading(true);
    try {
      const data = await fetchPantries();
      setPantries(data);
    } catch (error) {
      console.error('Error fetching pantries: ', error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchPantryList();
    const subscription = Dimensions.addEventListener('change', () => {
      setScreenWidth(Dimensions.get('window').width);
    });
    return () => subscription.remove();
  }, []);

  // Handle creating a new pantry
  const handleCreateNewPantry = async () => {
    try {
      await createNewPantry(newPantryName);
      setModalVisible(false);
      setNewPantryName('');
      await fetchPantryList();
    } catch (error) {
      alert('Error creating pantry: ' + error);
    }
  };

  const sortedPantry = sortLists(
    filterLists(pantries, searchQuery),
    sortCriteria
  );

  const isSmallScreen = screenWidth < 800;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        style={styles.scrollView}
      >
        <Text style={[styles.title, { color: colors.onSurface }]}>
          {username ? username : 'Loading...'}'s Pantries
        </Text>

        {/* Dropdown for sorting */}
        <View style={styles.sortContainer}>
          <Text style={[styles.sortText, { color: colors.onSurface }]}>
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

        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search pantries..."
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
            <ListSection
              title="Personal Pantries"
              lists={sortedPantry}
              fetchLists={fetchPantryList}
            />
            {/* New Section for Shared Pantries */}
            <ListSection
              title="Shared Pantries"
              lists={sortedPantry}
              fetchLists={fetchPantryList}
            />
          </View>
        )}
      </ScrollView>

      {/* Floating Button to Open Modal */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.floatingButton}
      >
        <AntDesign name="plus" size={28} color="white" />
      </Pressable>

      {/* Create Pantry Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter New Pantry Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pantry name"
              value={newPantryName}
              onChangeText={setNewPantryName}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#2196F3' }]}
                onPress={handleCreateNewPantry}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#FF5252' }]}
                onPress={() => {
                  setModalVisible(false);
                  setNewPantryName('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ButtonListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF9F2',
    paddingTop: 20,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  contentContainer: {
    flex: 1,
  },
  sortText: {
    fontSize: 16,
    marginRight: 10,
  },
  scrollViewContent: {
    flexGrow: 1, // Ensures the content stretches to take full space
    alignItems: 'center', // Centers content horizontally
    paddingHorizontal: 10,
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
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    fontFamily: 'inter-bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  columnLayout: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  rowLayout: {
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  button: {
    backgroundColor: '#4CAE4F',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#347736',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: 'white',
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
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
  input: {
    borderBottomWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
    width: '100%',
    paddingVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: 'white',
  },
});
