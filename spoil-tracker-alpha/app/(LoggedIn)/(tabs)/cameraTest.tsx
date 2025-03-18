import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

// Conditionally import the camera component
let CameraComponent: React.ComponentType<any>;
if (Platform.OS === 'web') {
  // Dummy component for web: displays a message indicating camera is not supported.
  CameraComponent = (props: any) => (
    <View style={[props.style, { backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: 'white' }}>Camera not supported on desktop</Text>
    </View>
  );
} else {
  // On mobile, import and cast the RNCamera component to any so we can access Constants.
  CameraComponent = (require('react-native-camera').RNCamera) as any;
}

/**
 * CameraScreen component demonstrates basic camera functionality.
 *
 * On mobile, it renders the RNCamera component to capture photos.
 * On web/desktop, it renders a dummy component so the app compiles.
 *
 * @returns A React element that displays the camera preview (or a fallback message) and a button to take a picture.
 */
const CameraScreen = () => {
  const cameraRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState(true); // Adjust permission handling as needed

  const takePicture = async () => {
    if (cameraRef.current && Platform.OS !== 'web') {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      console.log('Photo URI:', data.uri);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraComponent
        ref={cameraRef}
        style={styles.preview}
        // Only pass these props on mobile platforms.
        {...(Platform.OS !== 'web' && {
          type: (CameraComponent as any).Constants.Type.back,
          captureAudio: false,
        })}
      />
      <TouchableOpacity onPress={takePicture} style={styles.capture}>
        <Text style={styles.captureText}> SNAP </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    alignSelf: 'center',
    margin: 20,
  },
  captureText: {
    fontSize: 14,
    color: 'black',
  },
});

export default CameraScreen;
