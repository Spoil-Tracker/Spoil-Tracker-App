import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { fetchAllGroceryLists, GroceryList } from '@/components/GroceryList/GroceryListService';

/**
 * Represents one grocery list option in the dropdown.
 */
interface GroceryListDropdownOption {
  label: string; // grocery list name
  value: string; // grocery list id
}

interface GroceryListDropdownProps {
  accountId: string;
  onValueChange: (selectedListId: string | null) => void;
}

const GroceryListDropdownComponent: React.FC<GroceryListDropdownProps> = ({ accountId, onValueChange }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [data, setData] = useState<GroceryListDropdownOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const lists = await fetchAllGroceryLists(accountId);
        const mapped = lists.map((list: GroceryList) => ({
          label: list.grocerylist_name || 'Untitled List',
          value: list.id,
        }));
        setData(mapped);
      } catch (err) {
        console.error('Error fetching grocery lists:', err);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    loadLists();
  }, [accountId]);

  const renderLabel = () => {
    if (selectedValue || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'green' }]}>Select List</Text>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'green' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select grocery list' : '...'}
        searchPlaceholder="Search lists..."
        value={selectedValue}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setSelectedValue(item.value);
          onValueChange(item.value);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            name="profile"
            size={20}
            color="green"
          />
        )}
      />
    </View>
  );
};

export default GroceryListDropdownComponent;

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
