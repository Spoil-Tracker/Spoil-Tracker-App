import React, { useState, useRef, useEffect } from 'react';
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
import { addCustomItem, getAccountByOwnerID } from '@/components/Account/AccountService';
import { useAuth } from '@/services/authContext';

interface CustomGroceryItemScreenProps {
  onItemAdded?: () => void;
  initialName?: string;
  initialDescription?: string;
  initialCategory?: string;
  initialAmount?: string;
  initialImageLink?: string;
  initialTotalFat?: string;
  initialSatFat?: string;
  initialTransFat?: string;
  initialCarbohydrate?: string;
  initialFiber?: string;
  initialTotalSugars?: string;
  initialAddedSugars?: string;
  initialProtein?: string;
  initialCholesterol?: string;
  initialSodium?: string;
  initialVitaminD?: string;
  initialCalcium?: string;
  initialIron?: string;
  initialPotassium?: string;
}

const CustomGroceryItemScreen: React.FC<CustomGroceryItemScreenProps> = ({
  onItemAdded,
  initialName = '',
  initialDescription = '',
  initialCategory = '',
  initialAmount = '',
  initialImageLink = '',
  initialTotalFat = '',
  initialSatFat = '',
  initialTransFat = '',
  initialCarbohydrate = '',
  initialFiber = '',
  initialTotalSugars = '',
  initialAddedSugars = '',
  initialProtein = '',
  initialCholesterol = '',
  initialSodium = '',
  initialVitaminD = '',
  initialCalcium = '',
  initialIron = '',
  initialPotassium = '',
}) => {
  // Basic grocery item details
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState(initialCategory);
  const [amount, setAmount] = useState(initialAmount);
  const [imageLink, setImageLink] = useState(initialImageLink);

  // Macronutrients state (strings -> numbers)
  const [totalFat, setTotalFat] = useState(initialTotalFat);
  const [satFat, setSatFat] = useState(initialSatFat);
  const [transFat, setTransFat] = useState(initialTransFat);
  const [carbohydrate, setCarbohydrate] = useState(initialCarbohydrate);
  const [fiber, setFiber] = useState(initialFiber);
  const [totalSugars, setTotalSugars] = useState(initialTotalSugars);
  const [addedSugars, setAddedSugars] = useState(initialAddedSugars);
  const [protein, setProtein] = useState(initialProtein);

  // Micronutrients state
  const [cholesterol, setCholesterol] = useState(initialCholesterol);
  const [sodium, setSodium] = useState(initialSodium);
  const [vitaminD, setVitaminD] = useState(initialVitaminD);
  const [calcium, setCalcium] = useState(initialCalcium);
  const [iron, setIron] = useState(initialIron);
  const [potassium, setPotassium] = useState(initialPotassium);

  const MACROS_EXPANDED_HEIGHT = 480;
  const MICROS_EXPANDED_HEIGHT = 360;

  // Dropdown animations
  const [showMacros, setShowMacros] = useState(false);
  const macrosHeight = useRef(new Animated.Value(0)).current;
  const [showMicros, setShowMicros] = useState(false);
  const microsHeight = useRef(new Animated.Value(0)).current;

  const { user } = useAuth();

  const toggleMacros = () => {
    Animated.timing(macrosHeight, {
      toValue: showMacros ? 0 : MACROS_EXPANDED_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setShowMacros(!showMacros));
  };

  const toggleMicros = () => {
    Animated.timing(microsHeight, {
      toValue: showMicros ? 0 : MICROS_EXPANDED_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setShowMicros(!showMicros));
  };

  const handleSubmit = async () => {
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
      if (!user) return;
      const account = await getAccountByOwnerID(user.uid);
      await addCustomItem(
        account.id,
        name,
        category,
        imageLink,
        amount,
        description,
        macronutrients,
        micronutrients
      );
      onItemAdded?.();
      // Reset fields
      setName(initialName);
      setDescription(initialDescription);
      setCategory(initialCategory);
      setAmount(initialAmount);
      setImageLink(initialImageLink);
      setTotalFat(initialTotalFat);
      setSatFat(initialSatFat);
      setTransFat(initialTransFat);
      setCarbohydrate(initialCarbohydrate);
      setFiber(initialFiber);
      setTotalSugars(initialTotalSugars);
      setAddedSugars(initialAddedSugars);
      setProtein(initialProtein);
      setCholesterol(initialCholesterol);
      setSodium(initialSodium);
      setVitaminD(initialVitaminD);
      setCalcium(initialCalcium);
      setIron(initialIron);
      setPotassium(initialPotassium);
      // Collapse dropdowns
      Animated.timing(macrosHeight, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => setShowMacros(false));
      Animated.timing(microsHeight, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => setShowMicros(false));
    } catch (error) {
      console.error('Error adding custom item:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsHorizontalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.title}>Create Custom Grocery Item</Text>
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
          <TextInput style={styles.input} placeholder="Amount Per Serving" value={amount} onChangeText={setAmount} />
          <TextInput style={styles.input} placeholder="Image URL" value={imageLink} onChangeText={setImageLink} />

          <Pressable style={styles.dropdownHeader} onPress={toggleMacros}>
            <Text style={styles.dropdownHeaderText}>
              {showMacros ? 'Hide Macronutrients' : 'Show Macronutrients'}
            </Text>
          </Pressable>
          <Animated.View style={[styles.dropdownContent, { height: macrosHeight, overflow: 'hidden' }]}>            
            <TextInput style={styles.input} placeholder="Total Fat" value={totalFat} onChangeText={setTotalFat} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Saturated Fat" value={satFat} onChangeText={setSatFat} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Trans Fat" value={transFat} onChangeText={setTransFat} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Carbohydrate" value={carbohydrate} onChangeText={setCarbohydrate} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Fiber" value={fiber} onChangeText={setFiber} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Total Sugars" value={totalSugars} onChangeText={setTotalSugars} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Added Sugars" value={addedSugars} onChangeText={setAddedSugars} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Protein" value={protein} onChangeText={setProtein} keyboardType="numeric" />
          </Animated.View>

          <Pressable style={styles.dropdownHeader} onPress={toggleMicros}>
            <Text style={styles.dropdownHeaderText}>
              {showMicros ? 'Hide Micronutrients' : 'Show Micronutrients'}
            </Text>
          </Pressable>
          <Animated.View style={[styles.dropdownContent, { height: microsHeight, overflow: 'hidden' }]}>            
            <TextInput style={styles.input} placeholder="Cholesterol" value={cholesterol} onChangeText={setCholesterol} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Sodium" value={sodium} onChangeText={setSodium} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Vitamin D" value={vitaminD} onChangeText={setVitaminD} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Calcium" value={calcium} onChangeText={setCalcium} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Iron" value={iron} onChangeText={setIron} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Potassium" value={potassium} onChangeText={setPotassium} keyboardType="numeric" />
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
  container: { flex: 1 },
  contentContainer: { padding: 20, alignItems: 'center', justifyContent: 'center' },
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
  title: { fontFamily: 'inter-bold', fontSize: 24, color: '#007bff', textAlign: 'center', marginBottom: 20 },
  dropdownHeader: {
    backgroundColor: '#e2e6ea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#007bff',
    marginTop: 10,
  },
  dropdownHeaderText: { color: '#007bff', fontFamily: 'inter-bold', fontSize: 18, textAlign: 'center' },
  dropdownContent: { marginTop: 10 },
  input: {
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#e2e6ea',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007bff',
    marginTop: 20,
  },
  buttonText: { color: '#007bff', fontFamily: 'inter-bold', fontSize: 18 },
});
