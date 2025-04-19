import React, { useContext, useState } from 'react';
import { Modal, TextInput, Pressable, View, Text, StyleSheet } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useAuth } from "@/services/authContext"; 
import { 
  createGroceryList
} from '@/components/GroceryList/GroceryListService';
import {
  getAccountByOwnerID
} from '@/components/Account/AccountService';
// Type definition for component props
type CreateListModalProps = {
  visible: boolean; // Determines whether the modal is visible
  onClose: () => void; // Function to close the modal
  fetchLists: () => Promise<void>
};

/**
 * Modal component for creating a new grocery list.
 * Allows users to enter a list name and save it to Firestore.
 */
const CreateListModal = ({
  visible,
  onClose,
  fetchLists,
}: CreateListModalProps) => {
  const [newListName, setNewListName] = useState('');
  const { user } = useAuth();
  const id = user?.uid;

  if (id) {
    console.log("[in List Modal] User UID:", id);
  } else {
    console.log("No user is logged in.");
    return;
  }
  
  const handleCreateList = async () => {
    
    try {
      const account = await getAccountByOwnerID(id);
      await createGroceryList(account.id, newListName);
      onClose();
      setNewListName('');
      fetchLists();
    } catch (err: any) {
      alert(err);
    }
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter New List Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter list name..."
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
        fontFamily: 'inter-bold',
        fontSize: 18,
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
