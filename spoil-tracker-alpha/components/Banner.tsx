import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BannerProps {
  message: string;
  type: 'success' | 'error';
}

const Banner: React.FC<BannerProps> = ({ message, type }) => {
  return (
    <View
      style={[
        styles.banner,
        type === 'success' ? styles.successBanner : styles.errorBanner,
      ]}
    >
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 15,
    margin: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});

export default Banner;