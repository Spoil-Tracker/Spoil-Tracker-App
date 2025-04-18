import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { createFoodGlobal } from '@/components/Food/FoodGlobalService'; // Adjust the path as necessary
import foodData from '@/foodGlobal.json'; // Ensure this path points to your JSON file

const ImportFoodData: React.FC = () => {
  const importData = async () => {
    try {
      for (const item of foodData) {
        await createFoodGlobal(
          item.food_name,
          item.food_category,
          item.food_picture_url,
          item.amount_per_serving,
          item.description,
          { ...item.macronutrients }, // ensures a plain object
          { ...item.micronutrients }  // ensures a plain object
        );
      }
      Alert.alert('Success', 'Food data imported successfully.');
    } catch (error) {
      console.error('Error importing food data:', error);
      Alert.alert('Error', 'There was an error importing the food data.');
    }
  };

  return (
      <Pressable
        onPress={importData}
        style={{
          backgroundColor: '#007AFF',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Import Food Data</Text>
      </Pressable>
  );
};

export default ImportFoodData;
