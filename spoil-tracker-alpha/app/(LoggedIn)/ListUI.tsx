import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWindowDimensions, Animated, View, Text, StyleSheet, FlatList, SafeAreaView, Pressable, Image, Dimensions, TextInput, ScrollView, Modal, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // For the plus icon
import { useLocalSearchParams, useGlobalSearchParams, Link } from 'expo-router';
import { useNavigation } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import { v4 as uuidv4 } from 'uuid';
import FoodDropdownComponent from '@/components/Food/FoodDropdown';
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
  updateGroceryListItemIsBought,
  updateGroceryListIsShared,
  convertToPantry,
  fetchGroceryListPricing
} from '@/components/GroceryList/GroceryListService';
import { exportGroceryListToCSV,exportGroceryListToCSVWeb, exportGroceryListToPDF, exportGroceryListToPDFWeb } from '@/components/ExportService';
import ProductPage from '@/components/Food/FoodUI';
import { useAuth } from '@/services/authContext';
import { getAccountByOwnerID } from '@/components/Account/AccountService';
import { useTheme } from 'react-native-paper';
import { addCopiedGroceryList } from '@/components/Community/CommunityService';
import { OpenAI } from '@/openAIAPI';
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { decrementBought, incrementBought } from '@/components/Food/FoodLeaderboardService';
import PantryDropdownComponent from '@/components/Pantry/PantryDropdown';

