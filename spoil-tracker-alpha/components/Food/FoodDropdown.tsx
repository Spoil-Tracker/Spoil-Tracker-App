import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getAllFoodGlobal } from '@/components/Food/FoodGlobalService'; // adjust path as needed
import { getCustomItemsFromAccount } from '@/components/Account/AccountService'; // adjust path as needed

/**
 * Interface for a dropdown option representing a food item.
 */
interface FoodDropdownOption {
  /** Display label for the dropdown option (food name). */
  label: string;
  /** Unique identifier of the food item. */
  value: string;
}

/**
 * Props for the FoodDropdownComponent.
 */
interface FoodDropdownProps {
  /** The account ID used to fetch custom items. */
  accountId: string;
  /**
   * Callback function triggered when a food item is selected.
   * Receives the selected dropdown option (or null if nothing is selected).
   */
  onValueChange: (selectedItem: FoodDropdownOption | null) => void;
}

/**
 * FoodDropdownComponent displays a searchable dropdown that merges global food items
 * with the account's custom items.
 *
 * It fetches both sets of data concurrently and maps them into a dropdown format.
 *
 * @param {FoodDropdownProps} props - Component props containing accountId and onValueChange callback.
 * @returns A React element that renders the dropdown.
 */
const FoodDropdownComponent: React.FC<FoodDropdownProps> = ({ accountId, onValueChange }) => {
  // State for the selected dropdown value.
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  // State to track if the dropdown is focused (for styling).
  const [isFocus, setIsFocus] = useState(false);
  // Data state holding the array of FoodDropdownOption items.
  const [data, setData] = useState<FoodDropdownOption[]>([]);
  // Loading state for data fetching.
  const [loading, setLoading] = useState(true);

  /**
   * Fetches food data by concurrently calling global and custom items APIs.
   * Merges the two arrays, maps each food item to the dropdown option format, and updates state.
   */
  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        // Fetch both global foods and account custom items concurrently
        const [globalFoods, customFoods] = await Promise.all([
          getAllFoodGlobal(),
          getCustomItemsFromAccount(accountId),
        ]);
        // Merge the two arrays
        const allFoods = [...globalFoods, ...customFoods];
        // Map each food item to an object with "label" (food name) and "value" (food id).
        const mappedFoods = allFoods.map((food: any) => ({
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
  }, [accountId]);

  
  /**
   * Renders the label "Select Food" above the dropdown when focused or when an item is selected.
   *
   * @returns A Text component with the label or null if not needed.
   */
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

  // Render an activity indicator while loading.
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
            color='blue'
            name="shoppingcart"
            size={20}
          />
        )}
      />
    </View>
  );
};

export default FoodDropdownComponent;

/**
 * Style definitions for the FoodDropdownComponent.
 */
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: 16,
    width: '100%'
  },
  dropdown: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    backgroundColor: 'white',
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
