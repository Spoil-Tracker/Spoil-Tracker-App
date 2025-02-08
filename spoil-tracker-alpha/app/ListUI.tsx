import React, { useState, useEffect } from 'react';
import { Animated, View, Text, StyleSheet, FlatList, SafeAreaView, Pressable, Image, Dimensions, TextInput, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // For the plus icon
import { getBackgroundColorAsync } from 'expo-system-ui';
import { useLocalSearchParams, useGlobalSearchParams, Link } from 'expo-router';
import { getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigation } from 'expo-router';
import { useRouter } from 'expo-router';
import { db } from '../services/firebaseConfig'; // Import your existing Firebase setup


// Mock data to simulate Firestore documents
const foodItems = [
    { title: 'Apples', description: 'Fresh and juicy apples', imageUrl: 'https://via.placeholder.com/100?text=Apples' },
    { title: 'Bananas', description: 'Sweet and ripe bananas', imageUrl: 'https://via.placeholder.com/100?text=Bananas' },
    { title: 'Carrots', description: 'Crunchy and nutritious carrots', imageUrl: 'https://via.placeholder.com/100?text=Carrots' },
    { title: 'Milk', description: 'Cold and fresh milk', imageUrl: 'https://via.placeholder.com/100?text=Milk' },
    { title: 'Eggs', description: 'Organic farm-fresh eggs', imageUrl: 'https://via.placeholder.com/100?text=Eggs' },
    { title: 'Bread', description: 'Freshly baked bread', imageUrl: 'https://via.placeholder.com/100?text=Bread' },
    { title: 'Cheese', description: 'A variety of cheeses', imageUrl: 'https://via.placeholder.com/100?text=Cheese' },
    { title: 'Chicken', description: 'Farm-raised chicken', imageUrl: 'https://via.placeholder.com/100?text=Chicken' },
    { title: 'Fish', description: 'Fresh fish from the ocean', imageUrl: 'https://via.placeholder.com/100?text=Fish' },
    { title: 'Potatoes', description: 'Perfect for any meal', imageUrl: 'https://via.placeholder.com/100?text=Potatoes' },
  ];

type ListItem = {
    id: string,
    title: string;
    description: string;
    quantity: number;
    complete: boolean;
    imageUrl: string;
}

const GroceryList = () => {
  const [items, setItems] = useState<ListItem[]>([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width); // Store screen width
  const [searchText, setSearchText] = useState(''); // Search text state
  const [filteredItems, setFilteredItems] = useState<ListItem[]>([]); // Filtered items state
  const [groceryListText, setGroceryListText] = useState('');
  const [groceryListTitle, setGroceryListTitle] = useState('');
  const [groceryListDate, setGroceryListDate] = useState('');
  const [groceryListDescription, setGroceryListDescription] = useState('');
  const [groceryListCompletion, setGroceryListCompletion] = useState<boolean>(false);
  const [groceryListItems, setGroceryListItems] = useState<ListItem[]>([]);
  const [scaleAnim] = useState(new Animated.Value(1));
  const local = useLocalSearchParams();
  const docRef = doc(db, 'grocery_lists', local.id as string);
  const router = useRouter();

  useEffect(() => {
    const onChange = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const fetchGroceryList = async () => {
        try {
          
          const snapshot = await getDoc(docRef);
    
          if (snapshot.exists()) {
            const data = snapshot.data();
            const itemsFromFirestore: ListItem[] = data?.items || [];
            
            const formatDate = (isoString: string) => {
              const date = new Date(isoString);
              return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            };

            setItems(itemsFromFirestore);
            setFilteredItems(itemsFromFirestore); // Load items into filteredItems
            setGroceryListTitle(data.name || 'Untitled List');
            setGroceryListDate(data.created ? formatDate(data.created) : 'Unknown Date');
            setGroceryListDescription(data.description || ''); // Load description from Firestore
            setGroceryListCompletion(data.completed || false);
            console.log('Fetched grocery list:', data);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching grocery list data:', error);
        }
      };


    fetchGroceryList();
    Dimensions.addEventListener('change', onChange);

  }, [local.id]);

  const navigation = useNavigation();

  const handleDeleteList = async () => {
    try {
      await deleteDoc(docRef);

      alert('List deleted successfully');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete the list');
    }
  };
  

  const generateRandomItem = (): ListItem => {
    const randomIndex = Math.floor(Math.random() * foodItems.length);
    const randomFood = foodItems[randomIndex];
    const randomId = Math.random().toString(36).substring(7); // Random unique ID
    return {
      id: randomId,
      title: randomFood.title,
      description: randomFood.description,
      quantity: 1,
      complete: false,
      imageUrl: randomFood.imageUrl,
    };
  };

  

  const addRandomItem = async () => {
    const newItem = generateRandomItem();
    try {
  
      // Fetch current document
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const currentItems = snapshot.data()?.items || []; // Get the current items or initialize if undefined
        const updatedItems = [...currentItems, newItem]; // Add the new random item
  
        // Update Firestore
        await updateDoc(docRef, {
          items: updatedItems,
        });
  
        // Update local state to reflect the new addition
        setItems(updatedItems);
        setFilteredItems(updatedItems);
        alert(`Added random item: ${newItem.title}`);
      } else {
        console.log('No such document!');
        alert('Failed to load document');
      }
    } catch (error) {
      console.error('Error adding random item to Firestore:', error);
      alert('Error adding random item');
    }
  };

  const toggleCompletion = async () => {
    try {
      await updateDoc(docRef, {
        completed: !groceryListCompletion, // Toggle between true/false
      });
      setGroceryListCompletion(!groceryListCompletion); // Update local state to reflect the change
      console.log(groceryListCompletion ? 'Marked as incomplete in Firestore' : 'Marked as done in Firestore');
      alert(groceryListCompletion ? 'Grocery list marked as incomplete!' : 'Grocery list marked as completed!');
    } catch (error) {
      console.error('Error toggling completion:', error);
      alert('Failed to toggle completion.');
    }
  };
  

  const onDescriptionChange = async (text: string) => {
    setGroceryListDescription(text);
    try {
      await updateDoc(docRef, {
        description: text,
      });
      console.log('Description updated in Firestore');
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };
  // Function to filter items based on the search text
  const filterItems = (text: string) => {
    setSearchText(text);

    if (text.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.title.toLowerCase().includes(text.toLowerCase()) ||
        item.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const onFABPress = async () => {
    // Animate FAB when clicked
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
  
    await addRandomItem();
  };
  

  // Render each item in the list
  const renderItem = ({ item }: { item: ListItem }) => {
    const toggleCompleteStatus = async () => {
      try {
        const updatedItems = items.map(i =>
          i.id === item.id ? { ...i, complete: !i.complete } : i
        );
  
        await updateDoc(docRef, { items: updatedItems });
        setItems(updatedItems);
        setFilteredItems(updatedItems);
      } catch (error) {
        console.error('Error toggling complete status:', error);
        alert('Failed to toggle status');
      }
    };
  
    const deleteItem = async () => {
      try {
        const updatedItems = items.filter(i => i.id !== item.id);
  
        await updateDoc(docRef, { items: updatedItems });
        setItems(updatedItems);
        setFilteredItems(updatedItems);
        alert('Item deleted');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    };
  
    const handleQuantityChange = async (text: string) => {
      const numericQuantity = text.trim() === '' ? 0 : parseInt(text, 10);
  
      if (isNaN(numericQuantity)) {
        // Avoid invalid numbers
        return;
      }
  
      const updatedItems = items.map(i =>
        i.id === item.id ? { ...i, quantity: numericQuantity } : i
      );
  
      try {
        await updateDoc(docRef, { items: updatedItems });
        setItems(updatedItems);
        setFilteredItems(updatedItems);
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    };
  
    return (
      <View style={[styles.unit, item.complete ? styles.completedItem : styles.incompleteItem]}>
        <View style={styles.textContainer}>
          <Text style={styles.unitTitle}>{item.title}</Text>
          <Text style={styles.unitDescription}>{item.description}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.itemTextInput}
              value={item.quantity.toString()}
              keyboardType="numeric"
              onChangeText={handleQuantityChange}
            />
            <Pressable style={styles.itemButton} onPress={toggleCompleteStatus}>
              <Text style={styles.itemButtonText}>{item.complete ? 'Undo' : 'Mark'}</Text>
            </Pressable>
            <Pressable style={styles.minusButton} onPress={deleteItem}>
              <Text style={styles.minusButtonText}>-</Text>
            </Pressable>
          </View>
        </View>
        <Image source={{ uri: item.imageUrl }} style={styles.unitImage} />
      </View>
    );
  };
  
  
  
  
  
  const smallScreen = screenWidth < 680;
  const numColumns = screenWidth < 1015 ? 1 : 2;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.mainContent, { flexDirection: smallScreen ? 'column' : 'row' }]}>
          {/* Left column (fixed position) */}
          <View style={[styles.fixedLeftColumn, {maxWidth : smallScreen ? screenWidth : 300}]}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              value={searchText}
              onChangeText={filterItems}
            />

            {/* Box with text */}
            <View style={styles.textBox}>
              <Text style={styles.textBoxTitle}>{groceryListTitle}</Text>
              <Text style={styles.textBoxContent}>Created: {groceryListDate}</Text>
            </View>

            {/* Large Text Input below the text box */}
            <TextInput
              style={styles.largeTextInput}
              placeholder="Grocery List Description..."
              value={groceryListDescription}
              onChangeText={onDescriptionChange}
              multiline={true}
            />

            {/* Buttons below the text input */}
            <View style={styles.buttonsContainer}>
            <Pressable style={styles.markAsDoneButton} onPress={toggleCompletion}>
                <Text style={styles.buttonText}>{groceryListCompletion ? 'Mark as Incomplete' : 'Mark as Done'}</Text>
            </Pressable>
                <Pressable style={styles.deleteButton} onPress={handleDeleteList}>
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
              <Pressable style={styles.exportButton} onPress={() => alert('Export clicked!')}>
              <Text style={styles.buttonText}>Export</Text>
              </Pressable>
              <Pressable style={styles.exportButton} onPress={() => router.push('./GroceryList')}>
              <Text style={styles.buttonText}>Back</Text>
              </Pressable>
            </View>
          </View>

          {/* Right column (scrollable list) */}
          <View style={styles.listContainer}>
            <FlatList
              data={filteredItems} // Use filtered items based on search
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              key={numColumns}
              numColumns={numColumns}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </ScrollView>

      {/* Floating plus button */}
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
  },
  scrollContainer: {
    flexGrow: 1, // Allow the scroll view to grow and fill the available space
  },
  mainContent: {
    justifyContent: 'flex-start',
    width: '100%',
    padding: 20,
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 100,
    paddingLeft: 5
  },
  unit: {
    flex: 1,
    backgroundColor: '#94D3FF', // Friendly shade of blue (light blue)
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white', // White border color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 5,
    minHeight: 150,
    alignItems: 'flex-start',
    minWidth: 250,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  unitDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  unitImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
    borderColor: 'white',
    borderWidth: 2
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
  fixedLeftColumn: {
    padding: 20,
    zIndex: 999, // Ensure it stays on top of other content
    marginBottom: 20, // Space below when screen is small
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  textBox: {
    backgroundColor: '#c4c4c4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  textBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textBoxContent: {
    fontSize: 14,
    color: '#555',
  },
  largeTextInput: {
    height: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    paddingTop: 10,
    textAlignVertical: 'top',
    backgroundColor: 'white',
  },
  buttonsContainer: {
    marginTop: 20,
  },
  markAsDoneButton: {
    backgroundColor: '#007bff', // Blue color for Mark as Done
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Add space between buttons
  },
  deleteButton: {
    backgroundColor: '#dc3545', // Red color for Delete
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Add space between buttons
  },
  exportButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Add space between buttons
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Add some space below description
  },
  itemTextInput: {
    height: 35,
    width: 60, // Make the text input 40% of the width of the item
    minWidth: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
    backgroundColor: '#FFFFFF'
  },
  itemButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Add some spacing between the buttons
  },
  itemButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  minusButton: {
    backgroundColor: '#dc3545', // Red background for the minus button
    width: 30,  // Set the width and height to make it circular
    height: 30,
    borderRadius: 20,  // Half of the width/height to make it a perfect circle
    alignItems: 'center',
    justifyContent: 'center' // Space between the buttons
  },

  minusButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20
  },
  completedItem: {
    flex: 1,
    backgroundColor: '#A8E6A3', // Light green
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 5,
    minHeight: 150,
    alignItems: 'flex-start',
  },
  incompleteItem: {
    flex: 1,
    backgroundColor: '#94D3FF', // Light blue
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 5,
    minHeight: 150,
    alignItems: 'flex-start',
  },
});

export default GroceryList;
