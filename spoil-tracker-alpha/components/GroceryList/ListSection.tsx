import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Modal, Pressable, Alert, TouchableOpacity, Animated } from 'react-native';
import { deleteDoc, doc } from 'firebase/firestore'; // Import Firestore delete function
import { db } from '../../services/firebaseConfig'; // Firebase db import
import { GroceryList } from '@/components/GroceryList/GroceryListService';
import  ListButton  from '@/components/GroceryList/ListButton';

type ListSectionProps = {
  title: string;
  lists: GroceryList[];
  fetchLists: () => void;
};

/**
 * ListSection component displaying categorized lists.
 * Dynamically adjusts dimensions based on screen size.
 */
const ListSection = ({ title, lists, fetchLists }: ListSectionProps) => {
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height); // Get initial screen height
  const screenWidth = Dimensions.get('window').width; // Get screen width

  // Calculate width dynamically based on the screen size
  const listSectionWidth = screenWidth * 0.4; // 80% of the screen width
  const listSectionHeight = screenHeight * 0.5; // 20% of the screen height

  // Update the height when the screen size changes (e.g., on orientation change)
  useEffect(() => {
    const onChange = () => {
      setScreenHeight(Dimensions.get('window').height); // Update height on screen size change
    };

    // Add event listener for screen dimension changes
    const subscription = Dimensions.addEventListener('change', onChange);

    // Cleanup the event listener when the component unmounts
    return () => {
      subscription.remove();
    };
  }, []);

  const handleDelete = async (listId: string) => {
    console.log(`Attempting to delete list: ${listId}`);
    try {
      await deleteDoc(doc(db, 'grocery_lists', listId));
      console.log('Delete successful!');
      // You can call fetchLists here if needed to update the list after deletion.
    } catch (error) {
      console.error('Error deleting list: ', error);
      Alert.alert('Error', 'There was an error deleting the list.');
    }
    fetchLists();
  };

  return (
    <View style={[styles.listSection, { width: listSectionWidth, height: listSectionHeight }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView style={styles.scrollView} showsHorizontalScrollIndicator={false}>
        {lists.map((list) => (
          <ListButton key={list.id} id={list.id} onDelete={handleDelete} />
        ))}
      </ScrollView>
    </View>
  );
};

export default ListSection;

const styles = StyleSheet.create({
  listSection: {
    margin: 10,
    minWidth: 350,
    backgroundColor: '#e2e6ea',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignSelf: 'center', // Ensures that the ListSection is centered
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
    fontFamily: 'inter-bold',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#94D3FF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row', // Align items horizontally
  },
  icon: {
    marginRight: 10, // Space between icon and text
  },
  textContainer: {
    flex: 1, // This allows the text to take up remaining space and stay centered
    alignItems: 'center', // Ensures the text is centered
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'inter-bold',
    color: 'white',
  },
  dropdown: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginTop: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  dropdownContent: {
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  buttonsContainer: { 
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    marginRight: 10, 
  }, 
  viewButton: {
    flex: 1,
    width: 110
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#D9534F', // Red for delete
    width: 110,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'green', // Light gray for cancel
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  rowContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    justifyContent: 'flex-start', 
    paddingVertical: 5, 
  }, 
  dropdownTextContainer: { 
    flex: 1, 
    alignItems: 'flex-start', 
  }, 
});