// list used for the dropdown located with each grocery list item in the flatlist
const FOOD_UNITS = [
  { label: 'mg', value: 'mg' },
  { label: 'g', value: 'g' },
  { label: 'kg', value: 'kg' },
  { label: 'lb', value: 'lb' },
  { label: 'L', value: 'L' },
  { label: 'mL', value: 'mL' },
  { label: 'unit', value: 'unit' },
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
  const [groceryListCompletion, setGroceryListCompletion] =
    useState<boolean>(false); // Grocery List Completion status
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
  const [selectedPantryId, setSelectedPantryId] = useState<string | null>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const { user } = useAuth();
  const [groceryListValueOpen, setGroceryListValueOpen] = useState(false);
  const groceryListValueAnim = useRef(new Animated.Value(0)).current;
  const [summaryOpen, setSummaryOpen] = useState(false);
  const summaryAnim = useRef(new Animated.Value(0)).current;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsAnim = useRef(new Animated.Value(0)).current;
  const [groceryListShared, setGroceryListShared] = useState(false);
  const [groceryListValue, setGroceryListValue] = useState<string | null>(null);
  const [loadingValue, setLoadingValue] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  


  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  const { colors } = useTheme(); // allows for dark mode contributed by Kevin

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
          setGroceryListShared(snapshot.isShared || false);
          setGroceryListCompletion(snapshot.isComplete || false);
          console.log('Fetched grocery list:', snapshot);
        }
      } catch (error) {
        console.error('Error fetching grocery list data:', error);
      }
    };
    
    const fetchAccountId = async () => {
      if (user) {
        const account = await getAccountByOwnerID(user.uid);
        setAccountId(account.id);
      }
    };

    fetchAccountId();
    fetchGroceryList();
    Dimensions.addEventListener('change', onChange);

  }, [groceryListId, user]);

  if (!accountId) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  const toggleShared = async () => {
    try {
    const updated = await updateGroceryListIsShared(groceryListId, !groceryListShared);
    setGroceryListShared(updated.isShared);
    alert(updated.isShared ? "List is now shared" : "List is now private");
    } catch (error) {
    console.error("Error toggling shared status:", error);
    alert("Failed to toggle shared status.");
    }
  };

  /**
   * Groups the grocery items by name and returns an array of lines
   * to display in the summary dropdown.
   *
   * For example, if "Eggs" appear twice (24 units, 1 lb) and "Tomatoes" appear once (10 kg),
   * it might return lines like:
   * [
   *   "Eggs - - - - - - - - - 24 units",
   *   "                     1 lb",
   *   "Tomatoes - - - - - - - 10 kg"
   * ]
   */
  function buildSummaryElements(items: GroceryListItem[]): React.ReactNode[] {
    const grouped: Record<string, GroceryListItem[]> = {};
  
    // Group items by food_name
    items.forEach((item) => {
      if (!grouped[item.food_name]) {
        grouped[item.food_name] = [];
      }
      grouped[item.food_name].push(item);
    });
  
    const elements: React.ReactNode[] = [];
    for (const name in grouped) {
      const itemGroup = grouped[name];
      itemGroup.forEach((item, index) => {
        elements.push(
          <View key={`${name}-${index}`} style={styles.summaryLine}>
            {/* Only show the name on the first line */}
            {index === 0 ? (
              <Text style={styles.summaryName}>{name}</Text>
            ) : (
              <Text style={styles.summaryName} />
            )}
            <Text style={styles.summaryUnits}>
              {item.quantity} {item.measurement}
            </Text>
          </View>
        );
      });
    }
    return elements;
  }

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
      const success = await addGroceryListItem(groceryListId, accountId, newItem.food_global_id, newItem.food_name);
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
        item.food_name.toLowerCase().includes(text.toLowerCase()) ||
        item.description.toLowerCase().includes(text.toLowerCase())
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
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
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
      const willBeBought = !item.isBought;
      const updatedItems = items.map(i =>
        i.id === item.id ? { ...i, isBought: willBeBought } : i
      );
      const updatedFilterItems = filteredItems.map(i =>
        i.id === item.id ? { ...i, isBought: willBeBought } : i
      );
      setItems(updatedItems);
      setFilteredItems(updatedFilterItems);
    
      await updateGroceryListItemIsBought(groceryListId, item.id);

      try {
        if (willBeBought) {
          await incrementBought(item.food_global_id, accountId);
        } else {
          await decrementBought(item.food_global_id, accountId);
        }
      } catch (error) {
        console.error('Failed to update FoodLeaderboard:', error);
      }
    

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

    {
      /* Allows users to give a 5 star rating to their items CONTRIBUTED BY KEVIN */
    }

    /*
    const handleRatingChange = async (rating: number) => {
      const updatedItems = items.map((i) =>
        i.id === item.id ? { ...i, rating } : i
      );

      try {
        await updateDoc(docRef, { items: updatedItems });
        setItems(updatedItems);
      } catch (error) {
        console.error('Error updating rating:', error);
      }
    };
    */

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
              renderItem={renderItemDropdown}
            />
            <Pressable style={[styles.itemButton, item.isBought ? styles.completeButton: styles.incompleteButton]} onPress={toggleCompleteStatus}>
              <Text style={styles.itemButtonText}>{item.isBought ? 'X' : '✔'}</Text>
            </Pressable>
            <Pressable style={styles.minusButton} onPress={deleteItem}>
              <Text style={styles.minusButtonText}>-</Text>
            </Pressable>
          </View>
          {/* allows for ratings contributed by Kevin */}
          {/*
          <Rating
            startingValue={item.rating || 0} // Default to 0 if no rating exists
            imageSize={20} // Adjust star size
            onFinishRating={handleRatingChange}
            style={{ marginTop: 10, alignSelf: 'flex-start' }}
          />
          */}
        </View>
        <Image source={item.imageUrl ? { uri: item.imageUrl } : undefined} style={styles.unitImage} />
      </View>
    );
  };

  const smallScreen = screenWidth < 690;
  const numColumns = width > 1420 ? 2 : 1;

  const toggleDropdownAnimated = (
    open: boolean, 
    animRef: Animated.Value, 
    setOpen: (open: boolean) => void, 
    targetHeight: number
  ) => {
    Animated.timing(animRef, {
      toValue: open ? 0 : targetHeight,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setOpen(!open);
  };

  const toggleGroceryListValue = () => {
    // Toggle the open state
    toggleDropdownAnimated(groceryListValueOpen, groceryListValueAnim, setGroceryListValueOpen, 200);
    
    // Optionally trigger calculation when opening the dropdown
    if (!groceryListValue && !loadingValue) {
      calculateGroceryListValue();
    }
  };

  const renderItemDropdown = (item: { label: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => {
    return (
      <View style={{ padding: 10, backgroundColor: 'transparent' }}>
        <Text style={{ color: '#000', fontSize: 16 }}>
          {item.label}
        </Text>
      </View>
    );
  };
  
  const toggleSummary = () => {
    Animated.timing(summaryAnim, {
      toValue: summaryOpen ? 0 : 400,
      duration: 300,
      useNativeDriver: false, // must be false for height animations
    }).start();
    setSummaryOpen(!summaryOpen);
  };
  
  const toggleSettings = () => {
    toggleDropdownAnimated(settingsOpen, settingsAnim, setSettingsOpen, 100);
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
      useNativeDriver: false,
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
          || item.description.toLowerCase().includes(searchText.toLowerCase())
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

  const parsePricingResult = (result: string) => {
    // Split the result by newline
    const lines = result.split('\n').filter(line => line.trim().length > 0);
    return lines.map((line, index) => {
      // Split by colon to separate store name and price
      const [store, price] = line.split(':');
      return (
        <View key={index} style={styles.pricingLine}>
          <Text style={styles.pricingStore}>{store.trim()}:</Text>
          <Text style={styles.pricingPrice}>{price?.trim()}</Text>
        </View>
      );
    });
  };

  const calculateGroceryListValue = async () => {
    // Create an instance of the OpenAI client with your API key.
    const openAIClient = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_KEY });
    
    // Create a summary of grocery items
    const itemsSummary = items
      .map(item => `${item.food_name} (x${item.quantity} ${item.measurement})`)
      .join(', ');
    
    // Build your prompt for pricing analysis
    const prompt = `Calculate the estimated value for the following grocery list items: ${itemsSummary}. Provide the prices for Walmart, Target, Albertsons, and Vons with a total estimation.`;
  
    setLoadingValue(true);
    try {
      // Call the new pricingAnalysis method
      const pricingResult = await fetchGroceryListPricing(groceryListId);
      setGroceryListValue(pricingResult);
    } catch (error) {
      console.error('Error calculating grocery list value:', error);
      setGroceryListValue('Error calculating value.');
    }
    setLoadingValue(false);
  };  

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
            
          <PantryDropdownComponent
              accountId={accountId} 
              onValueChange={setSelectedPantryId}  />
          <Pressable
            style={[styles.sidebarButton, styles.transferButton]}
            onPress={async () => {
              if (selectedPantryId) {
                await convertToPantry(groceryListId, selectedPantryId);
              } else {
                alert('Please select a pantry first.');
              }
            }}
          >
            <Text style={[styles.buttonText, {fontSize: 28, color: '#39913b' }]}>
              Transfer
            </Text>
          </Pressable>
  
      </ScrollView>

      <ScrollView style={[styles.rightSideBar, {height: height - 100, width: width * 0.15, minWidth: 300}]}>
        {/* Grocery List Value Dropdown */}
        <Pressable onPress={toggleGroceryListValue} style={styles.dropdownHeaderRight}>
          <Text style={styles.dropdownHeaderTextRight}>Grocery List Value</Text>
          <AntDesign name={groceryListValueOpen ? 'up' : 'down'} size={30} color="#007bff" style={{ marginLeft: 8 }} />
        </Pressable>
        <Animated.View style={[styles.dropdownContentRight, { height: groceryListValueAnim }]}>
        <ScrollView showsHorizontalScrollIndicator={false}>
          {loadingValue ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            groceryListValue
              ? parsePricingResult(groceryListValue)
              : <Text style={styles.dropdownContentText}>
                  Press the button below to calculate value
                </Text>
          )}
          <Pressable onPress={calculateGroceryListValue} style={[styles.sidebarButton, { marginTop: 10 }]}>
            <Text style={styles.buttonText}>Calculate Value</Text>
          </Pressable>
        </ScrollView>
        </Animated.View>

        {/* Summary Dropdown */}
        <Pressable onPress={toggleSummary} style={styles.dropdownHeaderRight}>
          <Text style={styles.dropdownHeaderTextRight}>Summary</Text>
          <AntDesign name={summaryOpen ? 'up' : 'down'} size={30} color="#007bff" style={{ marginLeft: 8 }} />
        </Pressable>
        <Animated.View style={[styles.dropdownContentRight, { height: summaryAnim,  }]}>
          <ScrollView>
            {buildSummaryElements(items)}
          </ScrollView>
        </Animated.View>

        {/* Settings Dropdown */}
        <Pressable onPress={toggleSettings} style={styles.dropdownHeaderRight}>
          <Text style={styles.dropdownHeaderTextRight}>Settings</Text>
          <AntDesign name={settingsOpen ? 'up' : 'down'} size={30} color="#007bff" style={{ marginLeft: 8 }} />
        </Pressable>
        <Animated.View style={[styles.dropdownContentRight, { height: settingsAnim }]}>
          <Pressable onPress={toggleShared} style={styles.sharedToggleButton}>
            <Text style={styles.sharedToggleText}>Shared: {groceryListShared ? "Yes" : "No"}</Text>
          </Pressable>
        </Animated.View>
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
            <FoodDropdownComponent 
              accountId={accountId} 
              onValueChange={setSelectedFood}  />
            <Pressable 
              style={styles.modalButton}
              onPress={async () => {
                if (selectedFood) {
                  await addGroceryListItem(groceryListId, accountId, selectedFood.value, selectedFood.label);
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
            <Pressable 
              style={styles.modalButton}
              onPress={closeModal}>
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
                  <ScrollView style={{ flex: 1 } } showsHorizontalScrollIndicator={false}>
                      <ProductPage foodId={selectedFoodId} accountId={accountId} />
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
              <Pressable
                style={styles.modalButton}
                onPress={async () => {
                  try {
                    await addCopiedGroceryList(groceryListId);
                    alert("Copied grocery list added to community feed");
                    setExportModalVisible(false);
                  } catch (error) {
                    console.error("Error copying grocery list", error);
                    alert("Error copying grocery list");
                  }
                }}
              >
                <Text style={styles.buttonText}>Copy to Community</Text>
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
          { overflow: 'visible', position: 'absolute', height: 400, width: width, justifyContent: 'center', alignItems: 'center',  transform: [{ translateY: dropdownAnimMobile }] },
        ]}
      >
        <ScrollView contentContainerStyle={[styles.dropdownScrollMobile, {flexGrow: 1, width: width - 40, marginTop: 20}]} alwaysBounceVertical={true} showsHorizontalScrollIndicator={false} scrollEnabled={true}>
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
            
          <FoodDropdownComponent 
              accountId={accountId} 
              onValueChange={setSelectedFood}  />
          <Pressable
            style={[styles.sidebarButton, styles.transferButton]}
            onPress={async () => {
              if (selectedFood) {
                await addGroceryListItem(groceryListId, accountId, selectedFood.value, selectedFood.label);
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

        {/* Add your new circular floating info button */}
      <Animated.View style={styles.infoFloatingButton}>
        <Pressable onPress={() => setInfoModalVisible(true)}>
          {/* Use an info icon from AntDesign (infocirlceo) */}
          <AntDesign name="infocirlceo" size={24} color="white" />
        </Pressable>
      </Animated.View>

      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Information</Text>
            <ScrollView style={[styles.infoTab]}>
              {/* Grocery List Value Dropdown */}
              <Pressable onPress={toggleGroceryListValue} style={styles.dropdownHeaderRight}>
                <Text style={styles.dropdownHeaderTextRight}>Grocery List Value</Text>
                <AntDesign name={groceryListValueOpen ? 'up' : 'down'} size={30} color="#007bff" style={{ marginLeft: 8 }} />
              </Pressable>
              <Animated.View style={[styles.dropdownContentRight, { height: groceryListValueAnim }]}>
              <ScrollView showsHorizontalScrollIndicator={false}>
                {loadingValue ? (
                  <ActivityIndicator size="small" color="#007bff" />
                ) : (
                  groceryListValue
                    ? parsePricingResult(groceryListValue)
                    : <Text style={styles.dropdownContentText}>
                        Press the button below to calculate value
                      </Text>
                )}
                <Pressable onPress={calculateGroceryListValue} style={[styles.sidebarButton, { marginTop: 10 }]}>
                  <Text style={styles.buttonText}>Calculate Value</Text>
                </Pressable>
              </ScrollView>
              </Animated.View>

              {/* Summary Dropdown */}
              <Pressable onPress={toggleSummary} style={styles.dropdownHeaderRight}>
                <Text style={styles.dropdownHeaderTextRight}>Summary</Text>
                <AntDesign name={summaryOpen ? 'up' : 'down'} size={30} color="#007bff" style={{ marginLeft: 8 }} />
              </Pressable>
              <Animated.View style={[styles.dropdownContentRight, { height: summaryAnim,  }]}>
                <ScrollView>
                  {buildSummaryElements(items)}
                </ScrollView>
              </Animated.View>

              {/* Settings Dropdown */}
              <Pressable onPress={toggleSettings} style={styles.dropdownHeaderRight}>
                <Text style={styles.dropdownHeaderTextRight}>Settings</Text>
                <AntDesign name={settingsOpen ? 'up' : 'down'} size={30} color="#007bff" style={{ marginLeft: 8 }} />
              </Pressable>
              <Animated.View style={[styles.dropdownContentRight, { height: settingsAnim }]}>
                <Pressable onPress={toggleShared} style={styles.sharedToggleButton}>
                  <Text style={styles.sharedToggleText}>Shared: {groceryListShared ? "Yes" : "No"}</Text>
                </Pressable>
              </Animated.View>
            </ScrollView> 
            <Pressable
              style={styles.modalButton}
              onPress={() => setInfoModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
            <FoodDropdownComponent 
              accountId={accountId} 
              onValueChange={setSelectedFood}  />
            <Pressable 
              style={styles.modalButton}
              onPress={async () => {
                if (selectedFood) {
                  await addGroceryListItem(groceryListId, accountId, selectedFood.value, selectedFood.label);
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <SafeAreaView style={{ flex: 1 }}>
            <Pressable onPress={closeProductModal} style={styles.closeButtonModal}>
              <Text style={styles.closeButtonTextModal}>✕</Text>
            </Pressable>
            {/* Only render ProductPage if we have a selectedFoodId */}
            {selectedFoodId && (
              <ScrollView
                contentContainerStyle={
                {flexGrow: 1, paddingBottom: 20 }}
                showsHorizontalScrollIndicator={false}
              >
                  <ProductPage foodId={selectedFoodId} accountId={accountId} />
              </ScrollView>
            )}
          </SafeAreaView>
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
              <Pressable
                style={styles.modalButton}
                onPress={async () => {
                  try {
                    await addCopiedGroceryList(groceryListId);
                    alert("Copied grocery list added to community feed");
                    setExportModalVisible(false);
                  } catch (error) {
                    console.error("Error copying grocery list", error);
                    alert("Error copying grocery list");
                  }
                }}
              >
                <Text style={styles.buttonText}>Copy to Community</Text>
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
    paddingLeft: 5,
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
    backgroundColor: 'white',
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
    paddingVertical: 100
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
    backgroundColor: 'white',
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
    backgroundColor: '#FFFFFF',
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
    width: 30, // Set the width and height to make it circular
    height: 30,
    borderRadius: 20, // Half of the width/height to make it a perfect circle
    alignItems: 'center',
    justifyContent: 'center', // Space between the buttons
  },

  minusButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    paddingBottom: 4,
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
    backgroundColor: '#FFFFFF',
  },
  completeButton: {
    backgroundColor: '#cd2525',
  },
  incompleteButton: {
    backgroundColor: '#227730',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#d9534f',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
    width: 70,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 5,
  },
  measurementContainer: {
    height: 38,
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
  dropdownHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f3e5f5',
    borderRadius: 8,
    marginVertical: 10,
  },
  dropdownHeaderTextRight: {
    fontFamily: 'inter-bold',
    fontSize: 30,
    color: '#007bff',
  },
  dropdownContentRight: {
    overflow: 'hidden',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownContentText: {
    fontFamily: 'inter-regular',
    fontSize: 18,
    color: '#333',
  },
  transferButton: {
    marginTop: 10,
    borderColor: '#39913b',
    height: 64, 
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
    flex: 1,
    minHeight: Platform.OS === 'ios' ? '190%' : 400, // Adjust minHeight based on platform
  },
  closeButtonModal: {
    position: 'absolute',
    top: 80,
    right: 50,
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
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  summaryName: {
    flex: 1,
    textAlign: 'left',
    fontFamily: 'inter-bold',
    fontSize: 18,
    color: '#007bff',
  },
  summaryUnits: {
    textAlign: 'right',
    fontFamily: 'inter-regular',
    fontSize: 18,
    color: '#333',
  },
  sharedToggleButton: {
    backgroundColor: '#f3e5f5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
    sharedToggleText: {
    fontFamily: 'inter-bold',
    fontSize: 24,
    color: '#007bff',
  },
  pricingLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  pricingStore: {
    flex: 1,
    textAlign: 'left',
    fontFamily: 'inter-bold',
    fontSize: 18,
    color: '#007bff',
  },
  pricingPrice: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'inter-regular',
    fontSize: 18,
    color: '#333',
  },
  infoFloatingButton: {
    position: 'absolute',
    bottom: 30,
    left: 30, // or right: 30, depending on your desired placement
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3', // Use a color that fits your theme
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100, // Make sure it appears above other elements
  },
  infoTab: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '28%',
    minWidth: 320,
  }

});

export default GroceryList;
