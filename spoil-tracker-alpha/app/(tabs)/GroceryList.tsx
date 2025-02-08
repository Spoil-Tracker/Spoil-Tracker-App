import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig'; // Import your existing Firebase setup
import ListSection from '../../components/ListSection';
import CreateListModal from '../../components/CreateListModal';
import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';



const ButtonListScreen = () => {
  const [completedLists, setCompletedLists] = useState<string[]>([]);
  const [incompleteLists, setIncompleteLists] = useState<string[]>([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch lists from Firestore
  const fetchLists = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'grocery_lists'));
      const completed: any[] = [];
      const incomplete: any[] = [];
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

  useEffect(() => {
    fetchLists(); // Fetch data on mount

    const onChange = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      subscription.remove();
    };
  }, []);

  useFocusEffect(() => {
    fetchLists();
  });

  const isSmallScreen = screenWidth < 800;

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ flexDirection: isSmallScreen ? 'column' : 'row' }}>
        {/* Completed Lists Section */}
        <ListSection title="Completed Lists" lists={completedLists} />

        {/* Incomplete Lists Section */}
        <ListSection title="Incomplete Lists" lists={incompleteLists} />
      </View>

      <CreateListModal visible={modalVisible} onClose={() => setModalVisible(false)} fetchLists={fetchLists} />

      <Pressable onPress={() => setModalVisible(true)} style={styles.floatingButton}>
        <AntDesign name="plus" size={24} color="white" />
      </Pressable>
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

});
