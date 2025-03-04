import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWindowDimensions, Animated, View, Text, StyleSheet, FlatList, SafeAreaView, Pressable, Image, Dimensions, TextInput, ScrollView, Modal, TouchableOpacity, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // For the plus icon
import { useLocalSearchParams, useGlobalSearchParams, Link } from 'expo-router';
import { useNavigation } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import { v4 as uuidv4 } from 'uuid';
import FoodDropdownComponent from '../../components/Food/FoodDropdown';
import {
  fetchGroceryListByID,
  deleteGroceryList,
  addGroceryListItem,
  deleteGroceryListItem,
  updateGroceryListItemMeasurement,
  updateGroceryListItemQuantity,
  GroceryListItem,
  updateGroceryListIsComplete,
  updateGroceryListDescription,
  updateGroceryListItemIsBought
} from '@/components/GroceryList/GroceryListService';
import { exportGroceryListToCSV,exportGroceryListToCSVWeb, exportGroceryListToPDF, exportGroceryListToPDFWeb } from '@/components/ExportService';
import ProductPage from '@/app/(LoggedIn)/FoodUI';

  // list used for the dropdown located with each grocery list item in the flatlist
  const FOOD_UNITS = [
    { label: 'mg', value: 'mg' },
    { label: 'g', value: 'g' },
    { label: 'kg', value: 'kg' },
    { label: 'lb', value: 'lb' },
    { label: 'L', value: 'L' },
    { label: 'mL', value: 'mL' },
    { label: 'unit', value: 'unit' }
  ];

