import React, { useState, useRef, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import CustomGroceryItemScreen from '@/components/Food/AddCustom';
import { getClosestFoodGlobal, FoodGlobal } from '@/components/Food/FoodGlobalService';
import GroceryListDropdownComponent from '@/components/GroceryList/GroceryListDropdown';
import { addGroceryListItem } from '@/components/GroceryList/GroceryListService';
// TODO: implement pantry service when ready
// import { addPantryItem } from '@/components/Pantry/PantryService';
import { useAuth } from '@/services/authContext';
import { getAccountByOwnerID } from '@/components/Account/AccountService';
import PantryDropdownComponent from '@/components/Pantry/PantryDropdown';

export default function BarcodeScanner() {
  const { user } = useAuth();
  const [accountId, setAccountId] = useState<string | null>(null);

  // Load account ID once
  useEffect(() => {
    if (user) {
      getAccountByOwnerID(user.uid)
        .then(ac => setAccountId(ac.id))
        .catch(e => console.warn('Error loading account:', e));
    }
  }, [user]);

  const [mode, setMode] = useState<'menu' | 'camera' | 'manual'>('menu');
  const [facing, setFacing] = useState<CameraType>('back');
  const [manualInput, setManualInput] = useState<string>('');
  const [permission, requestPermission] = useCameraPermissions();
  const scanningRef = useRef<boolean>(false);

  const [formParams, setFormParams] = useState<Record<string, string> | null>(null);
  const [matches, setMatches] = useState<FoodGlobal[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodGlobal | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedPantryId, setSelectedPantryId] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const lookupAndShowForm = async (barcode: string) => {
    setMatches([]);
    setSelectedFood(null);
    setFormParams(null);
    setIsCustomMode(false);
    setSelectedListId(null);

    const sources = [
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`,
      `https://world.openpetfoodfacts.org/api/v0/product/${barcode}.json`,
      `https://world.openproductfacts.org/api/v0/product/${barcode}.json`,
      `https://us.openfoodfacts.org/api/v0/product/${barcode}.json`,
    ];

    for (const url of sources) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data?.status === 1 && data.product) {
          const p = data.product;
          const name = p.product_name || '';
          Alert.alert('Product Found', name || 'Unknown');

          const nutr = p.nutriments || {};
          const params: Record<string, string> = {
            initialName: name,
            initialDescription: p.generic_name || p.generic_name_en || '',
            initialCategory: p.categories || p.brands || '',
            initialAmount: p.serving_size || '',
            initialImageLink:
              p.image_url || p.image_front_url || p.image_small_url || '',
            initialTotalFat: nutr['fat_100g']?.toString() || '',
            initialSatFat: nutr['saturated-fat_100g']?.toString() || '',
            initialTransFat: nutr['trans-fat_100g']?.toString() || '',
            initialCarbohydrate: nutr['carbohydrates_100g']?.toString() || '',
            initialFiber: nutr['fiber_100g']?.toString() || '',
            initialTotalSugars: nutr['sugars_100g']?.toString() || '',
            initialAddedSugars: nutr['sugars_added_100g']?.toString() || '',
            initialProtein: nutr['proteins_100g']?.toString() || '',
            initialCholesterol: nutr['cholesterol_100g']?.toString() || '',
            initialSodium: nutr['sodium_100g']?.toString() || '',
            initialVitaminD: nutr['vitamin-d_100g']?.toString() || '',
            initialCalcium: nutr['calcium_100g']?.toString() || '',
            initialIron: nutr['iron_100g']?.toString() || '',
            initialPotassium: nutr['potassium_100g']?.toString() || '',
          };

          try {
            const top = await getClosestFoodGlobal(name, 3);
            setMatches(top);
          } catch (e) {
            console.warn('Error fetching closest FoodGlobal:', e);
          }

          setFormParams(params);
          return;
        }
      } catch (e) {
        console.warn('Fetch error:', url, e);
      }
    }

    Alert.alert('Not Found', 'No product found in Open Facts databases.');
  };

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    lookupAndShowForm(data);
    setTimeout(() => (scanningRef.current = false), 3000);
  };

  const toggleCameraFacing = () => setFacing(cur => (cur === 'back' ? 'front' : 'back'));

  // Custom form
  if (isCustomMode && formParams) {
    return (
      <CustomGroceryItemScreen
        {...formParams}
        onItemAdded={() => { setFormParams(null); setMode('menu'); }}
      />
    );
  }

  // Matches view
  if (matches.length > 0) {
    if (!accountId) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="green" />
          <Text>Loading account...</Text>
        </View>
      );
    }
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.cardTitle}>Select a Match:</Text>
        {matches.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              selectedFood?.id === item.id && styles.selectedCard
            ]}
            onPress={() => setSelectedFood(item)}
          >
            <Image source={{ uri: item.food_picture_url }} style={styles.cardImage} />
            <View style={styles.cardText}>
              <Text style={styles.cardFoodName}>{item.food_name}</Text>
              <Text style={styles.cardFoodCategory}>{item.food_category}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {selectedFood && (
          <View style={styles.actionBlock}>
            <PantryDropdownComponent
              accountId={accountId}
              onValueChange={val => { setSelectedPantryId(val); setSelectedListId(null); }}
            />
            <GroceryListDropdownComponent
              accountId={accountId}
              onValueChange={val => { setSelectedListId(val); setSelectedPantryId(null); }}
            />
            <TouchableOpacity
              style={[
                styles.actionButton,
                !(selectedPantryId || selectedListId) && styles.disabledButton
              ]}
              onPress={async () => {
                if (!(selectedPantryId || selectedListId)) {
                  return Alert.alert('Select a pantry or a list first');
                }
                try {
                  if (selectedPantryId) {
                // TODO: addPantryItem not implemented yet
                Alert.alert('Added to pantry (placeholder)');
              } else if (selectedListId) {
                    await addGroceryListItem(
                      selectedListId,
                      accountId!,
                      selectedFood.id,
                      selectedFood.food_name
                    );
                    Alert.alert('Added to list');
                  }
                  setMatches([]);
                  setMode('menu');
                } catch (e) {
                  Alert.alert('Error', 'Could not add item');
                }
              }}
              disabled={!(selectedPantryId || selectedListId)}
            >
              <Text style={styles.actionButtonText}>Add to Inventory</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.cardTitle}>OR</Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setIsCustomMode(true)}
        >
          <Text style={styles.secondaryButtonText}>Make Custom Item</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Mode menu, manual, camera: unchanged...
  if (mode === 'menu') {
    return (
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Select Input Method</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMode('camera')}>
          <Text style={styles.menuButtonText}>Scan with Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMode('manual')}>
          <Text style={styles.menuButtonText}>Enter Barcode Manually</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === 'manual') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Enter Barcode Number:</Text>
        <TextInput
          value={manualInput}
          onChangeText={setManualInput}
          style={styles.textInput}
          placeholder="Barcode Number"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.actionButton} onPress={() => {
          if (!manualInput.trim()) Alert.alert('Input Required', 'Please enter a barcode.');
          else lookupAndShowForm(manualInput.trim());
        }}>
          <Text style={styles.actionButtonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setMode('menu')}>
          <Text style={styles.secondaryButtonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === 'camera') {
    if (!permission) return <View />;
    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.label}>Camera permission is required.</Text>
          <TouchableOpacity style={styles.actionButton} onPress={requestPermission}>
            <Text style={styles.actionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setMode('menu')}>
            <Text style={styles.secondaryButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} onBarcodeScanned={handleBarCodeScanned}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.flipButtonText}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setMode('menu')}>
          <Text style={styles.secondaryButtonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <View />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  menuContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  menuTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20 },

  scrollContainer: { padding: 20, alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    width: 300,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    marginVertical: 8,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  cardImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  cardText: { alignItems: 'center' },
  cardFoodName: { fontSize: 18, fontWeight: '700' },
  cardFoodCategory: { fontSize: 14, color: '#666' },

  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 6,
    width: '80%',
    alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },

  secondaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 6,
    width: '80%',
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },

  menuButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 6,
    width: '70%',
    alignItems: 'center',
  },
  menuButtonText: { color: '#000', fontSize: 16, fontWeight: '600' },

  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 10,
    width: '80%',
  },
  actionBlock: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },

  camera: { flex: 1, width: '100%' },
  buttonContainer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 30 },

  flipButton: { backgroundColor: '#00000080', padding: 10, borderRadius: 8 },
  flipButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  label: { fontSize: 18, textAlign: 'center', marginBottom: 10 },
});
