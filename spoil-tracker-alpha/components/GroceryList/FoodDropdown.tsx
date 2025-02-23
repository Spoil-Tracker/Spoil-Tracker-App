import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getAllFoodGlobal } from '@/components/Food/FoodGlobalService'; // adjust path as needed

interface FoodDropdownOption {
  label: string;
  value: string;
}

interface FoodDropdownProps {
  // Callback receives the entire selected item (or null if nothing selected)
  onValueChange: (selectedItem: FoodDropdownOption | null) => void;
}

const FoodDropdownComponent: React.FC<FoodDropdownProps> = ({ onValueChange }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [data, setData] = useState<FoodDropdownOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        const foods = await getAllFoodGlobal();
        // Map the fetched food items to the dropdown format.
        const mappedFoods = foods.map((food: any) => ({
          label: food.food_name,
          value: food.id,
        }));
        setData(mappedFoods);
      } catch (error) {
        console.error('Error fetching food data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodData();
  }, []);

  const renderLabel = () => {
    if (selectedValue || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          Select Food
        </Text>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select food' : '...'}
        searchPlaceholder="Search..."
        value={selectedValue}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setSelectedValue(item.value);
          // Pass the entire item (both label and value) to the parent
          onValueChange(item);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? 'blue' : 'black'}
            name="Safety"
            size={20}
          />
        )}
      />
    </View>
  );
};

export default FoodDropdownComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
