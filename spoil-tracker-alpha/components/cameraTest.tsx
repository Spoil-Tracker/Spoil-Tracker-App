/**
 * Barcode Scanner Component
 *
 * This component uses the Expo Camera to scan barcodes. It:
 * - Requests camera permissions.
 * - Displays a live camera view.
 * - Flips between front and back cameras.
 * - Scans barcodes and displays the scanned data.
 *
 * The component prevents duplicate scans by disabling scanning for 3 seconds
 * after a barcode is scanned.
 */

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

export default function barcodeScanner() {
  // State to track the current camera facing mode (back or front)
  const [facing, setFacing] = useState<CameraType>('back');

  // Request and track camera permissions using Expo's useCameraPermissions hook.
  const [permission, requestPermission] = useCameraPermissions();

  // State to hold scanned barcode data
  const [scannedData, setScannedData] = useState<string | null>(null);

  // Ref to prevent duplicate scans by tracking if a scan is currently in progress
  const scanningRef = useRef<boolean>(false);

  // If permissions are still loading, return an empty view.
  if (!permission) {
    return <View />;
  }

  // If permissions are not granted, ask the user for permission.
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  /**
   * handleBarCodeScanned
   *
   * Callback function invoked when a barcode is scanned.
   * It sets the scanned data, shows an alert with the barcode info, and
   * disables scanning for 3 seconds to prevent duplicate scans.
   *
   * @param param0 - Object containing the barcode type and data.
   */
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // If already scanning, exit early.
    if (scanningRef.current) return;
    scanningRef.current = true;

    // Save the scanned barcode data.
    setScannedData(data);

    // Display an alert with barcode type and data.
    Alert.alert('Barcode Scanned', `Type: ${type}\nData: ${data}`);

    // Disable scanning for 3 seconds.
    setTimeout(() => {
      scanningRef.current = false;
    }, 3000);
  };

  /**
   * toggleCameraFacing
   *
   * Toggles the camera view between the front and back cameras.
   */
  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      {/* CameraView displays the live camera feed */}
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarCodeScanned}
      >
        {/* Button to flip the camera */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      {/* Display scanned barcode data if available */}
      {scannedData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Scanned Barcode: {scannedData}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
});
