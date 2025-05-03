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
  ActivityIndicator,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/services/authContext';
import { getAccountByOwnerID } from '@/components/Account/AccountService';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  getFoodConcreteItems,
  createFoodConcrete,
  updateQuantity,
  updatePantryDescription,
  deleteFoodConcrete,
  getPantryById,
} from '@/components/Pantry/PantryService';
import { FoodConcrete } from '@/src/entities/FoodConcrete';
import PantryDropdownComponent from '@/components/Pantry/PantryDropdownComponent';
import { getAllFoodGlobal } from '@/components/Food/FoodGlobalService';
import ProductPage from '@/components/Food/FoodUI';

const PantryScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { pantryId } = useLocalSearchParams();
  const { user } = useAuth(); // Get the authenticated user
  const [accountId, setAccountId] = useState<string | null>(null);

  const [items, setItems] = useState<FoodConcrete[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodConcrete[]>([]);
  const [pantryName, setPantryName] = useState('');
  const [pantryDescription, setPantryDescription] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [customName, setCustomName] = useState('');
  const [quantityType, setQuantityType] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<FoodConcrete | null>(null);
  const [itemQuantity, setItemQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [manualDateInput, setManualDateInput] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [sortOption, setSortOption] = useState<'name' | 'expiration'>('name');
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);

  const [selectedPantryFood, setSelectedPantryFood] =
    useState<FoodConcrete | null>(null);
  const [pantryModalVisible, setPantryModalVisible] = useState(false);

  const [foodDataMap, setFoodDataMap] = useState<{
    [id: string]: { label: string; image_url: string };
  }>({});

  const foodDataLoaded = Object.keys(foodDataMap).length > 0;

  const [selectedFood, setSelectedFood] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const openProductModal = (foodGlobalId: string) => {
    setSelectedFoodId(foodGlobalId);
    setProductModalVisible(true);
  };

  const closeProductModal = () => {
    setSelectedFoodId(null);
    setProductModalVisible(false);
  };

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // fetch account ID when user is available
  useEffect(() => {
    const fetchAccountId = async () => {
      if (user) {
        try {
          const account = await getAccountByOwnerID(user.uid);
          setAccountId(account.id);
        } catch (error) {
          console.error('Error fetching account:', error);
        }
      }
    };

    fetchAccountId();
  }, [user]);

  // Fetch pantry data and FoodGlobal data
  useEffect(() => {
    const fetchEverything = async () => {
      if (!user) return;

      setLoading(true);

      try {
        // 1. Get account
        const account = await getAccountByOwnerID(user.uid);
        setAccountId(account.id);

        // 2. Get pantry
        const pantryData = await getPantryById(pantryId as string);

        if (pantryData.account_id !== account.id) {
          throw new Error('You do not have access to this pantry');
        }

        setPantryName(pantryData.pantry_name);
        setPantryDescription(pantryData.description);

        // 3. Get pantry food items
        const foodItems = await getFoodConcreteItems(pantryId as string);
        setItems(foodItems);
        setFilteredItems(foodItems);

        // 4. 🛑 Get FoodGlobal items
        const allFoodGlobal = await getAllFoodGlobal();
        const dataMap: {
          [id: string]: {
            label: string;
            image_url: string;
            description?: string;
            macronutrients?: any;
            micronutrients?: any;
          };
        } = {};

        allFoodGlobal.forEach((food) => {
          dataMap[food.id] = {
            label: food.food_name,
            image_url: food.food_picture_url || 'https://placehold.co/100x100',
            description: food.description,
            macronutrients: food.macronutrients,
            micronutrients: food.micronutrients,
          };
        });

        setFoodDataMap(dataMap);
      } catch (error) {
        console.error('Error loading pantry or food:', error);
        Alert.alert('Error', error.message || 'Failed to load pantry');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, [pantryId, user]);

  const handleManualDateInput = (text: string) => {
    let formattedText = text.replace(/\D/g, '');

    if (formattedText.length > 2) {
      formattedText = `${formattedText.slice(0, 2)}/${formattedText.slice(2)}`;
    }
    if (formattedText.length > 5) {
      formattedText = `${formattedText.slice(0, 5)}/${formattedText.slice(
        5,
        9
      )}`;
    }

    setManualDateInput(formattedText);
    if (formattedText.length === 10) {
      const [month, day, year] = formattedText.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        setExpirationDate(date);
      }
    }
  };

  const sortItems = (items: FoodConcrete[]) => {
    const sorted = [...items];
    switch (sortOption) {
      case 'name':
        return sorted.sort((a, b) =>
          a.food_abstract_id.localeCompare(b.food_abstract_id)
        );
      case 'expiration':
        return sorted.sort(
          (a, b) =>
            new Date(a.expiration_date).getTime() -
            new Date(b.expiration_date).getTime()
        );
      default:
        return sorted;
    }
  };

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

  const addCustomItem = async () => {
    try {
      if (!selectedFood) throw new Error('Please select a food item');
      if (!manualDateInput || manualDateInput.length < 10) {
        throw new Error('Please enter a complete date in MM/DD/YYYY format');
      }
      const quantity = parseInt(itemQuantity);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }

      // Save selectedFood early before you reset it!
      const foodLabel = selectedFood.label;

      // Format the date properly
      const [month, day, year] = manualDateInput.split('/').map(Number);
      const expDate = new Date(year, month - 1, day);
      if (isNaN(expDate.getTime())) {
        throw new Error('Invalid date');
      }
      const formattedDate = expDate.toISOString().split('T')[0];

      // Call create mutation
      await createFoodConcrete(
        pantryId as string,
        selectedFood.value, // food_global_id
        formattedDate, // expiration_date
        quantity, // quantity
        quantityType.trim().charAt(0).toUpperCase() +
          quantityType.trim().slice(1).toLowerCase() || 'Unit' // quantity_type
      );

      // Reset form safely AFTER
      setSelectedFood(null);
      setManualDateInput('');
      setItemQuantity('1');
      setQuantityType('');
      setIsAddModalVisible(false);

      // Refresh items
      const updatedItems = await getFoodConcreteItems(pantryId as string);
      setItems(updatedItems);
      setFilteredItems(updatedItems);

      // Show success
      setAlertMessage(`Added "${foodLabel}" successfully!`);
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);
    } catch (error: any) {
      console.error('Error adding item:', error);
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };

  const updateItem = async () => {
    if (!currentItem) return;

    try {
      await updateQuantity(
        currentItem.id,
        currentItem.quantity,
        currentItem.quantity_type
      );

      // Refresh the list
      const updatedItems = await getFoodConcreteItems(pantryId as string);
      setItems(updatedItems);
      setFilteredItems(updatedItems);

      setAlertMessage(`Updated "${currentItem.food_abstract_id}"`);
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);

      setIsAddModalVisible(false);
      setCurrentItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item');
    }
  };

  // deletes an item in the pantry
  const deleteItem = async (itemId: string) => {
    if (!accountId) return;

    try {
      await deleteFoodConcrete(itemId);

      // Verify the item was deleted
      const updatedItems = await getFoodConcreteItems(pantryId as string);
      if (updatedItems.some((item) => item.id === itemId)) {
        throw new Error('Failed to delete item');
      }

      setItems(updatedItems);
      setFilteredItems(updatedItems);
      setAlertMessage('Item deleted successfully');
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);
    } catch (error) {
      console.error('Error deleting item:', error);
      setAlertMessage(error.message || 'Failed to delete item');
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);
    }
  };

  // updates the description to the pantry based on what the user writes
  const handleUpdatePantryDescription = async (text: string) => {
    try {
      // Update UI state immediately
      setPantryDescription(text);

      // Make the API call
      if (accountId) {
        await updatePantryDescription(pantryId as string, text);
      }
    } catch (error) {
      console.error('Error updating description:', error);

      // Revert UI state if API call fails
      const pantry = await getPantryById(pantryId as string);
      setPantryDescription(pantry.description);
      Alert.alert('Error', 'Failed to update description');
    }
  };

  const markAsUsed = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      console.error('Item not found');
      return;
    }

    const newQuantity = item.quantity - 1;

    if (newQuantity <= 0) {
      await deleteItem(itemId);
      return;
    }

    try {
      await updateQuantity(
        item.id,
        parseFloat(newQuantity.toString()),
        item.quantity_type
      );

      // update local list:
      const updatedItems = items.map((i) =>
        i.id === item.id ? { ...i, quantity: newQuantity } : i
      );

      setItems(updatedItems);
      setFilteredItems(updatedItems);

      setAlertMessage('Quantity decreased by 1');
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  // renders all items in the pantry
  const renderItem = ({ item }: { item: FoodConcrete }) => {
    const foodData = foodDataMap[item.food_abstract_id];
    const foodName = foodData?.label || item.food_abstract_id;
    const foodImageUrl = foodData?.image_url || 'https://placehold.co/100x100';
    return (
      <Pressable
        onPress={() => {
          openProductModal(item.food_abstract_id);
        }}
      >
        <View style={[styles.itemCard, { backgroundColor: colors.surface }]}>
          <Image source={{ uri: foodImageUrl }} style={styles.itemImage} />

          <View style={styles.itemDetails}>
            <Text style={[styles.itemName, { color: colors.onSurface }]}>
              {foodName}
            </Text>
            <Text style={{ color: colors.onSurface }}>
              Qty: {item.quantity} {item.quantity_type}
            </Text>
            <Text style={{ color: colors.onSurface }}>
              Exp: {new Date(item.expiration_date).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.itemActions}>
            <Pressable
              onPress={() => markAsUsed(item.id)}
              style={({ pressed }) => [pressed && styles.buttonPressed]}
            >
              <AntDesign name="check" size={24} color="green" />
            </Pressable>

            <Pressable
              onPress={() => deleteItem(item.id)}
              style={({ pressed }) => [pressed && styles.buttonPressed]}
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
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
              onChangeText={handleUpdatePantryDescription}
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
            setSelectedFood(null);
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
                Add New Item
              </Text>

              {/* 1. Food Dropdown */}
              <PantryDropdownComponent
                accountId={accountId}
                onValueChange={(item) => {
                  if (currentItem) {
                    setCurrentItem({
                      ...currentItem,
                      food_abstract_id: item.value,
                    });
                  } else {
                    setSelectedFood(item);
                  }
                }}
                setDropdownOptions={setFoodDataMap} // <-- you add this prop
                currentValue={currentItem?.food_abstract_id}
              />

              {/* 2. Quantity */}
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="Quantity (e.g., 1, 2, 5)"
                placeholderTextColor={colors.onSurface}
                value={itemQuantity}
                onChangeText={setItemQuantity}
                keyboardType="numeric"
              />

              {/* 3. Expiration Date */}
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="Expiration Date (MM/DD/YYYY)"
                placeholderTextColor={colors.onSurface}
                value={manualDateInput}
                onChangeText={handleManualDateInput}
                keyboardType="numeric"
                maxLength={10}
              />

              {/* 4. Quantity Type */}
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="Quantity Type (e.g., unit, bottle)"
                placeholderTextColor={colors.onSurface}
                value={quantityType}
                onChangeText={setQuantityType}
              />

              {/* Buttons */}
              <View style={styles.modalButtons}>
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
                  onPress={addCustomItem} // Your new clean version
                >
                  <Text style={styles.buttonText}>Add</Text>
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

        {/* ——— Product Details Modal ——— */}
        <Modal
          visible={productModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeProductModal}
        >
          <View
            style={[
              styles.modalOverlay,
              { width: '150%', alignSelf: 'center' },
            ]}
          >
            <View
              style={[styles.modalContent, { backgroundColor: colors.surface }]}
            >
              <Pressable
                onPress={closeProductModal}
                style={{ alignSelf: 'flex-end', padding: 8 }}
              >
                <Text style={{ fontSize: 24, color: colors.onSurface }}>✕</Text>
              </Pressable>
              {selectedFoodId && accountId && (
                <ProductPage foodId={selectedFoodId} accountId={accountId} />
              )}
            </View>
          </View>
        </Modal>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