const GroceryList = () => {
  const { height, width } = useWindowDimensions();
  const [items, setItems] = useState<GroceryListItem[]>([]); // List of grocery items
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width); // Store screen width
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height); // Store screen width
  const [searchText, setSearchText] = useState(''); // Search text state
  const [filteredItems, setFilteredItems] = useState<GroceryListItem[]>([]); // Filtered items state, hook used whenever the Sort By button is used or user searches through text input
  const [groceryListTitle, setGroceryListTitle] = useState(''); // Grocery list title
  const [groceryListDate, setGroceryListDate] = useState(''); // Grocery list creation date
  const [groceryListDescription, setGroceryListDescription] = useState(''); // Grocery list description
  const [groceryListCompletion, setGroceryListCompletion] = useState<boolean>(false); // Grocery List Completion status
  const [scaleAnim] = useState(new Animated.Value(1)); // Animation state, for resizing and re-organizing the UI whenever the user changes screen size
  const local = useLocalSearchParams(); // Retrieve parameters from route, for docRef local.id below
  const [sortModalVisible, setSortModalVisible] = useState(false); // Modal visibility state
  const [dropdownVisible, setDropdownVisible] = useState(false); // Dropdown visibility state, used in the add item modal UI
  const dropdownHeight = useRef(new Animated.Value(0)).current; // Dropdown animation height, used in the add item modal UI
  const [dropdownVisibleMobile, setDropdownVisibleMobile] = useState(false); // Dropdown visibility state, used in the add item modal UI
  const dropdownHeightMobile = 400;
  const [customName, setCustomName] = useState(''); // Custom item name, used in the add item modal UI for when a user wants to add a custom item
  const [customDescription, setCustomDescription] = useState(''); // Custom item description, used in the add item modal UI for when a user wants to add a custom item
  const dropdownAnimMobile = useRef(new Animated.Value(-dropdownHeightMobile)).current;
  const groceryListId = local.id as string;
  const navigation = useNavigation(); // Navigation hook, allows for a back button on the top left of the header
  const [selectedFood, setSelectedFood] = useState<{ label: string; value: string } | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);


  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Effect hook to fetch grocery list data and handle screen resizing
  useEffect(() => {
    const onChange = () => {
      setScreenWidth(Dimensions.get('window').width);
      setScreenHeight(Dimensions.get('window').height);
    };

    const fetchGroceryList = async () => {
        try {
          
          const snapshot = await fetchGroceryListByID(local.id as string);    
          // if a grocery list with the id specified by the local param exists
          if (snapshot) {
            setItems(snapshot.grocery_list_items);
            setFilteredItems(snapshot.grocery_list_items);
            setGroceryListTitle(snapshot.grocerylist_name || 'Untitled List');
            setGroceryListDate(snapshot.createdAt ? formatDate(snapshot.createdAt) : 'Unknown Date');
            setGroceryListDescription(snapshot.description || '');
            setGroceryListCompletion(snapshot.isComplete || false);
            console.log('Fetched grocery list:', snapshot);
          }
        } catch (error) {
          console.error('Error fetching grocery list data:', error);
        }
      };

    
    fetchGroceryList();
    Dimensions.addEventListener('change', onChange);

  }, [groceryListId]);

  // handler for when a user chooses to delete the list, called after user presses the delete button
  const handleDeleteList = async () => {
    try {
      await deleteGroceryList(groceryListId);
      alert('List deleted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete the list');
    }
  };

  // Function to add a custom item to the list
  // used whenever user opens up the FAB modal and then inputs a custom name and description for an item
  const addCustomItem = async () => {
    if (!customName) return;
    const newItem = generateCustomItem();
    try {
      const success = await addGroceryListItem(groceryListId, newItem.food_global_id, newItem.food_name);
      if (success) {
        const snapshot = await fetchGroceryListByID(groceryListId);
        if (snapshot) {
          setItems(snapshot.grocery_list_items);
          setFilteredItems(snapshot.grocery_list_items);
        }
        alert(`Added custom item: ${newItem.food_name}`);
      }
    } catch (error) {
      console.error('Error adding custom item:', error);
      alert('Error adding custom item');
    }
  };

  // Function to generate a custom item
  // addCustomItem uses this to generate a grocery list item object
  const generateCustomItem = (): GroceryListItem => {
    const newItem: GroceryListItem = {
      id: uuidv4(),
      food_name: customName,
      food_global_id: 'custom', // mark as custom
      measurement: 'unit',
      quantity: 1,
      isBought: false,
      description: '',
      imageUrl: ''
    };
    setCustomName('');
    setCustomDescription('');
    return newItem;
  };
  

  // Function called whenever user presses the mark as complete/incomplete button in the List UI
  const toggleCompletion = async () => {
    try {
      // Call the service to update isComplete, toggling the current state
      const updatedList = await updateGroceryListIsComplete(groceryListId, !groceryListCompletion);
      // Update local state with the updated value from Firestore
      setGroceryListCompletion(updatedList.isComplete);
      console.log(
        updatedList.isComplete 
          ? 'Marked as completed in Firestore' 
          : 'Marked as incomplete in Firestore'
      );
      alert(
        updatedList.isComplete 
          ? 'Grocery list marked as completed!' 
          : 'Grocery list marked as incomplete!'
      );
    } catch (error) {
      console.error('Error toggling completion:', error);
      alert('Failed to toggle completion.');
    }
  };
  

  const onDescriptionChange = async (text: string) => {
    setGroceryListDescription(text);
    try {
      await updateGroceryListDescription(groceryListId, text);
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
        item.food_name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredItems(filtered);
    }

  };
  // Function to handle the floating blue button being pressed and animate
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

    setModalVisible(true); // Show modal when FAB is pressed
  };

  const closeModal = () => {
    setModalVisible(false); // Close modal
  };
  
  const openProductModal = (foodGlobalId: string) => {
    setSelectedFoodId(foodGlobalId);
    setProductModalVisible(true);
  };

  // Handler to close ProductPage modal
  const closeProductModal = () => {
    setSelectedFoodId(null);
    setProductModalVisible(false);
  };

  /**
   render each item in the list
   used for the items in the flatlist that renders all of the grocery list items
   includes all the UI elements for one item cell
  */
   const renderItem = ({ item }: { item: GroceryListItem }) => {
    /**
     toggles the completion status of the current item
     updates the Firestore document and local state accordingly
     */

    const toggleCompleteStatus = async () => {
      // This example toggles locally; you might later add a service call to update the item.
      await updateGroceryListItemIsBought(groceryListId, item.id);
      const updatedItems = items.map(i =>
        i.id === item.id ? { ...i, isBought: !i.isBought } : i
      );
      const updatedFilterItems = filteredItems.map(i =>
        i.id === item.id ? { ...i, isBought: !i.isBought } : i
      );
      setItems(updatedItems);
      setFilteredItems(updatedFilterItems);
      // Optionally refetch the grocery list from the backend.
    };

    /**
     deletes the current item from the list
     updates Firestore and local state
     */
     const deleteItem = async () => {
      try {
        const success = await deleteGroceryListItem(groceryListId, item.id);
        if (success) {
          const snapshot = await fetchGroceryListByID(groceryListId);
          if (snapshot) {
            setItems(snapshot.grocery_list_items);
            setFilteredItems(snapshot.grocery_list_items);
          }
          alert('Item deleted');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    };

    const handleQuantityChange = async (value: string) => {
      const numericQuantity = value.trim() === '' ? 0 : parseInt(value, 10);
      if (isNaN(numericQuantity)) return;
      try {
        const updated = await updateGroceryListItemQuantity(groceryListId, item.id, numericQuantity);
        if (updated) {
          const snapshot = await fetchGroceryListByID(groceryListId);
          if (snapshot) {
            setItems(snapshot.grocery_list_items);
          }
        } else {
          console.error("Update returned false");
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    };

    const handleUnitChange = async (measure: string) => {
      try {
        const updated = await updateGroceryListItemMeasurement(groceryListId, item.id, measure);
        if (updated) {
          const snapshot = await fetchGroceryListByID(groceryListId);
          if (snapshot) {
            setItems(snapshot.grocery_list_items);
            setFilteredItems(snapshot.grocery_list_items);
          }
        }
      } catch (error) {
        console.error('Error updating measurement:', error);
      }
    };

    // the rest of the code below is standard UI components using react native's framework + basic css
    return (
      <View style={[styles.unit, item.isBought ? styles.completedItem : styles.incompleteItem]}>
        <View style={styles.textContainer}>
          <Pressable
            onPress={() => openProductModal(item.food_global_id)}
          >
          <Text style={styles.unitTitle}>{item.food_name}</Text>
          <Text style={styles.unitDescription}>{item.description}</Text>
          </Pressable>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.itemTextInput}
              defaultValue={item.quantity.toString()}
              keyboardType="numeric"
              onBlur={(e) => handleQuantityChange(e.nativeEvent.text)}
              maxLength={3}
            />
            <Dropdown
              data={FOOD_UNITS}
              labelField="label"
              valueField="value"
              placeholder="---"
              value={item.measurement}
              onChange={(selectedItem) => handleUnitChange(selectedItem.value)}
              style={styles.measurementDropdown}
              itemContainerStyle={styles.measurementContainer}
              itemTextStyle={styles.measurementText}
            />
            <Pressable style={[styles.itemButton, item.isBought ? styles.completeButton: styles.incompleteButton]} onPress={toggleCompleteStatus}>
              <Text style={styles.itemButtonText}>{item.isBought ? 'X' : '✔'}</Text>
            </Pressable>
            <Pressable style={styles.minusButton} onPress={deleteItem}>
              <Text style={styles.minusButtonText}>-</Text>
            </Pressable>
          </View>
        </View>
        <Image source={{ uri: item.imageUrl }} style={styles.unitImage} />
      </View>
    );
  }
  
  const smallScreen = screenWidth < 690;
  const numColumns = width > 1420 ? 2 : 1;

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    Animated.timing(dropdownHeight, {
      toValue: dropdownVisible ? 0 : 150, // Increased height for content and delete button
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const buttonTranslateY = dropdownAnimMobile.interpolate({
    inputRange: [-dropdownHeightMobile, 0],
    outputRange: [0, dropdownHeightMobile],
  });

  const toggleDropdownMobile = () => {
    const toValue = dropdownVisibleMobile ? -dropdownHeightMobile : 0;
    Animated.timing(dropdownAnimMobile, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setDropdownVisibleMobile(!dropdownVisibleMobile);
  };


  const sortItems = (text: string) => {
    let sorted = [...items];
  
    if (text === 'alphabetical') {
      sorted.sort((a, b) => a.food_name.localeCompare(b.food_name));
    } else if (text === 'quantity') {
      sorted.sort((a, b) => b.quantity - a.quantity);
    } else if (text === 'completed') {
      sorted.sort((a, b) => Number(b.isBought) - Number(a.isBought));
    }
    const newFilteredItems = searchText.trim() === '' 
      ? sorted 
      : sorted.filter(item =>
          item.food_name.toLowerCase().includes(searchText.toLowerCase())
          //|| item.description.toLowerCase().includes(searchText.toLowerCase())
        );

    setItems(sorted);
    setFilteredItems(newFilteredItems);
  };
  
  function handleExportCSV(items: GroceryListItem[]) {
    if (Platform.OS === 'web') {
      exportGroceryListToCSVWeb(items);
    } else {
      exportGroceryListToCSV(items);
    }
  }
  
  function handleExportPDF(items: GroceryListItem[]) {
    if (Platform.OS === 'web') {
      exportGroceryListToPDFWeb(items, groceryListTitle, groceryListDescription);
    } else {
      exportGroceryListToPDF(items, groceryListTitle, groceryListDescription);
    }
  }

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  if(width > 1100){

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={{marginHorizontal: (screenWidth * 0.17) > 350 ? screenWidth * 0.17: 350, top: 15, alignContent:'center', flex: 1}}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{fontFamily: 'inter-bold', fontSize: 20, color: '#007bff', marginBottom: 20, paddingRight: 10}}>Search: </Text>
        <TextInput
          style={styles.searchInput}
          placeholder=" . . . "
          value={searchText}
          onChangeText={filterItems}
        />
        <Pressable style={[styles.topBarButton, {marginHorizontal: 40, marginBottom: 18 }]} onPress={onFABPress}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AntDesign name="plus" size={15} color="#007bff"  />
            {width > 1800 && (
              <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                Add New Item
              </Text>
            )}
          </View>
        </Pressable>
      </View>
        
        <View style={[styles.mainContent, { flexDirection: smallScreen ? 'column' : 'row', flex: 1 }]}>
          {/* Left column (fixed position) */}

          {/* Right column (scrollable list) */}
          <View style={[styles.listContainer, {flex: 1}]}>
            <FlatList
              data={filteredItems} // Use filtered items based on search
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              key={numColumns}
              numColumns={numColumns}
              contentContainerStyle={[styles.listContent, { paddingBottom: 260 }]}
              showsHorizontalScrollIndicator={false}
            />
          </View>

        </View>
      
      </View>
      
      <ScrollView style={[styles.leftSideBar, {height: height - 100, width: width * 0.15, minWidth: 300}]}>  
          {/* Box with text */}
          <View style={styles.textBox}>
            <Text style={styles.textBoxTitle}>{groceryListTitle}</Text>
            <Text style={styles.textBoxContent}>Created: {groceryListDate}</Text>
          </View>


          {/* Buttons below the text input */}
          <View style={styles.buttonsContainer}>
            <Pressable style={styles.sidebarButton} onPress={toggleCompletion}>
              <Text style={styles.buttonText}>{groceryListCompletion ? 'Mark as Incomplete' : 'Mark as Done'}</Text>
            </Pressable>
              <Pressable style={styles.sidebarButton} onPress={handleDeleteList}>
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
            <Pressable style={styles.sidebarButton} onPress={() => setExportModalVisible(true)}>
              <Text style={styles.buttonText}>Export</Text>
            </Pressable>
            <Pressable style={styles.sidebarButton} onPress={() => setSortModalVisible(true)}>
              <Text style={styles.buttonText}>Sort By</Text>
            </Pressable>
          </View>


        {/* Large Text Input below the text box */}
          <TextInput
              style={[styles.largeTextInput, {height: height - 750, minHeight: 100}]}
              placeholder="Grocery List Description..."
              value={groceryListDescription}
              onChangeText={setGroceryListDescription}
              onBlur={() => onDescriptionChange(groceryListDescription)}
              multiline={true}
          />

          <Text style={{fontFamily: 'inter-bold', fontSize: 30, color: '#39913b', marginTop: 20}}>Transfer to Pantry: </Text>
            
          <FoodDropdownComponent onValueChange={setSelectedFood} />
          <Pressable
            style={[styles.sidebarButton, styles.transferButton]}
            onPress={async () => {
              if (selectedFood) {
                await addGroceryListItem(groceryListId, selectedFood.value, selectedFood.label);
                const newFood = await fetchGroceryListByID(groceryListId);
                if(newFood){
                  setItems(newFood.grocery_list_items);
                  setFilteredItems(newFood.grocery_list_items);
                  setSearchText('');
                  setSelectedFood(null);
                }
              } else {
                alert('Please select a food item first.');
              }
            }}
          >
            <Text style={[styles.buttonText, { fontSize: 28, color: '#39913b' }]}>
              Transfer
            </Text>
          </Pressable>
  
      </ScrollView>

      <ScrollView style={[styles.rightSideBar, {height: height - 100, width: width * 0.15, minWidth: 300}]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
        <Text style={{ fontFamily: 'inter-bold', fontSize: 30, color: '#007bff' }}>
          Grocery List Value
        </Text>
        <AntDesign name="right" size={30} color="#007bff" style={{ marginLeft: 8 }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
        <Text style={{ fontFamily: 'inter-bold', fontSize: 30, color: '#007bff' }}>
          Summary
        </Text>
        <AntDesign name="right" size={30} color="#007bff" style={{ marginLeft: 8 }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
        <Text style={{ fontFamily: 'inter-bold', fontSize: 30, color: '#007bff' }}>
          Settings
        </Text>
        <AntDesign name="right" size={30} color="#007bff" style={{ marginLeft: 8 }} />
      </View>
      </ScrollView> 


    {/* Modals below (primarily for clicking on buttons*/}


    <Modal
      transparent={true}
      visible={sortModalVisible}
      animationType="fade"
      onRequestClose={() => setSortModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sort By</Text>
          <ScrollView contentContainerStyle={styles.scrollContainer} horizontal={smallScreen ? false : true}>
            <TouchableOpacity 
              style={[styles.sortByButton]} 
              onPress={() => { sortItems('alphabetical'); setSortModalVisible(false); }}>
              <Text style={styles.buttonText}>Alphabetical</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortByButton]} 
              onPress={() => { sortItems('quantity'); setSortModalVisible(false); }}>
              <Text style={styles.buttonText}>Quantity</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortByButton]} 
              onPress={() => { sortItems('completed'); setSortModalVisible(false); }}>
              <Text style={styles.buttonText}>Completed</Text>
            </TouchableOpacity>
          </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSortModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>

    <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <FoodDropdownComponent onValueChange={setSelectedFood} />
            <Pressable 
              style={styles.modalButton}
              onPress={async () => {
                if (selectedFood) {
                  await addGroceryListItem(groceryListId, selectedFood.value, selectedFood.label);
                  const newFood = await fetchGroceryListByID(groceryListId);
                  if(newFood){
                    setItems(newFood.grocery_list_items);
                    setFilteredItems(newFood.grocery_list_items);
                    setSearchText('');
                    setSelectedFood(null);
                  }
                  closeModal();
                } else {
                  alert('Please select a food item first.');
                }
            }}>
              <Text style={styles.buttonText}>Add Item</Text>
            </Pressable>
            <View
              style={{
                borderBottomColor: 'white',
                borderBottomWidth: StyleSheet.hairlineWidth,
                alignSelf: 'stretch',
                marginBottom: 10
              }}
            />
            <Pressable onPress={toggleDropdown} style={styles.modalButton}>
              <Text style={styles.buttonText}>Add Custom Item</Text>
            </Pressable>
            {/* Animated dropdown */}
            <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
              {/* Conditionally hide the content based on dropdown visibility */}
              <View>
                <TextInput
                  style={styles.customInputField}
                  placeholder="Enter name"
                  value={customName}
                  onChangeText={setCustomName} // setName should be defined with useState
                />
                <TextInput
                  style={styles.customInputField}
                  placeholder="Enter description"
                  value={customDescription}
                  onChangeText={setCustomDescription} // setDescription should be defined with useState
                />
                <Pressable onPress={addCustomItem} style={styles.modalButton}>
                    <Text style={styles.buttonText}>Submit</Text>
                </Pressable>
              </View>
            </Animated.View>

            <Pressable style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    
      <Modal
        visible={productModalVisible}     
        transparent={true}               
        animationType= "fade"          
        onRequestClose={closeProductModal} 
      >
        <View style={styles.modalOverlay}>
          <View>
              {/* Circular Close Button */}
              <Pressable onPress={closeProductModal} style={styles.closeButtonModal}>
                  <Text style={styles.closeButtonTextModal}>✕</Text>
              </Pressable>

              {/* Only render ProductPage if we have a selectedFoodId */}
              {selectedFoodId && (
                  <ScrollView style={{ flex: 1 }}>
                      <ProductPage foodId={selectedFoodId} />
                  </ScrollView>
              )}
          </View>
        </View>
      </Modal>
      <Modal
          transparent={true}
          visible={exportModalVisible}
          animationType="fade"
          onRequestClose={() => setExportModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Export Options</Text>
              <Pressable style={styles.modalButton} onPress={() => handleExportPDF(items)}>
                <Text style={styles.buttonText}>Export as PDF</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={() => handleExportCSV(items)}>
                <Text style={styles.buttonText}>Export as CSV</Text>
              </Pressable>
              <Pressable style={styles.closeButton} onPress={() => setExportModalVisible(false)}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
  }
  else{
    return (
      <SafeAreaView style={styles.container}>
      {/* Animated Dropdown - positioned above the sticky button */}
      <View style={{ flex: 1, marginHorizontal: 10, marginTop: 65 }}>
        <FlatList
          style={{ flex: 1, paddingHorizontal: 10 }}
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          // No marginTop or marginHorizontal
          // If you want an empty-state message:
          ListEmptyComponent={<Text>No items available</Text>}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <Animated.View
        style={[
          styles.dropdownMobile,
          { position: 'absolute', height: dropdownHeightMobile, width: width, justifyContent: 'center', alignItems: 'center',  transform: [{ translateY: dropdownAnimMobile }] },
        ]}
      >
        <ScrollView contentContainerStyle={[styles.dropdownScrollMobile, {width: width - 40, marginTop: 20}]} showsHorizontalScrollIndicator={false}>
          <View style={styles.textBox}>
            <Text style={styles.textBoxTitle}>{groceryListTitle}</Text>
            <Text style={styles.textBoxContent}>Created: {groceryListDate}</Text>
          </View>


          {/* Buttons below the text input */}
          <View style={styles.buttonsContainer}>
            <Pressable style={styles.sidebarButton} onPress={toggleCompletion}>
              <Text style={styles.buttonText}>{groceryListCompletion ? 'Mark as Incomplete' : 'Mark as Done'}</Text>
            </Pressable>
              <Pressable style={styles.sidebarButton} onPress={handleDeleteList}>
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
            <Pressable style={styles.sidebarButton} onPress={() => setExportModalVisible(true)}>
              <Text style={styles.buttonText}>Export</Text>
            </Pressable>
            <Pressable style={styles.sidebarButton} onPress={() => setSortModalVisible(true)}>
              <Text style={styles.buttonText}>Sort By</Text>
            </Pressable>
          </View>
          <TextInput
              style={[styles.largeTextInput, {height: height - 750, minHeight: 100}]}
              placeholder="Grocery List Description..."
              value={groceryListDescription}
              onChangeText={setGroceryListDescription}
              onBlur={() => onDescriptionChange(groceryListDescription)}
              multiline={true}
          />
          <Text style={{fontFamily: 'inter-bold', fontSize: 30, color: '#39913b', marginTop: 20}}>Transfer to Pantry: </Text>
            
          <FoodDropdownComponent onValueChange={setSelectedFood} />
          <Pressable
            style={[styles.sidebarButton, styles.transferButton]}
            onPress={async () => {
              if (selectedFood) {
                await addGroceryListItem(groceryListId, selectedFood.value, selectedFood.label);
                const newFood = await fetchGroceryListByID(groceryListId);
                if(newFood){
                  setItems(newFood.grocery_list_items);
                  setFilteredItems(newFood.grocery_list_items);
                  setSearchText('');
                  setSelectedFood(null);
                }
              } else {
                alert('Please select a food item first.');
              }
            }}
          >
            <Text style={[styles.buttonText, { fontSize: 28, color: '#39913b' }]}>
              Transfer
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>

      {/* Animated Sticky Button */}
      <AnimatedPressable
        style={[styles.stickyButton, { transform: [{ translateY: buttonTranslateY }] }]}
        onPress={toggleDropdownMobile}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AntDesign
            name={dropdownVisibleMobile ? 'up' : 'down'}
            size={16}
            color="#007bff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Toggle Dropdown</Text>
          <AntDesign
            name={dropdownVisibleMobile ? 'up' : 'down'}
            size={16}
            color="#007bff"
            style={{ marginLeft: 8 }}
          />
        </View>
      </AnimatedPressable>
      
      <Animated.View style={[styles.floatingButton, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable onPress={onFABPress}>
          <AntDesign name="plus" size={24} color="white" />
        </Pressable>
      </Animated.View>

      <Modal
      transparent={true}
      visible={sortModalVisible}
      animationType="fade"
      onRequestClose={() => setSortModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sort By</Text>
          <ScrollView contentContainerStyle={styles.scrollContainer} horizontal={smallScreen ? false : true}>
            <TouchableOpacity 
              style={[styles.sortByButton]} 
              onPress={() => { sortItems('alphabetical'); setSortModalVisible(false); }}>
              <Text style={styles.buttonText}>Alphabetical</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortByButton]} 
              onPress={() => { sortItems('quantity'); setSortModalVisible(false); }}>
              <Text style={styles.buttonText}>Quantity</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortByButton]} 
              onPress={() => { sortItems('completed'); setSortModalVisible(false); }}>
              <Text style={styles.buttonText}>Completed</Text>
            </TouchableOpacity>
          </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSortModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>

    <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <FoodDropdownComponent onValueChange={setSelectedFood} />
            <Pressable 
              style={styles.modalButton}
              onPress={async () => {
                if (selectedFood) {
                  await addGroceryListItem(groceryListId, selectedFood.value, selectedFood.label);
                  const newFood = await fetchGroceryListByID(groceryListId);
                  if(newFood){
                    setItems(newFood.grocery_list_items);
                    setFilteredItems(newFood.grocery_list_items);
                    setSearchText('');
                    setSelectedFood(null);
                  }
                  closeModal();
                } else {
                  alert('Please select a food item first.');
                }
            }}>
              <Text style={styles.buttonText}>Add Item</Text>
            </Pressable>
            <View
              style={{
                borderBottomColor: 'white',
                borderBottomWidth: StyleSheet.hairlineWidth,
                alignSelf: 'stretch',
                marginBottom: 10
              }}
            />
            <Pressable onPress={toggleDropdown} style={styles.modalButton}>
              <Text style={styles.buttonText}>Add Custom Item</Text>
            </Pressable>
            {/* Animated dropdown */}
            <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
              {/* Conditionally hide the content based on dropdown visibility */}
              <View>
                <TextInput
                  style={styles.customInputField}
                  placeholder="Enter name"
                  value={customName}
                  onChangeText={setCustomName} // setName should be defined with useState
                />
                <TextInput
                  style={styles.customInputField}
                  placeholder="Enter description"
                  value={customDescription}
                  onChangeText={setCustomDescription} // setDescription should be defined with useState
                />
                <Pressable onPress={addCustomItem} style={styles.modalButton}>
                    <Text style={styles.buttonText}>Submit</Text>
                </Pressable>
              </View>
            </Animated.View>

            <Pressable style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={productModalVisible}     
        transparent={true}               
        animationType= "fade"          
        onRequestClose={closeProductModal} 
      >
        <View style={styles.modalOverlay}>
          <View>
              {/* Circular Close Button */}
              <Pressable onPress={closeProductModal} style={styles.closeButtonModal}>
                  <Text style={styles.closeButtonTextModal}>✕</Text>
              </Pressable>

              {/* Only render ProductPage if we have a selectedFoodId */}
              {selectedFoodId && (
                  <ScrollView style={{ flex: 1 }}>
                      <ProductPage foodId={selectedFoodId} />
                  </ScrollView>
              )}
          </View>
        </View>
      </Modal>
      <Modal
          transparent={true}
          visible={exportModalVisible}
          animationType="fade"
          onRequestClose={() => setExportModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Export Options</Text>
              <Pressable style={styles.modalButton} onPress={() => handleExportPDF(items)}>
                <Text style={styles.buttonText}>Export as PDF</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={() => handleExportCSV(items)}>
                <Text style={styles.buttonText}>Export as CSV</Text>
              </Pressable>
              <Pressable style={styles.closeButton} onPress={() => setExportModalVisible(false)}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F2',
  },
  scrollContainer: {
    flexGrow: 1, // Allow the scroll view to grow and fill the available space
    marginHorizontal: 100
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
    color: '#007bff'
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
    borderWidth: 2,
    backgroundColor: 'white'
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1e81b0',
    padding: 20,
    borderRadius: 8,
    width: '30%',
    minWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#e2e6ea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 10,
    marginBottom: 20,
    backgroundColor: 'white',
    fontSize: 15,
    width: 300
  },
  textBox: {
    backgroundColor: '#c4c4c4',
    padding: 15,
    borderRadius: 8,
  },
  textBoxTitle: {
    fontSize: 16,
    fontFamily: 'inter-bold',
    marginBottom: 5,
  },
  textBoxContent: {
    fontSize: 14,
    fontFamily: 'inter-bold',
    color: '#555',
  },
  largeTextInput: {
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 8,
    paddingLeft: 10,
    paddingTop: 10,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    fontSize: 18
  },
  buttonsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  sidebarButton: {
    backgroundColor: '#e2e6ea', // Blue color for Mark as Done
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderStyle: 'solid',
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Add space between buttons
    borderColor: '#007bff',
  },
  topBarButton: {
    backgroundColor: '#e2e6ea', // Blue color for Mark as Done
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderStyle: 'solid',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Add space between buttons
    borderColor: '#007bff',
  },
  sortByButton: {
    backgroundColor: '#1e81b0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Add space between buttons
  },
  buttonText: {
    color: '#007bff',
    fontFamily: 'inter-bold',
    textAlign: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Add some space below description
  },
  itemTextInput: {
    height: 25,
    width: 50, // Make the text input 40% of the width of the item
    minWidth: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 5,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
    backgroundColor: '#FFFFFF'
  },
  itemButton: {
    backgroundColor: '#007bff',
    paddingVertical: 3,
    paddingHorizontal: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5, // Add some spacing between the buttons
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
    fontSize: 20,
    textAlign: 'center',
    paddingBottom: 4
  },
  completedItem: {
    flex: 1,
    backgroundColor: '#94d38f', // Light green
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    backgroundColor: '#e2e6ea', // Light blue
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 5,
    minHeight: 150,
    alignItems: 'flex-start',
  },
  picker: {
    minWidth: 80,
    height: 25,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 5,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
    backgroundColor: '#FFFFFF'
  },
  completeButton: {
    backgroundColor: '#cd2525'
  },
  incompleteButton: {
    backgroundColor: '#227730'
  },
  closeButton: { 
    marginTop: 10,
    padding: 10, 
    backgroundColor: '#d9534f', 
    borderRadius: 5 
  },
  closeButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  customInputField: {
    height: 40,
    borderColor: '#ccc',
    backgroundColor: 'white',
    borderWidth: 1,
    marginBottom: 3,
    marginTop: 3,
    paddingLeft: 8,
    borderRadius: 4,
  },
  dropdown: {
    overflow: 'hidden',
    marginTop: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  measurementDropdown: {
    backgroundColor: 'white',
    height: 25,
    width: 55,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 5
  },
  measurementContainer: {
    height: 38
  },
  measurementText: {
    textAlign: 'left',
  },
  leftSideBar: {
    position: 'absolute',
    top: 15,
    left: 15,
    padding: 20,
    zIndex: 999, // Ensure it stays on top of other content
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    width: 400,
  },
  rightSideBar: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 20,
    zIndex: 999, // Ensure it stays on top of other content
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    width: 400,
  },
  transferButton: {
    marginTop: 10,
    borderColor: '#39913b',
    height: 60, 
    backgroundColor: '#e0e9e0'
  },
  stickyButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 15,
    alignItems: 'center',
    zIndex: 999, // higher than dropdown and list
    borderColor: '#007bff',
    backgroundColor: 'white',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 25,  // adjust value for more/less curvature
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  dropdownMobile: {
    backgroundColor: 'white',
    zIndex: 1000,
    flex: 1
  },
  dropdownScrollMobile: {
    flex: 1
  },
  closeButtonModal: {
    position: 'absolute',
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 25, // Makes it circular
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  closeButtonTextModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  }

});

export default GroceryList;
