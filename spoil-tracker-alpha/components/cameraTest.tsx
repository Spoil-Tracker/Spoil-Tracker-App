import React, { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, TextInput } from 'react-native';

export default function BarcodeScanner() {
  // Modes: "menu" shows the initial choice; "camera" uses the CameraView; "manual" allows manual input.
  const [mode, setMode] = useState<"menu" | "camera" | "manual">("menu");
  const [facing, setFacing] = useState<CameraType>('back');
  const [manualInput, setManualInput] = useState<string>('');
  
  // Request camera permissions using Expo's hook, but this is only needed in camera mode.
  const [permission, requestPermission] = useCameraPermissions();

  const [scannedData, setScannedData] = useState<string | null>(null);
  const [productData, setProductData] = useState<any>(null);

  // Ref prevents duplicate scans
  const scanningRef = useRef<boolean>(false);

  /**
   * lookupProduct
   *
   * Calls the Open Facts APIs to retrieve product details using the provided barcode.
   */
  const lookupProduct = async (barcode: string) => {
    const apiSources = [
      { name: 'Food', url: `https://world.openfoodfacts.org/api/v0/product/${barcode}.json` },
      { name: 'Beauty', url: `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json` },
      { name: 'Pet Food', url: `https://world.openpetfoodfacts.org/api/v0/product/${barcode}.json` },
      { name: 'Product', url: `https://world.openproductfacts.org/api/v0/product/${barcode}.json` },
      { name: 'US Food (region)', url: `https://us.openfoodfacts.org/api/v0/product/${barcode}.json` },
    ];
  
    for (const source of apiSources) {
      try {
        const response = await fetch(source.url);
        const data = await response.json();
  
        if (data?.status === 1 && data.product) {
          const product = data.product;
  
          setProductData({
            title: product.product_name || 'Unknown',
            brand: product.brands || 'Unknown',
            description: product.generic_name || 'No description available.',
            nutriments: product.nutriments || null,
          });
  
          Alert.alert(`${source.name} Product Found`, product.product_name || 'Unknown');
          return;
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${source.name}:`, error);
        continue; // try next API
      }
    }
  
    Alert.alert("Not Found", "Product not found in any Open Facts databases.");
  };
  
  /**
   * handleBarCodeScanned
   *
   * Invoked when a barcode is scanned from the camera.
   */
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanningRef.current) return;
    scanningRef.current = true;

    setScannedData(data);
    Alert.alert('Barcode Scanned', `Type: ${type}\nData: ${data}`);
    lookupProduct(data);

    // Disable scanning for 3 seconds to prevent duplicate scans.
    setTimeout(() => {
      scanningRef.current = false;
    }, 3000);
  };

  /**
   * toggleCameraFacing
   *
   * Switches between front and back cameras.
   */
  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // ------------------------------
  // Render modes based on user selection
  // ------------------------------

  // Initial menu mode
  if (mode === "menu") {
    return (
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Select Input Method</Text>
        <Button title="Scan with Camera" onPress={() => setMode("camera")} />
        <View style={{ height: 10 }} />
        <Button title="Enter Barcode Manually" onPress={() => setMode("manual")} />
      </View>
    );
  }

  // Manual input mode
  if (mode === "manual") {
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
        <Button
          title="Submit"
          onPress={() => {
            if (manualInput.trim() === "") {
              Alert.alert("Input Required", "Please enter a barcode.");
            } else {
              setScannedData(manualInput);
              lookupProduct(manualInput);
            }
          }}
        />
        <View style={{ height: 10 }} />
        <Button title="Back to Menu" onPress={() => { setMode("menu"); setManualInput(''); }} />

        {/* Optionally display product details */}
        {scannedData && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Barcode: {scannedData}</Text>
          </View>
        )}
        {productData?.nutriments && (
          <View style={styles.nutritionContainer}>
            <Text style={styles.productTitle}>Nutrition Facts (per 100g):</Text>
            {productData.nutriments['energy-kcal_100g'] && (
              <Text style={styles.productText}>Calories: {productData.nutriments['energy-kcal_100g']} kcal</Text>
            )}
            {productData.nutriments['fat_100g'] && (
              <Text style={styles.productText}>Fat: {productData.nutriments['fat_100g']} g</Text>
            )}
            {productData.nutriments['saturated-fat_100g'] && (
              <Text style={styles.productText}>Saturated Fat: {productData.nutriments['saturated-fat_100g']} g</Text>
            )}
            {productData.nutriments['carbohydrates_100g'] && (
              <Text style={styles.productText}>Carbohydrates: {productData.nutriments['carbohydrates_100g']} g</Text>
            )}
            {productData.nutriments['sugars_100g'] && (
              <Text style={styles.productText}>Sugars: {productData.nutriments['sugars_100g']} g</Text>
            )}
            {productData.nutriments['fiber_100g'] && (
              <Text style={styles.productText}>Fiber: {productData.nutriments['fiber_100g']} g</Text>
            )}
            {productData.nutriments['proteins_100g'] && (
              <Text style={styles.productText}>Protein: {productData.nutriments['proteins_100g']} g</Text>
            )}
            {productData.nutriments['salt_100g'] && (
              <Text style={styles.productText}>Salt: {productData.nutriments['salt_100g']} g</Text>
            )}
            {productData.nutriments['sodium_100g'] && (
              <Text style={styles.productText}>Sodium: {productData.nutriments['sodium_100g']} g</Text>
            )}
          </View>
        )}
      </View>
    );
  }

  // Camera mode
  if (mode === "camera") {
    // Make sure to check for camera permissions.
    if (!permission) {
      return <View />;
    }
    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>We need your permission to use the camera</Text>
          <Button onPress={requestPermission} title="Grant Permission" />
          <View style={{ height: 10 }} />
          <Button title="Back to Menu" onPress={() => setMode("menu")} />
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={handleBarCodeScanned}
        >
          {/* Camera controls */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
        <View style={{ padding: 10 }}>
          <Button title="Back to Menu" onPress={() => setMode("menu")} />
        </View>
        {scannedData && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Scanned Barcode: {scannedData}</Text>
          </View>
        )}
        {productData?.nutriments && (
          <View style={styles.nutritionContainer}>
            <Text style={styles.productTitle}>Nutrition Facts (per 100g):</Text>
            {productData.nutriments['energy-kcal_100g'] && (
              <Text style={styles.productText}>Calories: {productData.nutriments['energy-kcal_100g']} kcal</Text>
            )}
            {productData.nutriments['fat_100g'] && (
              <Text style={styles.productText}>Fat: {productData.nutriments['fat_100g']} g</Text>
            )}
            {productData.nutriments['saturated-fat_100g'] && (
              <Text style={styles.productText}>Saturated Fat: {productData.nutriments['saturated-fat_100g']} g</Text>
            )}
            {productData.nutriments['carbohydrates_100g'] && (
              <Text style={styles.productText}>Carbohydrates: {productData.nutriments['carbohydrates_100g']} g</Text>
            )}
            {productData.nutriments['sugars_100g'] && (
              <Text style={styles.productText}>Sugars: {productData.nutriments['sugars_100g']} g</Text>
            )}
            {productData.nutriments['fiber_100g'] && (
              <Text style={styles.productText}>Fiber: {productData.nutriments['fiber_100g']} g</Text>
            )}
            {productData.nutriments['proteins_100g'] && (
              <Text style={styles.productText}>Protein: {productData.nutriments['proteins_100g']} g</Text>
            )}
            {productData.nutriments['salt_100g'] && (
              <Text style={styles.productText}>Salt: {productData.nutriments['salt_100g']} g</Text>
            )}
            {productData.nutriments['sodium_100g'] && (
              <Text style={styles.productText}>Sodium: {productData.nutriments['sodium_100g']} g</Text>
            )}
          </View>
        )}
      </View>
    );
  }

  // Fallback (should not occur)
  return <View />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#00000080',
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  resultContainer: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nutritionContainer: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productText: {
    fontSize: 16,
  },
  label: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: '80%',
    alignSelf: 'center',
  },
});

