import React, { useState, useEffect } from 'react';
import { Animated, View, Text, StyleSheet, SafeAreaView, Pressable, Image, TextInput, ScrollView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AntDesign } from '@expo/vector-icons'; // For the plus and minus icons
import { Dimensions } from 'react-native';
import { useLocalSearchParams, useGlobalSearchParams, Link } from 'expo-router';
import { getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'expo-router';
import { db } from '@/services/firebaseConfig'; // Import your existing Firebase setup


type ListItem = {
  id: string,
  title: string;
  description: string;
  quantity: number;
  expirationDate: string;
  imageUrl: string;
}

const Pantry = () => {
  const [lists, setLists] = useState([]);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false); // State for transfer modal visibility
  const [selectedItemId, setSelectedItemId] = useState(''); // State for selected item ID
  const [selectedHeaderId, setSelectedHeaderId] = useState(''); // State for selected destination list
  const [listToDelete, setListToDelete] = useState(null); // State for the list to be deleted
  const [alertVisible, setAlertVisible] = useState(false); // State to control alert visibility
  const [alertMessage, setAlertMessage] = useState(''); // State to hold the alert message
  const router = useRouter();
  
  const [items, setItems] = useState<ListItem[]>([]);
  const [pantryTitle, setPantryTitle] = useState('');

  const local = useLocalSearchParams();
  const docRef = doc(db, 'pantries_t', local.id as string);

  useEffect(() => {  
    fetchPantryData();
  }, []);

  const handleHeaderSave = async (headerText: string, listId: string) => {
    try {
      const snapshot = await getDoc(docRef);
  
      if (snapshot.exists()) {
        const sections = snapshot.data()?.sections || {};
  
        if (sections[listId]) {
          sections[listId].name = headerText; // Update only the name field
  
          await updateDoc(docRef, { sections });
  
          setAlertMessage(`List header updated to '${headerText}'`);
          setAlertVisible(true);
  
          setTimeout(() => {
            setAlertVisible(false);
          }, 3000);
  
          // Force a refresh of data locally to sync UI
          fetchPantryData();
        }
      } else {
        console.error('Snapshot does not exist!');
      }
    } catch (error) {
      console.error('Error saving header name:', error);
    }
  };
    

  const fetchPantryData = async () => {
    try {
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();

        if (data?.sections) {
          const fetchedLists = Object.keys(data.sections).map((key) => ({
            id: key,
            header: data.sections[key]?.name || 'Untitled List',
            isEditable: true,
          }));

        const sortedLists = fetchedLists.sort((a, b) => 
          a.header === 'Unordered' ? -1 : b.header === 'Unordered' ? 1 : 0
        );

        setLists(fetchedLists);

          // Extract items from Firestore sections
          const extractedItems: ListItem[] = Object.keys(data.sections).flatMap(key =>
            data.sections[key]?.items?.map(item => ({
              id: item.id,
              title: item.title,
              description: item.description,
              quantity: item.quantity,
              expirationDate: item.expirationDate,
              imageUrl: item.imageUrl,
              sectionId: key,
            })) || []
          );

          setItems(extractedItems);
          setPantryTitle(data.name || 'Untitled Pantry');
        }
      }
    } catch (error) {
      console.error('Error fetching pantry data:', error);
    }
  };
  
  
  const onFABPress = async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  
    if (lists.length === 0) {
      console.warn('No available lists to add the item to.');
      return;
    }
  
    // Generate a random item
    const randomItem: ListItem = {
      id: uuidv4(),
      title: `Random Item ${Math.floor(Math.random() * 100)}`,
      description: 'Auto-generated random description',
      quantity: Math.floor(Math.random() * 10) + 1,
      expirationDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      imageUrl: '',
    };
  
    // Select a random list
    const randomList = lists[Math.floor(Math.random() * lists.length)];
  
    try {
      // Update Firestore with the new item
      const snapshot = await getDoc(docRef);
  
      if (snapshot.exists()) {
        const sections = snapshot.data()?.sections || {};
        const targetListItems = sections[randomList.id]?.items || [];
  
        const updatedSections = {
          ...sections,
          [randomList.id]: {
            ...sections[randomList.id],
            items: [...targetListItems, randomItem],
          },
        };
  
        await updateDoc(docRef, { sections: updatedSections });
  
        // Update the local state to show the change
        setItems(prevItems => [...prevItems, { ...randomItem, sectionId: randomList.id }]);
  
        setAlertMessage(`Added item to ${randomList.header}`);
        setAlertVisible(true);
  
        setTimeout(() => {
          setAlertVisible(false);
        }, 3000);
      } else {
        console.error('No such document in Firestore!');
      }
    } catch (error) {
      console.error('Error adding random item:', error);
    }
  };
  

  // Function to add a new horizontal list
  const addNewList = async () => {
    const newListName = `List ${lists.length + 1}`;
    const newListId = uuidv4(); // Generate a unique ID for the new list
  
    try {
      const snapshot = await getDoc(docRef);
  
      if (snapshot.exists()) {
        const currentSections = snapshot.data()?.sections || {};
  
        // Add a new list only if it's dynamically created, not overwriting unordered
        const updatedSections = {
          ...currentSections,
          [newListId]: { name: newListName, items: [] },
        };
  
        await updateDoc(docRef, { sections: updatedSections });
  
        const newList = { id: newListId, header: newListName, isEditable: true };
        setLists(prevLists => [...prevLists, newList]);
  
        setAlertMessage(`Successfully added ${newListName}`);
        setAlertVisible(true);
  
        setTimeout(() => {
          setAlertVisible(false);
        }, 3000);
      } else {
        console.error('No such document in Firestore!');
      }
    } catch (error) {
      console.error('Error adding new list:', error);
    }
  };
  
  
  

  // Function to sort items by expiration date
  const sortItemsByExpiration = (items) => {
    return items.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
  };

  // Show modal to confirm deletion
  const confirmDeleteList = (listId) => {
    setListToDelete(listId); // Set the list to be deleted
    setIsModalVisible(true);  // Show the modal
  };

  // Remove the list
  const removeList = async () => {
    try {
      const listToDeleteSnapshot = await getDoc(docRef);
      if (!listToDeleteSnapshot.exists()) {
        console.error('Firestore document does not exist!');
        return;
      }
  
      const sections = listToDeleteSnapshot.data()?.sections || {};
      const listToDeleteItems = sections[listToDelete]?.items || [];
  
      // Ensure Unordered exists
      if (!sections['unordered']) {
        sections['unordered'] = { name: 'Unordered', items: [] };
      }
  
      const updatedUnorderedItems = [
        ...(sections['unordered'].items || []),
        ...listToDeleteItems,
      ];
  
      delete sections[listToDelete];
  
      await updateDoc(docRef, {
        sections: {
          ...sections,
          unordered: { ...sections['unordered'], items: updatedUnorderedItems },
        },
      });
  
      // Trigger a re-fetch of data
      fetchPantryData();
  
      setAlertMessage(`List deleted and moved items to 'Unordered'`);
      setAlertVisible(true);
  
      setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
  
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error during list deletion:', error);
    }
  };
  
  

  // Close the modal without deleting
  const cancelDelete = () => {
    setIsModalVisible(false);  // Just close the modal
  };

  const openTransferModal = () => {
    setIsTransferModalVisible(true);
  };

  // Close transfer modal
  const closeTransferModal = () => {
    setIsTransferModalVisible(false);
    setSelectedItemId('');
    setSelectedHeaderId('');
  };

  const handleTransferItem = async () => {
    if (!selectedItemId || !selectedHeaderId) {
      alert('Please select both an item and a destination list.');
      return;
    }
  
    try {
      const itemToMove = items.find(item => item.id === selectedItemId);
      if (!itemToMove) {
        alert('Item not found!');
        return;
      }
  
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        alert('No such document exists!');
        return;
      }
  
      const sections = snapshot.data()?.sections || {};
      const sourceListItems = sections[itemToMove.sectionId]?.items || [];
      const destinationListItems = sections[selectedHeaderId]?.items || [];
  
      // Remove the item from the source list
      const updatedSourceItems = sourceListItems.filter(item => item.id !== itemToMove.id);
  
      // Update the destination list with the moved item
      const updatedDestinationItems = [...destinationListItems, { ...itemToMove, sectionId: selectedHeaderId }];
  
      const updatedSections = {
        ...sections,
        [itemToMove.sectionId]: { ...sections[itemToMove.sectionId], items: updatedSourceItems },
        [selectedHeaderId]: { ...sections[selectedHeaderId], items: updatedDestinationItems },
      };
  
      await updateDoc(docRef, { sections: updatedSections });
  
      // Update the local state
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === selectedItemId
            ? { ...item, sectionId: selectedHeaderId }
            : item
        )
      );
  
      alert('Item transferred successfully!');
      closeTransferModal();
    } catch (error) {
      console.error('Error transferring item:', error);
      alert('Failed to transfer item');
    }
  };
  
  

  // Group items by headerId dynamically
  const getItemsByHeader = (listId) => {
    return items.filter(item => item.sectionId === listId);
  };  

  // Render each horizontal list with an editable header
  const renderList = (list) => {
    const listItems = sortItemsByExpiration(
      items.filter(item => item.sectionId === list.id)
    );
  
    return (
      <View style={styles.listContainer} key={list.id}>
        {/* Conditional rendering based on the list's header name */}
        {list.header === 'Unordered' ? (
          <Text style={styles.listHeaderStatic}>{list.header}</Text>
        ) : (
          <TextInput
            style={styles.listHeader}
            value={list.header}
            onChangeText={(text) => {
              const updatedLists = lists.map((l) =>
                l.id === list.id ? { ...l, header: text } : l
              );
              setLists(updatedLists);
            }}
            onBlur={() => handleHeaderSave(list.header, list.id)} // Ensure this runs only after user finishes editing
            editable={list.isEditable}
          />

        )}
  
        {/* Remove button */}
        {list.isEditable && list.header !== 'Unordered' && (
          <Pressable style={styles.removeListButton} onPress={() => confirmDeleteList(list.id)}>
            <Text style={styles.removeListButtonText}>−</Text>
          </Pressable>
        )}
  
        <ScrollView horizontal contentContainerStyle={styles.horizontalScroll}>
          {listItems.length > 0 ? (
            listItems.map((item) => (
              <View key={item.id} style={styles.unit}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.unitImage} />
                ) : (
                  <View style={styles.unitImageFallback}>
                    <Text>No Image</Text>
                  </View>
                )}
                <View style={styles.textContainer}>
                  <Text style={styles.unitTitle}>{item.title}</Text>
                  <Text style={styles.unitDescription}>{item.description}</Text>
                  <Text style={styles.expirationText}>
                    EXP: {new Date(item.expirationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', })}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noItemsText}>No items available</Text>
          )}
        </ScrollView>
      </View>
    );
  };  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainContent}>
          {/* Left Column - Adjusted for Flex */}
          <View style={styles.fixedLeftColumn}>
            <Text style={styles.textBoxTitle}>Grocery List Example</Text>
            
            <Pressable style={styles.addListButton} onPress={addNewList}>
              <Text style={styles.addListButtonText}>Add New List</Text>
            </Pressable>
            <Pressable style={styles.addListButton} onPress={() => router.back()}>
              <Text style={styles.addListButtonText}>Back</Text>
            </Pressable>
          </View>
  
          {/* Right Column - Lists */}
          <View style={styles.rightColumn}>
            {lists.map((list) => renderList(list))}
          </View>
        </View>
      </ScrollView>
  
      {/* Transfer Button */}
      <Pressable style={styles.transferButton} onPress={openTransferModal}>
        <Text style={styles.transferButtonText}>Transfer Item</Text>
      </Pressable>
  
      <Modal visible={isTransferModalVisible} transparent={true} animationType="fade" onRequestClose={closeTransferModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Transfer Item</Text>
  
            {/* Dropdown for selecting an item */}
            <Picker
              selectedValue={selectedItemId}
              onValueChange={(itemValue) => setSelectedItemId(itemValue)}
            >
              <Picker.Item label="Select Item" value="" />
              {items.map((item) => (
                <Picker.Item key={item.id} label={item.title} value={item.id} />
              ))}
            </Picker>

            {/* Dropdown for selecting a destination list */}
            <Picker
              selectedValue={selectedHeaderId}
              onValueChange={(itemValue) => setSelectedHeaderId(itemValue)}
            >
              <Picker.Item label="Select List" value="" />
              {lists
                .filter(list => list.header !== 'Unordered') // Exclude Unordered
                .map((list) => (
                  <Picker.Item key={list.id} label={list.header} value={list.id} />
                ))}
            </Picker>

  
            <View style={styles.modalButtons}>
              <Pressable onPress={closeTransferModal} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleTransferItem} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Transfer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
  
      {/* Modal for delete confirmation */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to delete this list?</Text>
            <View style={styles.modalButtons}>
              <Pressable onPress={cancelDelete} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={removeList} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
  
      {/* Alert Banner */}
      {alertVisible && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>{alertMessage}</Text>
        </View>
      )}
      <Animated.View style={[styles.floatingButton, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable onPress={onFABPress}>
          <AntDesign name="plus" size={24} color="white" />
        </Pressable>
    </Animated.View>
    </SafeAreaView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F2',
    fontFamily: 'inter-bold',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
  },
  mainContent: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 10,
  },
  fixedLeftColumn: {
    flex: 1,
    padding: 10,
    maxWidth: 250,
    justifyContent: 'flex-start',
  },
  rightColumn: {
    flex: 3,
    marginTop: 10,
  },
  listContainer: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#4CAE4F',
    color: '#fff',
    borderRadius: 6,
  },
  removeListButton: {
    backgroundColor: '#d32f2f',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  removeListButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  horizontalScroll: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  unit: {
    width: 120,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unitImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  unitImageFallback: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  textContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  unitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  unitDescription: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  expirationText: {
    fontSize: 12,
    color: '#ff5722',
    fontWeight: 'bold',
    marginTop: 6,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  addListButton: {
    backgroundColor: '#4CAE4F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addListButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    width: 250,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noItemsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
  },
  textBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'left',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  alertBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  transferButton: {
    position: 'absolute',
    bottom: 20, // Positioning it at the bottom
    left: 20, // Center it horizontally
    backgroundColor: '#4CAE4F',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },

  transferButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },

  listHeaderStatic: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#347736',
    color: '#fff',
    borderRadius: 6,
  },
});

export default Pantry;
