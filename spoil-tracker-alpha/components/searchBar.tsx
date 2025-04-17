/**
 * SearchSuggestionsComponent
 * 
 * A component that provides a debounced search bar to query for:
 * - Grocery Lists (by account)
 * - Products (FoodGlobal items)
 * - Custom Items (specific to an account)
 * 
 * The search results are organized into three sections and rendered as clickable suggestions.
 * When a suggestion is pressed, a modal opens displaying a detailed view:
 * - For Grocery Lists, the ViewGroceryList component is rendered.
 * - For Products and Custom Items, the ProductPage component is rendered.
 *
 * @param {string} accountId - The ID of the account for which the search is performed.
 * @param {Function} [onSelectSuggestion] - Optional callback invoked when a suggestion is selected.
 */
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView
} from 'react-native';
import debounce from 'lodash.debounce';
import { searchGroceryLists } from './GroceryList/GroceryListService';
import { searchFoodGlobalByFoodName } from './Food/FoodGlobalService';
import { searchCustomItemsFromAccount } from './Account/AccountService';
import ProductPage from './Food/FoodUI';
import ViewGroceryList from '@/components/GroceryList/ListUI_ViewOnly';

interface Props {
  accountId: string;
  onSelectSuggestion?: (suggestion: any, section: string) => void;
}

const SearchSuggestionsComponent: React.FC<Props> = ({ accountId, onSelectSuggestion }) => {
  // State for the search query input.
  const [query, setQuery] = useState('');
  
  // State for search results in each section.
  const [groceryListResults, setGroceryListResults] = useState<string[]>([]);
  const [foodGlobalResults, setFoodGlobalResults] = useState<any[]>([]);
  const [customItemsResults, setCustomItemsResults] = useState<any[]>([]);
  
  // State to track whether the search is currently loading.
  const [loading, setLoading] = useState(false);
  
  // State to control the visibility of the modal.
  const [modalVisible, setModalVisible] = useState(false);
  
  // State to store the currently selected item.
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // State to store which section the selected item belongs to.
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  /**
   * performSearch
   * 
   * Performs the search by calling the client-side search functions in parallel.
   * If the query is empty, it resets the results.
   *
   * @param {string} q - The search query string.
   */
  const performSearch = async (q: string) => {
    if (q.trim().length === 0) {
      // Clear results if the query is empty.
      setGroceryListResults([]);
      setFoodGlobalResults([]);
      setCustomItemsResults([]);
      return;
    }
    setLoading(true);
    try {
      // Perform all three searches in parallel.
      const [groceryLists, foodGlobals, customItems] = await Promise.all([
        searchGroceryLists(accountId, q),
        searchFoodGlobalByFoodName(q),
        searchCustomItemsFromAccount(accountId, q)
      ]);
      setGroceryListResults(groceryLists);
      setFoodGlobalResults(foodGlobals);
      setCustomItemsResults(customItems);
    } catch (error) {
      console.error('Error performing search:', error);
    }
    setLoading(false);
  };

  // Debounce the search function to avoid firing requests on every keystroke.
  const debouncedSearch = useCallback(debounce(performSearch, 300), [accountId]);

  /**
   * handleInputChange
   * 
   * Updates the query state and triggers the debounced search.
   *
   * @param {string} text - The current text input value.
   */
  const handleInputChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  // Organize search results into sections for rendering.
  const sections = [
    {
      title: 'Grocery Lists',
      data: groceryListResults,
    },
    {
      title: 'Products',
      data: foodGlobalResults,
    },
    {
      title: 'Custom Items',
      data: customItemsResults,
    },
  ];

  /**
   * handleSuggestionPress
   * 
   * Handles the event when a suggestion is pressed. Opens a modal and sets the selected item and section.
   *
   * @param {any} item - The selected search result item.
   * @param {string} section - The section title to which the item belongs.
   */
  const handleSuggestionPress = (item: any, section: string) => {
    // Open the modal for all sections.
    setSelectedItem(item);
    setSelectedSection(section);
    setModalVisible(true);
  };

  /**
   * closeModal
   * 
   * Closes the modal and resets the selected item and section.
   */
  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
    setSelectedSection(null);
  };

  return (
    <View style={styles.container}>
      {/* Search input field */}
      <TextInput
        style={styles.input}
        placeholder="Search..."
        value={query}
        onChangeText={handleInputChange}
      />
      {/* Render search suggestions if query is not empty */}
      {query.length > 0 && (
      <ScrollView
        style={styles.resultsContainer}
        contentContainerStyle={styles.resultsContent}
        keyboardShouldPersistTaps="handled"
      >
        {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.data.length > 0 ? (
          section.data.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => handleSuggestionPress(item, section.title)}
          >
            <Text>
              {typeof item === 'string'
              ? item
                : item.food_name || item.title || item.username}
          </Text>
          </TouchableOpacity>
          ))
          ) : (
          <Text style={styles.noResult}>No results</Text>
        )}
        </View>
        ))}
      </ScrollView>
      )}
      {loading && <Text style={styles.loading}>Loading...</Text>}

      {/* Modal for displaying detailed view */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSection === 'Grocery Lists' ? (
              // For Grocery Lists, the suggestion is an ID, so render the ViewGroceryList component.
              selectedItem ? (
                <ViewGroceryList id={selectedItem} />
              ) : (
                <Text>No grocery list selected.</Text>
              )
            ) : (
              // For Products and Custom Items, render the ProductPage component.
              selectedItem ? (
                <ProductPage foodId={selectedItem.id} accountId={accountId} />
              ) : (
                <Text>No item selected.</Text>
              )
            )}
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    position: 'relative'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontFamily: 'inter-regular',
  },
  resultsContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 250,
    zIndex: 1000,
    elevation: 5,
    marginTop: 5,
  },
  section: {
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'inter-bold',
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  noResult: {
    fontStyle: 'italic',
    color: 'gray',
  },
  loading: {
    marginTop: 10,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    maxWidth: 450,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContent: {
    paddingVertical: 5
  }
});

export default SearchSuggestionsComponent;
