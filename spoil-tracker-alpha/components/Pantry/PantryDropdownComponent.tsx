import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getAllFoodGlobal } from '@/components/Food/FoodGlobalService';

interface FoodGlobalDropdownOption {
  label: string;
  value: string; // value = food_global.id
  image_url: string;
}

interface PantryDropdownProps {
  accountId?: string | null;
  onValueChange: (selectedItem: FoodGlobalDropdownOption | null) => void;
  currentValue?: string | null;
  setDropdownOptions?: (options: {
    [id: string]: { label: string; image_url: string };
  }) => void;
}

// creates a pantry dropdown component displaying all the items in food global
const PantryDropdownComponent: React.FC<PantryDropdownProps> = ({
  accountId,
  onValueChange,
  currentValue,
  setDropdownOptions,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(
    currentValue || null
  );
  const [isFocus, setIsFocus] = useState(false);
  const [data, setData] = useState<FoodGlobalDropdownOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        const globalFoods = await getAllFoodGlobal();

        const mappedFoods = globalFoods.map((food: any) => ({
          label: food.food_name,
          value: food.id, // uses foodglobal id directly
          image_url: food.food_picture_url || 'https://placehold.co/100x100', // fallback if unable to load
        }));

        setData(mappedFoods);
        if (setDropdownOptions) {
          const dataMap: {
            [id: string]: { label: string; image_url: string };
          } = {};
          mappedFoods.forEach((food: any) => {
            dataMap[food.value] = {
              label: food.label,
              image_url: food.image_url,
            };
          });
          setDropdownOptions(dataMap);
        }
      } catch (error) {
        console.error('Error fetching food data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodData();
  }, [accountId]);

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

  // displays a modal allowing to add items to the pantry
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
        onChange={(item) => {
          setSelectedValue(item.value);
          onValueChange(item);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color="blue"
            name="shoppingcart"
            size={20}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: 16,
    width: '100%',
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

export default PantryDropdownComponent;
