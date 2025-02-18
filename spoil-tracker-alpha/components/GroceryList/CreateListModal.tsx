import React, { useContext, useState } from 'react';
import { Modal, TextInput, Pressable, View, Text, StyleSheet } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useAuth } from "@/services/authContext"; 
import { 
  createGroceryList
} from '@/components/GroceryList/GroceryListService';

// Type definition for component props
type CreateListModalProps = {
  visible: boolean; // Determines whether the modal is visible
  onClose: () => void; // Function to close the modal
  fetchLists: () => void; // Function to refresh the list of grocery lists after creation
};

/**
 * Modal component for creating a new grocery list.
 * Allows users to enter a list name and save it to Firestore.
 */
const CreateListModal = ({ visible, onClose, fetchLists }: CreateListModalProps) => {
  const [newListName, setNewListName] = useState('');
  const { user } = useAuth();
  
  const handleCreateList = async () => {
    
    if (user) {
      try {
        const newList = await createGroceryList(user.uid, newListName);
        fetchLists(); // refresh the list in the parent component
        onClose();
        setNewListName('');

      } catch (err: any) {
        alert(err);
      }
    }
    else { 
      alert("Not logged in.");
      return;
    }
  }

  /** 

   * Handles the creation of a new grocery list in Firestore.

  const createNewList = async () => {
    // Validate input to ensure a name is entered
    if (!newListName.trim()) {
      alert('Please enter a valid list name');
      return;
    }

    // Get the current user
    const user = getAuth().currentUser;

    if (!user) {
      alert('User is not logged in');
      return;
    }

    try {
      // Add new list to Firestore under the 'grocery_lists' collection
      await addDoc(collection(db, 'grocery_lists'), {
        name: newListName,
        owner_id: user.uid,  // Store the user ID for reference
        created: new Date().toISOString(), // Store creation timestamp
        last_opened: new Date().toISOString(), // Initial last opened timestamp
        family: false, // Default: not a shared family list
        shared: false, // Default: not shared with others
        description: 'A newly made list. Edit the description by clicking on this field!', // Default description
        completed: false, // Default: list is incomplete
        items: [], // Default: empty list of items
      });

      // Clear the input field and refresh the list display
      setNewListName('');
      fetchLists(); // Refresh the list after creation
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error creating new list: ', error);
    }
  };
  */

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter New List Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter list name:"
            value={newListName}
            onChangeText={setNewListName}
          />
          <View style={styles.modalButtons}>
            <Pressable style={[styles.modalButton, { backgroundColor: '#2196F3' }]} onPress={handleCreateList}>
              <Text style={styles.modalButtonText}>Create</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: '#FF5252' }]}
              onPress={() => {
                setNewListName('');
                onClose();
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateListModal;

const styles = StyleSheet.create({
    input: {
        borderBottomWidth: 1,
        borderColor: '#333',
        marginBottom: 20,
        width: '100%',
        paddingVertical: 8,
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
