import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getCustomItemsFromAccount } from '@/components/Account/AccountService'; // Adjust path as needed

interface FoodDropdownOption {
  label: string;
  value: string;
}

interface FoodDropdownProps {
  accountId: string;
  // Callback receives the entire selected item (or null if nothing selected)
  onValueChange: (selectedItem: FoodDropdownOption | null) => void;
}

const FoodDropdownComponent: React.FC<FoodDropdownProps> = ({ accountId, onValueChange }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [data, setData] = useState<FoodDropdownOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomItems = async () => {
      try {
        const customItems = await getCustomItemsFromAccount(accountId);
        // Map the fetched custom items to the dropdown format.
        const mappedItems = customItems.map((item: any) => ({
          label: item.food_name,
          value: item.id,
        }));
        setData(mappedItems);
      } catch (error) {
        console.error('Error fetching custom items data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomItems();
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
            color="blue"
            name="shoppingcart"
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
