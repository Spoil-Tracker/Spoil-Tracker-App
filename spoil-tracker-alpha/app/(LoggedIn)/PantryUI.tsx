import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // For the plus and minus icons
import { useLocalSearchParams } from 'expo-router';
import { getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'expo-router';
import { db } from '../../services/firebaseConfig'; // imports firebase database
import { useTheme } from 'react-native-paper'; // Import useTheme for dark mode, contributed by Kevin
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type ListItem = {
  id: string;
  title: string;
  description: string;
  quantity: number;
  expirationDate: string;
  imageUrl: string;
};

// Displays pantry, sorting options, add item, pantry items
const PantryScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { pantryId } = useLocalSearchParams();
  const [lists, setLists] = useState<any[]>([]);
  const [items, setItems] = useState<ListItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ListItem[]>([]);
  const [pantryName, setPantryName] = useState('');
  const [pantryDescription, setPantryDescription] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ListItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState('1');
  const [sortOption, setSortOption] = useState<'name' | 'expiration'>('name');

  const [manualDateInput, setManualDateInput] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const local = useLocalSearchParams(); // Retrieve parameters from route, for docRef local.id below

  const docRef = doc(db, 'pantry', local.id as string); // Reference to Firestore document in the grocery_list collection, uses the id fed by the previous list main menu

  // allows for user to add manual expiration date input
  const handleManualDateInput = (text: string) => {
    setManualDateInput(text);

    // auto-format as user types (MM/DD/YYYY)
    if (text.length === 2 || text.length === 5) {
      setManualDateInput(text + '/');
    }

    // Parse date when complete
    if (text.length === 10) {
      const parts = text.split('/');
      const month = parseInt(parts[0]) - 1;
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);

      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        const newDate = new Date(year, month, day);
        if (!isNaN(newDate.getTime())) {
          setExpirationDate(newDate);
        }
      }
    }
  };

  // Allows for sorting items based on name or date
  const sortItems = (items: ListItem[]) => {
    const sorted = [...items];
    switch (sortOption) {
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'expiration':
        return sorted.sort(
          (a, b) =>
            new Date(a.expirationDate).getTime() -
            new Date(b.expirationDate).getTime()
        );
      default:
        return sorted;
    }
  };

  // Animation for FAB
  const onFABPress = () => {
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
    setIsAddModalVisible(true);
  };

  // fetches pantry data
  useEffect(() => {
    const fetchPantry = async () => {
      if (!docRef) return;
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPantryName(data?.name || 'Unnamed Pantry');
          setPantryDescription(data.description || '');
          setLists(data.sections || []);

          // Flatten all items from sections
          const allItems = Object.values(data?.sections || {})
            .flatMap((section: any) => section?.items || [])
            .filter(Boolean);

          setItems(allItems);
          setFilteredItems(allItems);
        }
      } catch (error) {
        console.error('Error fetching pantry:', error);
      }
    };

    fetchPantry();
  }, [pantryId]);

  // ability to update pantry description
  const updatePantryDescription = async (text: string) => {
    setPantryDescription(text);
    try {
      await updateDoc(docRef, { description: text });
      console.log('Description updated successfully');
    } catch (error) {
      console.error('Error updating description:', error);
      // Optional: Revert UI if update fails
      const docSnap = await getDoc(docRef);
      setPantryDescription(docSnap.data()?.description || '');
    }
  };

  // add in a custom item
  const addCustomItem = async () => {
    if (!customName) {
      alert('Please enter an item name');
      return;
    }

    if (!expirationDate) {
      alert('Please enter an expiration date');
      return;
    }

    const newItem: ListItem = {
      id: uuidv4(),
      title: customName,
      description: customDescription,
      quantity: parseInt(itemQuantity) || 1,
      expirationDate: expirationDate.toISOString(),
      imageUrl: '',
    };

    try {
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const sections = snapshot.data()?.sections || {};
        const firstListId = Object.keys(sections)[0];

        if (firstListId) {
          const updatedSections = {
            ...sections,
            [firstListId]: {
              ...sections[firstListId],
              items: [...(sections[firstListId]?.items || []), newItem],
            },
          };

          await updateDoc(docRef, { sections: updatedSections });
          setItems((prev) => [...prev, newItem]);
          setFilteredItems((prev) => [...prev, newItem]);

          setAlertMessage(`Added "${newItem.title}"`);
          setAlertVisible(true);
          setTimeout(() => setAlertVisible(false), 3000);

          setCustomName('');
          setCustomDescription('');
          setItemQuantity(''); // optional: clear quantity
          setExpirationDate(null); // clear after use
          setIsDropdownVisible(false);
          setIsAddModalVisible(false); // close modal
        }
      }
    } catch (error) {
      console.error('Error adding custom item:', error);
      alert('Error adding item');
    }
  };

  // updates the currently selected item in the pantry
  const updateItem = async () => {
    if (!currentItem?.expirationDate) {
      Alert.alert('Error', 'Please select or enter a valid expiration date');
      return;
    }

    if (!currentItem) return;

    console.log('Updating item:', currentItem);

    try {
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const sections = snapshot.data()?.sections || {};

        for (const sectionId in sections) {
          const section = sections[sectionId];
          const updatedItems = section.items?.map((item: any) =>
            item.id === currentItem.id ? currentItem : item
          );
          sections[sectionId].items = updatedItems;
        }

        await updateDoc(docRef, { sections });

        // Update local state
        const updatedItems = items.map((item) =>
          item.id === currentItem.id ? currentItem : item
        );
        setItems(updatedItems);
        setFilteredItems(updatedItems);

        setAlertMessage(`Updated "${currentItem.title}"`);
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 3000);

        setIsAddModalVisible(false);
        setCurrentItem(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item');
    }
  };

  // marks item as used, reducing the quantity by one
  const markAsUsed = async (itemId: string) => {
    try {
      // updates quantity immediately
      const updatedItems = items.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(item.quantity - 1, 0); // prevent negatives
          return {
            ...item,
            quantity: newQuantity,
            lastUsed: new Date().toISOString(),
          };
        }
        return item;
      });

      setItems(updatedItems);
      setFilteredItems(updatedItems);

      // updates Firestore
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const sections = snapshot.data()?.sections || {};

        const updatedSections = Object.keys(sections).reduce((acc, listId) => {
          acc[listId] = {
            ...sections[listId],
            items: sections[listId].items.map((i: ListItem) => {
              if (i.id === itemId) {
                const newQuantity = Math.max(i.quantity - 1, 0);
                return {
                  ...i,
                  quantity: newQuantity,
                  lastUsed: new Date().toISOString(),
                };
              }
              return i;
            }),
          };
          return acc;
        }, {} as any);

        await updateDoc(docRef, { sections: updatedSections });
      }

      setAlertMessage('Quantity decreased by 1');
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);

      // auto-deletes if quantity reaches 0
      const updatedItem = updatedItems.find((item) => item.id === itemId);
      if (updatedItem?.quantity === 0) {
        setTimeout(() => deleteItem(itemId), 1000);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert UI if Firestore update fails
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const allItems = Object.values(snapshot.data()?.sections || {}).flatMap(
          (section) => section.items || []
        );
        setItems(allItems);
        setFilteredItems(allItems);
      }
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      // removes item immediately
      const updatedItems = items.filter((item) => item.id !== itemId);
      setItems(updatedItems);
      setFilteredItems(updatedItems);

      // updates Firestore
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const sections = snapshot.data()?.sections || {};

        // Create updated sections without the item
        const updatedSections = Object.keys(sections).reduce((acc, listId) => {
          acc[listId] = {
            ...sections[listId],
            items: sections[listId].items.filter(
              (i: ListItem) => i.id !== itemId
            ),
          };
          return acc;
        }, {} as any);

        await updateDoc(docRef, { sections: updatedSections });
      }

      setAlertMessage('Item deleted successfully');
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);
    } catch (error) {
      console.error('Error deleting item:', error);
      // Revert UI if Firestore update fails
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const allItems = Object.values(snapshot.data()?.sections || {}).flatMap(
          (section) => section.items || []
        );
        setItems(allItems);
        setFilteredItems(allItems);
      }
      setAlertMessage('Failed to delete item');
      setAlertVisible(true);
    }
  };

  // renders the items on screen
  const renderItem = ({ item, drag }: { item: ListItem; drag: any }) => (
    <View
      style={[
        styles.itemCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.onSurface,
          borderWidth: 1,
          height: '100%',
        },
      ]}
    >
      <Pressable
        onLongPress={drag}
        delayLongPress={200}
        style={styles.dragHandle}
      >
        <View
          style={[styles.dragLine, { backgroundColor: colors.onSurface }]}
        />
        <View
          style={[styles.dragLine, { backgroundColor: colors.onSurface }]}
        />
        <View
          style={[styles.dragLine, { backgroundColor: colors.onSurface }]}
        />
      </Pressable>

      <Image
        source={{ uri: item.imageUrl || 'https://www.placecats.com/100/100' }}
        style={styles.itemImage}
      />

      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.onSurface }]}>
          {item.title}
        </Text>
        <Text style={{ color: colors.onSurface }}>Qty: {item.quantity}</Text>
        <Text style={{ color: colors.onSurface }}>
          Exp: {new Date(item.expirationDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.itemActions}>
        {/* Checkmark Button */}
        <Pressable
          onPress={() => markAsUsed(item.id)}
          style={({ pressed }) => [pressed && styles.buttonPressed]}
        >
          <AntDesign name="check" size={24} color="green" />
        </Pressable>

        {/* Delete Button */}
        <Pressable
          onPress={() => deleteItem(item.id)}
          style={({ pressed }) => [pressed && styles.buttonPressed]}
          hitSlop={10} // Makes touch area larger
        >
          <AntDesign name="close" size={24} color="red" />
        </Pressable>
        <Pressable
          onPress={() => {
            setCurrentItem(item);
            setIsAddModalVisible(true);
          }}
        >
          <Feather name="edit" size={20} color={colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );

  // displays everything
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.mainContent}>
          {/* Left Column - Pantry Info */}
          <View style={styles.leftColumn}>
            <View style={[styles.pantryHeader, {}]}>
              <MaterialCommunityIcons name="fridge" size={80} />
              <View>
                <Text style={[styles.pantryName, { color: 'black' }]}>
                  {pantryName}
                </Text>
                <Text style={{ color: 'black', fontSize: 15 }}>
                  Total Pantry Items: {items.length}
                </Text>
              </View>
            </View>

            {/* Sorting Options */}
            <View style={styles.sortContainer}>
              <Text style={[styles.sortLabel, { color: colors.onSurface }]}>
                Sort by:
              </Text>
              <View style={styles.sortButtons}>
                <Pressable
                  onPress={() => setSortOption('name')}
                  style={[
                    styles.sortButton,
                    sortOption === 'name' && styles.activeSortButton,
                  ]}
                >
                  <Text style={styles.sortButtonText}>Name</Text>
                </Pressable>
                <Pressable
                  onPress={() => setSortOption('expiration')}
                  style={[
                    styles.sortButton,
                    sortOption === 'expiration' && styles.activeSortButton,
                  ]}
                >
                  <Text style={styles.sortButtonText}>Expiry</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[
                styles.actionButton,
                { backgroundColor: '#3182f1', borderColor: '#1052ad' },
              ]}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Text style={styles.buttonText}>Add Item</Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                {
                  backgroundColor: '#f13168',
                  borderColor: '#a60835',
                },
              ]}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Back</Text>
            </Pressable>

            <TextInput
              style={[
                styles.descriptionInput,
                {
                  backgroundColor: 'white',
                  color: 'black',
                  borderColor: 'black',
                },
              ]}
              placeholder="Pantry Description..."
              value={pantryDescription}
              onChangeText={updatePantryDescription}
              multiline
            />
          </View>

          {/* Right Column - Items List */}
          <View style={[styles.rightColumn, { flex: 1 }]}>
            {filteredItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ color: colors.onSurface }}>No items found</Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.itemsGridContainer}>
                {sortItems(filteredItems).map((item) => (
                  <View key={item.id} style={styles.itemContainer}>
                    {renderItem({ item, drag: () => {} })}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Add/Edit Item Modal */}
        <Modal
          visible={isAddModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setIsAddModalVisible(false);
            setCurrentItem(null);
          }}
        >
          <View
            style={[
              styles.modalOverlay,
              { backgroundColor: 'rgba(0,0,0,0.5)' },
            ]}
          >
            <View
              style={[styles.modalContent, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                {currentItem ? 'Edit Item' : 'Add New Item'}
              </Text>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.onSurface,
                    borderColor: colors.onSurface,
                  },
                ]}
                placeholder="Item name"
                placeholderTextColor={colors.onSurface}
                value={currentItem ? currentItem.title : customName}
                onChangeText={
                  currentItem
                    ? (text) => setCurrentItem({ ...currentItem, title: text })
                    : setCustomName
                }
              />

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.onSurface,
                    borderColor: colors.onSurface,
                  },
                ]}
                placeholder="Description"
                placeholderTextColor={colors.onSurface}
                value={
                  currentItem ? currentItem.description : customDescription
                }
                onChangeText={
                  currentItem
                    ? (text) =>
                        setCurrentItem({ ...currentItem, description: text })
                    : setCustomDescription
                }
                multiline
              />

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.onSurface,
                    borderColor: colors.onSurface,
                  },
                ]}
                placeholder="Quantity"
                placeholderTextColor={colors.onSurface}
                value={
                  currentItem ? currentItem.quantity.toString() : itemQuantity
                }
                onChangeText={
                  currentItem
                    ? (text) =>
                        setCurrentItem({
                          ...currentItem,
                          quantity: parseInt(text) || 1,
                        })
                    : setItemQuantity
                }
                keyboardType="numeric"
              />

              <Text style={{ color: colors.onSurface, marginBottom: 4 }}>
                Expiration Date:
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}
              >
                <DateTimePicker
                  value={expirationDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    if (date) {
                      setExpirationDate(date);
                      setManualDateInput('');
                    }
                  }}
                  style={{ flex: 1 }}
                />

                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      flex: 1,
                      backgroundColor: colors.background,
                      color: colors.onSurface,
                      borderColor: colors.onSurface,
                    },
                  ]}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.onSurface}
                  value={manualDateInput}
                  onChangeText={handleManualDateInput}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <View style={styles.modalButtons}>
                {/* Cancel Button */}
                <Pressable
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.error },
                  ]}
                  onPress={() => {
                    setIsAddModalVisible(false);
                    setCurrentItem(null);
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={currentItem ? updateItem : addCustomItem}
                >
                  <Text style={styles.buttonText}>
                    {currentItem ? 'Update' : 'Add'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Alert Banner */}
        {alertVisible && (
          <View
            style={[styles.alertBanner, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.alertText}>{alertMessage}</Text>
          </View>
        )}

        {/* Floating Action Button */}
        <Animated.View
          style={[
            styles.floatingButton,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable onPress={onFABPress}>
            <AntDesign name="plus" size={24} color="white" />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// style sheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1,
    padding: 10,
    maxWidth: 300,
    justifyContent: 'flex-start',
  },
  rightColumn: {
    flex: 1,
    padding: 5,
    maxWidth: '100%',
  },
  pantryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
    backgroundColor: '#FFF1DB',
    borderColor: '#954535',
    borderWidth: 2,
    borderRadius: 8,
  },
  pantryName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 10,
  },
  itemCard: {
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  dragHandle: {
    paddingRight: 10,
  },
  dragLine: {
    width: 20,
    height: 2,
    marginVertical: 2,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  buttonPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  itemName: {
    fontWeight: 'bold',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '25%',
    padding: 15,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    minWidth: 100,
  },
  datePicker: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  alertBanner: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center',
  },
  alertText: {
    color: 'white',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  sortContainer: {
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  sortLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  activeSortButton: {
    backgroundColor: '#3182f1',
  },
  sortButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeSortButtonText: {
    color: 'white',
  },
  itemsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 8,
  },
  itemContainer: {
    width: '32%', // three items per row with some spacing
    minWidth: 310, // Minimum width before wrapping
    margin: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default PantryScreen;
