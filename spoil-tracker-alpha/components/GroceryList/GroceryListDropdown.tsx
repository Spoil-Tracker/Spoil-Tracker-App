import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { fetchAllGroceryLists, GroceryList } from '@/components/GroceryList/GroceryListService';

/**
 * @file GroceryListDropdownComponent.tsx
 * @description
 * A reusable dropdown to select one of the user's grocery lists.
 * Fetches all lists for a given account and displays a searchable picker.
 * Shows a loading spinner during network requests.
 */

/**
 * Represents one grocery list option in the dropdown.
 */
interface GroceryListDropdownOption {
  /** The display name of the grocery list. */
  label: string;
  /** The unique identifier of the grocery list. */
  value: string;
}

/**
 * Props accepted by the GroceryListDropdownComponent.
 */
interface GroceryListDropdownProps {
  /**
   * The account ID whose grocery lists should be fetched.
   */
  accountId: string;
  /**
   * Callback invoked when the user selects a list.
   * @param selectedListId The chosen list's ID, or null if cleared.
   */
  onValueChange: (selectedListId: string | null) => void;
}

/**
 * A dropdown component that displays all grocery lists for an account.
 *
 * Features:
 * - Fetches grocery lists on mount or when `accountId` changes.
 * - Renders a loading indicator while fetching.
 * - Supports searching by list name.
 * - Shows a floating label when focused or when a value is selected.
 *
 * @param accountId The ID of the account to load lists for.
 * @param onValueChange Fires with the selected list ID.
 */
const GroceryListDropdownComponent: React.FC<GroceryListDropdownProps> = ({
  accountId,
  onValueChange,
}) => {
  // --------------------------------------------------------------------------
  // Component State
  // --------------------------------------------------------------------------

  /** Currently selected grocery list ID. */
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  /** Whether the dropdown is currently focused (for styling). */
  const [isFocus, setIsFocus] = useState(false);
  /** Array of { label, value } for each grocery list. */
  const [data, setData] = useState<GroceryListDropdownOption[]>([]);
  /** Loading flag while fetching lists. */
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Data Fetching
  // --------------------------------------------------------------------------

  useEffect(() => {
    /**
     * Loads grocery lists from the service, maps them into dropdown options,
     * and handles any errors.
     */
    const loadLists = async () => {
      try {
        const lists = await fetchAllGroceryLists(accountId);
        const mapped = lists.map((list: GroceryList) => ({
          label: list.grocerylist_name ?? 'Untitled List',
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

  // --------------------------------------------------------------------------
  // Render Helpers
  // --------------------------------------------------------------------------

  /**
   * Conditionally renders the floating label above the dropdown.
   * Visible if there’s a selected value or if the control is focused.
   */
  const renderLabel = () => {
    if (selectedValue || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'green' }]}>
          Select List
        </Text>
      );
    }
    return null;
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  // Display spinner while loading
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  // Main dropdown display
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
          // Update internal state, notify parent, and blur
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

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------
const styles = StyleSheet.create({
  /** Wrapper for padding and width */
  container: {
    backgroundColor: 'transparent',
    padding: 16,
    width: '100%',
  },
  /** Base dropdown container */
  dropdown: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  /** Left icon inside dropdown */
  icon: {
    marginRight: 5,
  },
  /** Floating label style */
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  /** Placeholder text style */
  placeholderStyle: {
    fontSize: 16,
  },
  /** Selected text style */
  selectedTextStyle: {
    fontSize: 16,
  },
  /** Dropdown icon container */
  iconStyle: {
    width: 20,
    height: 20,
  },
  /** Search input style */
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
