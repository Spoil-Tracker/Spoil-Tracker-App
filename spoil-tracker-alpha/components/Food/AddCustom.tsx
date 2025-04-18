import React, { useState, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { addCustomItem, getAccountByOwnerID } from '@/components/Account/AccountService'; // Adjust the path as needed
import { useAuth } from '@/services/authContext';

interface CustomGroceryItemScreenProps {
  onItemAdded?: () => void;
}

const CustomGroceryItemScreen: React.FC<CustomGroceryItemScreenProps> = ({ onItemAdded }) => {
  // Basic grocery item details.
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  // New state for the image link.
  const [imageLink, setImageLink] = useState('');

  // Macronutrients state (stored as strings, to be converted to numbers)
  const [totalFat, setTotalFat] = useState('');
  const [satFat, setSatFat] = useState('');
  const [transFat, setTransFat] = useState('');
  const [carbohydrate, setCarbohydrate] = useState('');
  const [fiber, setFiber] = useState('');
  const [totalSugars, setTotalSugars] = useState('');
  const [addedSugars, setAddedSugars] = useState('');
  const [protein, setProtein] = useState('');

  // Micronutrients state (stored as strings, to be converted to numbers)
  const [cholesterol, setCholesterol] = useState('');
  const [sodium, setSodium] = useState('');
  const [vitaminD, setVitaminD] = useState('');
  const [calcium, setCalcium] = useState('');
  const [iron, setIron] = useState('');
  const [potassium, setPotassium] = useState('');

  // Constants defining the expanded heights of dropdown sections.
  const MACROS_EXPANDED_HEIGHT = 480;
  const MICROS_EXPANDED_HEIGHT = 360;

  // State to control the visibility and animation of the macronutrient dropdown.
  const [showMacros, setShowMacros] = useState(false);
  const macrosHeight = useRef(new Animated.Value(0)).current;
  
  // State to control the visibility and animation of the micronutrient dropdown.
  const [showMicros, setShowMicros] = useState(false);
  const microsHeight = useRef(new Animated.Value(0)).current;

  // Retrieve the current authenticated user.
  const { user } = useAuth();

  /**
   * Toggles the visibility of the macronutrients dropdown.
   */
  const toggleMacros = () => {
    if (!showMacros) {
      setShowMacros(true);
      Animated.timing(macrosHeight, {
        toValue: MACROS_EXPANDED_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(macrosHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setShowMacros(false));
    }
  };

  /**
   * Toggles the visibility of the micronutrients dropdown.
   */
  const toggleMicros = () => {
    if (!showMicros) {
      setShowMicros(true);
      Animated.timing(microsHeight, {
        toValue: MICROS_EXPANDED_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(microsHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setShowMicros(false));
    }
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async () => {
    // Convert nutrient values from strings to numbers
    const macronutrients = {
      total_fat: Number(totalFat),
      sat_fat: Number(satFat),
      trans_fat: Number(transFat),
      carbohydrate: Number(carbohydrate),
      fiber: Number(fiber),
      total_sugars: Number(totalSugars),
      added_sugars: Number(addedSugars),
      protein: Number(protein),
    };

    const micronutrients = {
      cholesterol: Number(cholesterol),
      sodium: Number(sodium),
      vitamin_d: Number(vitaminD),
      calcium: Number(calcium),
      iron: Number(iron),
      potassium: Number(potassium),
    };

    try {
      if (!user) {
        return;
      }

      const account = await getAccountByOwnerID(user.uid);
      
      // Use the imageLink state as the food_picture_url value.
      const response = await addCustomItem(
        account.id,
        name,
        category,
        imageLink,
        amount,
        description,
        macronutrients,
        micronutrients
      );
      console.log('Custom item added successfully:', response);
      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error) {
      console.error('Error adding custom item:', error);
    }

    // Reset the form fields and collapse dropdowns
    setName('');
    setDescription('');
    setCategory('');
    setAmount('');
    setImageLink('');
    setTotalFat('');
    setSatFat('');
    setTransFat('');
    setCarbohydrate('');
    setFiber('');
    setTotalSugars('');
    setAddedSugars('');
    setProtein('');
    setCholesterol('');
    setSodium('');
    setVitaminD('');
    setCalcium('');
    setIron('');
    setPotassium('');
    Animated.timing(macrosHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setShowMacros(false));
    Animated.timing(microsHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setShowMicros(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsHorizontalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.title}>Create Custom Grocery Item</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount Per Serving"
            value={amount}
            onChangeText={setAmount}
          />
          {/* New Input Field for Image URL */}
          <TextInput
            style={styles.input}
            placeholder="Image URL"
            value={imageLink}
            onChangeText={setImageLink}
          />

          {/* Animated Dropdown for Macronutrients */}
          <Pressable style={styles.dropdownHeader} onPress={toggleMacros}>
            <Text style={styles.dropdownHeaderText}>
              {showMacros ? 'Hide Macronutrients' : 'Show Macronutrients'}
            </Text>
          </Pressable>
          <Animated.View style={[styles.dropdownContent, { height: macrosHeight, overflow: 'hidden' }]}>
            <TextInput
              style={styles.input}
              placeholder="Total Fat"
              value={totalFat}
              onChangeText={setTotalFat}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Saturated Fat"
              value={satFat}
              onChangeText={setSatFat}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Trans Fat"
              value={transFat}
              onChangeText={setTransFat}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Carbohydrate"
              value={carbohydrate}
              onChangeText={setCarbohydrate}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Fiber"
              value={fiber}
              onChangeText={setFiber}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Total Sugars"
              value={totalSugars}
              onChangeText={setTotalSugars}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Added Sugars"
              value={addedSugars}
              onChangeText={setAddedSugars}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Protein"
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
            />
          </Animated.View>

          {/* Animated Dropdown for Micronutrients */}
          <Pressable style={styles.dropdownHeader} onPress={toggleMicros}>
            <Text style={styles.dropdownHeaderText}>
              {showMicros ? 'Hide Micronutrients' : 'Show Micronutrients'}
            </Text>
          </Pressable>
          <Animated.View style={[styles.dropdownContent, { height: microsHeight, overflow: 'hidden' }]}>
            <TextInput
              style={styles.input}
              placeholder="Cholesterol"
              value={cholesterol}
              onChangeText={setCholesterol}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Sodium"
              value={sodium}
              onChangeText={setSodium}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Vitamin D"
              value={vitaminD}
              onChangeText={setVitaminD}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Calcium"
              value={calcium}
              onChangeText={setCalcium}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Iron"
              value={iron}
              onChangeText={setIron}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Potassium"
              value={potassium}
              onChangeText={setPotassium}
              keyboardType="numeric"
            />
          </Animated.View>

          <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Item</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomGroceryItemScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontFamily: 'inter-bold',
    fontSize: 24,
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 20,
  },
  dropdownHeader: {
    backgroundColor: '#e2e6ea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#007bff',
    marginTop: 10,
  },
  dropdownHeaderText: {
    color: '#007bff',
    fontFamily: 'inter-bold',
    fontSize: 18,
    textAlign: 'center',
  },
  dropdownContent: {
    marginTop: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#e2e6ea',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007bff',
    marginTop: 20,
  },
  buttonText: {
    color: '#007bff',
    fontFamily: 'inter-bold',
    fontSize: 18,
  },
});
