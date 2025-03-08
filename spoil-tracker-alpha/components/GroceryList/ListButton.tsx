import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, Modal, StyleSheet, Pressable, TouchableOpacity, 
  Animated, TextInput 
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  deleteGroceryList, 
  fetchGroceryListByID, 
  updateGroceryListName 
} from '@/components/GroceryList/GroceryListService';

/**
 * Props for the ListButton component.
 * @property id - The ID of the grocery list.
 * @property onDelete - Callback function invoked when the list is deleted.
 */
type ListButtonProps = {
  id: string;
  onDelete: (listId: string) => void;
};

/**
 * ListButton component displays a button for a grocery list.
 *
 * It fetches the grocery list details by its ID and renders a header with the list name,
 * an edit button, and an expandable dropdown with additional details (e.g., creation date,
 * last opened date, item count, and description). It also provides modals for confirming deletion
 * and editing the list name.
 *
 * @param {ListButtonProps} props - Component properties.
 * @returns A React element that renders the list button and its dropdown.
 */
const ListButton: React.FC<ListButtonProps> = ({ id, onDelete }) => {
  // Local state for controlling the dropdown visibility.
  const [dropdownVisible, setDropdownVisible] = useState(false);
  // Local state to control delete confirmation modal visibility.
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Local state to control edit modal visibility.
  const [showEditModal, setShowEditModal] = useState(false);
  // State to hold the new list name during editing.
  const [newName, setNewName] = useState('');
  // State to store the fetched grocery list object.
  const [list, setList] = useState<any>(null);
  // Animated value for controlling dropdown height.
  const dropdownHeight = useRef(new Animated.Value(0)).current;

  /**
   * useEffect to fetch grocery list details by ID when the component mounts or when the id changes.
   */
  useEffect(() => {
    (async () => {
      const fetchedList = await fetchGroceryListByID(id);
      if (fetchedList) {
        setList(fetchedList);
      }
    })();
  }, [id]);

  // If no list is available, render nothing (or optionally a loader).
  if (!list) {
    return null; // Optionally render a loader
  }

  /**
   * Toggles the visibility of the dropdown.
   * Animates the dropdown height to either expand (150) or collapse (0).
   */
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    Animated.timing(dropdownHeight, {
      toValue: dropdownVisible ? 0 : 150,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Formats an ISO date string into a more user-friendly format.
   * @param isoString - An ISO formatted date string.
   * @returns A formatted date string (e.g., "January 1, 2020").
   */
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Header container: remains fixed so the edit button doesn't shift */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={toggleDropdown} style={styles.mainButton}>
          <Ionicons name="person" size={20} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>{list.grocerylist_name}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            setNewName(list.grocerylist_name);
            setShowEditModal(true);
          }} 
          style={styles.editButton}
        >
          <Ionicons name="pencil" size={20} color="white"/>
        </TouchableOpacity>
      </View>

      {/* Dropdown Content */}
      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        <View style={styles.dropdownContent}>
          <View style={styles.rowContainer}>
            <View style={styles.buttonsContainer}>
              <View>
                <Link 
                  href={`../ListUI?id=${list.id}`} 
                  style={[styles.button, styles.viewButton]}
                >
                  <Text style={styles.buttonText}>View</Text>
                </Link>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => setShowDeleteModal(true)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.dropdownTextContainer}>
              <Text>
                <Text style={styles.dropdownTextTitle}>Created: </Text>
                <Text style={styles.dropdownText}>{formatDate(list.createdAt)}</Text>
              </Text>
              <Text>
                <Text style={styles.dropdownTextTitle}>Last Opened: </Text>
                <Text style={styles.dropdownText}>{formatDate(list.last_opened)}</Text>
              </Text>
              <Text>
                <Text style={styles.dropdownTextTitle}>Item Amount: </Text>
                <Text style={styles.dropdownText}>{list.grocery_list_items.length}</Text>
              </Text>
              <Text>
                <Text style={styles.dropdownTextTitle}>Description: </Text>
                <Text style={styles.dropdownText}>{list.description}</Text>
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent={true}
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Are you sure you want to delete this list?
            </Text>
            <View style={styles.modalButtonsContainer}>
              <Pressable 
                onPress={() => setShowDeleteModal(false)} 
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={async () => {
                  await deleteGroceryList(list.id);
                  setShowDeleteModal(false);
                  onDelete(list.id);
                }} 
                style={[styles.modalButton, styles.deleteButtonModal]}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        transparent={true}
        visible={showEditModal}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit List Name</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new list name"
            />
            <View style={styles.modalButtonsContainer}>
              <Pressable 
                onPress={() => setShowEditModal(false)} 
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={async () => {
                  await updateGroceryListName(list.id, newName);
                  setList({ ...list, grocerylist_name: newName });
                  setShowEditModal(false);
                }} 
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ListButton;

/**
 * Styles for the ListButton component.
 */
const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    position: 'relative',
  },
  icon: {
    marginRight: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#94D3FF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
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
    flexDirection: 'row',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'inter-bold',
    color: 'white',
  },
  viewButton: {
    flex: 1,
    width: 110,
    marginBottom: 5,
  },
  dropdownContent: {
    paddingVertical: 10,
  },
  rowContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    justifyContent: 'flex-start', 
    paddingVertical: 5, 
  },
  buttonsContainer: { 
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    marginRight: 10, 
  },
  dropdown: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginTop: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  dropdownTextContainer: { 
    flex: 1, 
    alignItems: 'flex-start', 
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  }, 
  dropdownTextTitle: {
    fontFamily: 'inter-bold',
  },
  editButton: {
    padding: 5,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    marginLeft: 10,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  deleteButton: {
    backgroundColor: '#D9534F',
    width: 110,
    marginBottom: 5,
  },
  deleteButtonModal: {
    backgroundColor: '#D9534F',
  },
  cancelButton: {
    backgroundColor: 'green',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  
});