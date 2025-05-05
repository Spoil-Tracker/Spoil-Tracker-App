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
 * @param {Function} [onSelectSuggestion] - Optional callback invoked when a suggestion is selected.
 */
import React, { useState, useEffect, useCallback } from 'react';
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

import { useAuth } from '@/services/authContext';
import { getAccountByOwnerID } from '@/components/Account/AccountService';
import {
  searchGroceryLists,
  fetchGroceryListByID
} from './GroceryList/GroceryListService';
import { searchFoodGlobalByFoodName } from './Food/FoodGlobalService';
import { searchCustomItemsFromAccount } from './Account/AccountService';
import {
  searchPantries,
  fetchPantryByID
} from './Pantry/PantryService';

import ProductPage from './Food/FoodUI';
import ViewGroceryList from '@/components/GroceryList/ListUI_ViewOnly';
// import ViewPantry from '@/components/Pantry/PantryUI';

interface GroceryListItem { id: string; name: string; }

interface PantryItem { id: string; name: string; }

interface Props {
  onSelectSuggestion?: (suggestion: any, section: string) => void;
}

const SearchSuggestionsComponent: React.FC<Props> = ({ onSelectSuggestion }) => {
  const { user } = useAuth();
  const [accountId, setAccountId] = useState<string>('');

  // --- local state for search/UI ---
  const [query, setQuery] = useState('');
  const [groceryListResults, setGroceryListResults] = useState<GroceryListItem[]>([]);
  const [foodGlobalResults, setFoodGlobalResults] = useState<any[]>([]);
  const [customItemsResults, setCustomItemsResults] = useState<any[]>([]);
  const [pantryResults, setPantryResults] = useState<PantryItem[]>([]);      // ← NEW

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch accountId on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const account = await getAccountByOwnerID(user.uid);
        setAccountId(account.id);
      } catch (err) {
        console.error('Failed to fetch account:', err);
      }
    })();
  }, [user]);

  const performSearch = async (q: string) => {
    if (!accountId) return;
    if (q.trim().length === 0) {
      setGroceryListResults([]);
      setFoodGlobalResults([]);
      setCustomItemsResults([]);
      setPantryResults([]);                             // ← CLEAR
      return;
    }

    try {
      // 1) grocery lists
      const groceryIds = await searchGroceryLists(accountId, q);
      const groceryLists = await Promise.all(
        groceryIds.map(async (id: string) => {
          const list = await fetchGroceryListByID(id);
          return { id, name: list?.grocerylist_name ?? 'Unknown' };
        })
      );

      // 2) products & custom items
      const [ foodGlobals, customItems ] = await Promise.all([
        searchFoodGlobalByFoodName(q),
        searchCustomItemsFromAccount(accountId, q),
      ]);

      const pantryIds = await searchPantries(accountId, q);
      const pantries = await Promise.all(
        pantryIds.map(async (id: string) => {
          const p = await fetchPantryByID(id);
          return { id, name: p?.pantry_name ?? 'Unknown' };
        })
      );

      setGroceryListResults(groceryLists);
      setFoodGlobalResults(foodGlobals);
      setCustomItemsResults(customItems);
      setPantryResults(pantries);                       // ← SET
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const debouncedSearch = useCallback(debounce(performSearch, 300), [accountId]);

  const handleInputChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  // add a new Pantries section
  const sections = [
    { title: 'Grocery Lists', data: groceryListResults },
    { title: 'Products',     data: foodGlobalResults },
    { title: 'Custom Items', data: customItemsResults },
    { title: 'Pantries',     data: pantryResults },  // ← NEW
  ];

  const handleSuggestionPress = (item: any, section: string) => {
    setSelectedItem(item);
    setSelectedSection(section);
    setModalVisible(true);
    onSelectSuggestion?.(item, section);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
    setSelectedSection(null);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        value={query}
        onChangeText={handleInputChange}
        editable={!!accountId}
      />

      {query.length > 0 && (
        <ScrollView
          style={styles.resultsContainer}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
        >
          {sections.map(({ title, data }) => (
            <View key={title} style={styles.section}>
              <Text style={styles.sectionTitle}>{title}</Text>
              {data.length > 0 ? (
                data.map((item: any, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.item}
                    onPress={() => handleSuggestionPress(item, title)}
                  >
                    <Text>
                    {title === 'Grocery Lists' || title === 'Pantries'
                      ? item.name
                      : typeof item === 'string'
                      ? item
                      :
                        item.food_name ?? item.title ?? item.username ?? 'Unknown'}
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

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSection === 'Grocery Lists' ? (
              <ViewGroceryList id={selectedItem.id} />
            ) : selectedSection === 'Pantries' ? (
              <Text>Pantry: {selectedItem.name}</Text>
            ) : selectedSection ? (
              <ProductPage foodId={selectedItem.id} accountId={accountId} />
            ) : (
              <Text>No item selected.</Text>
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
    position: 'relative',
    overflow: 'visible',
    zIndex: 1,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
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
    zIndex: 9999,
    elevation: 20,
    marginTop: 5,
    overflow: 'visible',
  },
  resultsContent: {
    paddingVertical: 5,
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
});

export default SearchSuggestionsComponent;
