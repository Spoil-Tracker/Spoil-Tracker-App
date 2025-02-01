import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import NutritionItem from '@/components/NutritionItem'; // Import your NutritionItem component

const data = [
  { id: '1', label: 'Protein', currentCount: 30, goalCount: 50 },
  { id: '2', label: 'Carbs', currentCount: 60, goalCount: 80 },
  { id: '3', label: 'Fats', currentCount: 25, goalCount: 50 },
];

const NutritionList: React.FC = () => {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <NutritionItem
          label={item.label}
          currentCount={item.currentCount}
          goalCount={item.goalCount}
        />
      )}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
});

export default NutritionList;
