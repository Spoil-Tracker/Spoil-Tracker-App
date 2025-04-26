import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getAllPantriesforAccount } from '@/components/Pantry/PantryService';

/**
 * @file PantryDropdownComponent.tsx
 * @description
 * A reusable dropdown component for selecting one of the user's pantries.
 * Fetches all pantries for a given account and lets the user search/select.
 * Displays a loading spinner while fetching.
 */

/** Represents one pantry in the dropdown. */
interface PantryDropdownOption {
  label: string; // pantry name
  value: string; // pantry id
}

interface PantryDropdownProps {
  /**
   * The ID of the account whose pantries should be fetched.
   */
  accountId: string;
  /**
   * Callback fired when the user selects a pantry.
   * @param selectedItem The ID of the selected pantry, or null if cleared.
   */
  onValueChange: (selectedItem: string | null) => void;
}

/**
 * A dropdown component that displays all pantries for an account.
 *
 * Features:
 * - Fetches pantry list on mount or whenever `accountId` changes.
 * - Shows a loading indicator while fetching.
 * - Allows searching by pantry name.
 * - Displays a floating label when focused or a value is selected.
 *
 * @param accountId The account whose pantries to load.
 * @param onValueChange Called with the selected pantry ID.
 */
const PantryDropdownComponent: React.FC<PantryDropdownProps> = ({ accountId, onValueChange }) => {
  /** Currently selected pantry ID (valueField). */
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  /** Whether the dropdown currently has focus (for styling). */
  const [isFocus, setIsFocus] = useState(false);
  /** The list of pantry options, mapped to { label, value }. */
  const [data, setData] = useState<PantryDropdownOption[]>([]);
  /** Loading flag while fetching pantry data. */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Fetches pantries for the given accountId, maps them into the
     * format the Dropdown component expects, and handles errors.
     */
    const fetchPantries = async () => {
      try {
        const pantries = await getAllPantriesforAccount(accountId);
        const mapped = pantries.map((p: any) => ({
          label: p.pantry_name ?? p.name ?? 'Untitled Pantry',
          value: p.id,
        }));
        setData(mapped);
      } catch (err) {
        console.error('Error fetching pantries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPantries();
  }, [accountId]);
  
  /**
   * Conditionally renders the floating label above the dropdown.
   * Visible when a value is selected or the dropdown is focused.
   */
  const renderLabel = () => {
    if (selectedValue || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'green' }]}>
          Select Pantry
        </Text>
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
        placeholder={!isFocus ? 'Select pantry' : '...'}
        searchPlaceholder="Search pantries..."
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
            name="inbox"
            size={20}
            color="green"
          />
        )}
      />
    </View>
  );
};

export default PantryDropdownComponent;

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
