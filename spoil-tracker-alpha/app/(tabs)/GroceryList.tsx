import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig'; // Import your existing Firebase setup
import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';


const ButtonListScreen = () => {
  const [completedLists, setCompletedLists] = useState<string[]>([]);
  const [incompleteLists, setIncompleteLists] = useState<string[]>([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Fetch lists from Firestore
  const fetchLists = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'grocery_lists'));
        const completed = [];
        const incomplete = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data && data.name) {
              if (data.completed) {
                completed.push({ id: doc.id, name: String(data.name) });
              } else {
                incomplete.push({ id: doc.id, name: String(data.name) });
              }
            }
          });
          

      setCompletedLists(completed);
      setIncompleteLists(incomplete);
    } catch (error) {
      console.error('Error fetching grocery lists: ', error);
    }
  };

  const createNewList = async () => {
    if (!newListName.trim()) {
      alert('Please enter a valid list name');
      return;
    }

    try {
      const newListRef = await addDoc(collection(db, 'grocery_lists'), {
        name: newListName,
        user_id: 0,
        created: new Date().toISOString(),
        description: 'Edit the grocery list description!',
        completed: false,
        items: [],
      });

      console.log('New list created with ID: ', newListRef.id);

      setModalVisible(false);
      setNewListName('');
      fetchLists();
    } catch (error) {
      console.error('Error creating new list: ', error);
    }
  };

  useEffect(() => {
    fetchLists(); // Fetch data on mount

    const onChange = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    Dimensions.addEventListener('change', onChange);

    return () => {
    };
  }, []);

  const isSmallScreen = screenWidth < 800;

  useFocusEffect(() => {
    fetchLists();
  });

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.rowContainer,
          isSmallScreen ? styles.columnLayout : styles.rowLayout,
        ]}
      >
        {/* Completed Lists Section */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Completed Lists</Text>
          <ScrollView style={styles.scrollView}>
          {completedLists.map((list) => (
            <Link
                key={list.id}
                href={`../ListUI?id=${list.id}`}
                style={styles.button}
            >
                <Text style={styles.buttonText}>{String(list.name)}</Text>
            </Link>
            ))}
          </ScrollView>
        </View>

        {/* Incomplete Lists Section */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Incomplete Lists</Text>
          <ScrollView style={styles.scrollView}>
          {incompleteLists.map((list) => (
            <Link
                key={list.id}
                href={`../ListUI?id=${list.id}`}
                style={styles.button}
            >
            <Text style={styles.buttonText}>{String(list.name)}</Text>
          </Link>
        ))}

          </ScrollView>
        </View>
      </View>

      <View style={styles.floatingButton}>
        <Pressable onPress={() => setModalVisible(true)}>
          <AntDesign name="plus" size={24} color="white" />
        </Pressable>
      </View>

      {/* Modal for new list name */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
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
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#2196F3' }]}
                onPress={createNewList}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#FF5252' }]}
                onPress={() => {
                  setModalVisible(false);
                  setNewListName('');
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 800,
    paddingHorizontal: 20,
  },
  columnLayout: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  rowLayout: {
    justifyContent: 'space-between',
  },
  listSection: {
    width: 350,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    height: 250,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
    fontFamily: 'inter-bold'
  },
  scrollView: {
    flex: 1,
  },
  button: {
    backgroundColor: '#94D3FF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
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
