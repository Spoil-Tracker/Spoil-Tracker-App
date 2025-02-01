import React, { useState } from 'react';
import { Modal, TextInput, Pressable, View, Text, StyleSheet } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';
import { getAuth } from 'firebase/auth';  // Import Firebase Auth

type CreateListModalProps = {
  visible: boolean;
  onClose: () => void;
  fetchLists: () => void;
};

const CreateListModal = ({ visible, onClose, fetchLists }: CreateListModalProps) => {
  const [newListName, setNewListName] = useState('');

  const createNewList = async () => {
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
      await addDoc(collection(db, 'grocery_lists'), {
        name: newListName,
        user_id: user.uid,  // Use the current user's uid
        created: new Date().toISOString(),
        description: 'A newly made list. Edit the description by clicking on this field!',
        completed: false,
        items: [],
      });

      setNewListName('');
      fetchLists();
      onClose();
    } catch (error) {
      console.error('Error creating new list: ', error);
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter New List Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter list name"
            value={newListName}
            onChangeText={setNewListName}
          />
          <View style={styles.modalButtons}>
            <Pressable style={[styles.modalButton, { backgroundColor: '#2196F3' }]} onPress={createNewList}>
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
