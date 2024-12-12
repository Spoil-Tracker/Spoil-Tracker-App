import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig'; // Import your existing Firebase setup
import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';

const ButtonListScreen = () => {
  const [pantries, setPantries] = useState<string[]>([]);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [newPantryName, setnewPantryName] = useState('');

  // Fetch lists from Firestore
  const fetchPantries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pantries_t'));
      const pant = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.name) {
          pant.push({ id: doc.id, name: String(data.name) });
        }
      });
      setPantries(pant);
    } catch (error) {
      console.error('Error fetching grocery lists: ', error);
    }
  };

  const createNewPantry = async () => {
    if (!newPantryName.trim()) {
      alert('Please enter a valid list name');
      return;
    }

    try {
      const newListId = uuidv4();
      const newListRef = await addDoc(collection(db, 'pantries_t'), {
        name: newPantryName,
        user_id: 0,
        created: new Date().toISOString(),
        description: 'Edit the pantry description!',
        item_amount: 0,
        sections: { unordered: { name: 'Unordered', items: [] } },
      });

      console.log('New pantry created with ID: ', newListRef.id);

      setModalVisible(false);
      setnewPantryName('');
      fetchPantries();
    } catch (error) {
      console.error('Error creating new list: ', error);
    }
  };

  useEffect(() => {
    fetchPantries(); // Fetch data on mount

    const onChange = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    Dimensions.addEventListener('change', onChange);

    return () => {};
  }, []);

  const isSmallScreen = screenWidth < 800;

  useFocusEffect(() => {
    fetchPantries();
  });

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.rowContainer,
          isSmallScreen ? styles.columnLayout : styles.rowLayout,
        ]}
      >
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Pantries</Text>
          <ScrollView style={styles.scrollView}>
            {pantries.map((pantry) => (
              <Link
                key={pantry.id}
                href={`../PantryUI?id=${pantry.id}`}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{String(pantry.name)}</Text>
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
            <Text style={styles.modalTitle}>Enter New Pantry Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter list name"
              value={newPantryName}
              onChangeText={setnewPantryName}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#2196F3' }]}
                onPress={createNewPantry}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#FF5252' }]}
                onPress={() => {
                  setModalVisible(false);
                  setnewPantryName('');
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
    color: '#4CAE4F',
    marginBottom: 10,
    fontFamily: 'inter-bold', // Using Inter font
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
