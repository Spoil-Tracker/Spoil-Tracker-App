import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // Ensure you have @expo/vector-icons installed

interface BannerProps {
  message: string;
  type: 'success' | 'error';
}

const Banner: React.FC<BannerProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // Hide banner when dismissed

  return (
    <View
      style={[
        styles.banner,
        type === 'success' ? styles.successBanner : styles.errorBanner,
      ]}
    >
      <Text style={styles.bannerText}>{message}</Text>
      <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
        <AntDesign name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 15,
    margin: 15, // Ensure some space around the banner
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'space-between', // Space between text and close button
    top: 20, // Adjust as needed
    left: 10,
    right: 10,
  },
  successBanner: {
    backgroundColor: '#28a745',
  },
  errorBanner: {
    backgroundColor: '#dc3545',
  },
  bannerText: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1, // Allows text to take available space
  },
  closeButton: {
    marginLeft: 10, // Add some spacing between text and button
    padding: 5,
  },
});

export default Banner;
