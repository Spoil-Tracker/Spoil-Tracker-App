/**
 * ViewGroceryList Component
 *
 * This component displays a detailed view of a single grocery list.
 * It fetches the grocery list data by its ID, displays its title, creation date,
 * description, and a horizontally scrolling list of its items.
 *
 * The component uses:
 * - A ScrollView to display the grocery list's header information.
 * - A FlatList to render grocery list items horizontally.
 * - ActivityIndicator to show a loading spinner while data is being fetched.
 *
 * The component is styled using React Native's StyleSheet and adapts to the window width.
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
  useWindowDimensions
} from 'react-native';
import { fetchGroceryListByID } from '@/components/GroceryList/GroceryListService';
import { useTheme } from 'react-native-paper';

// ===== Type Definitions =====

/**
 * Represents an item within a grocery list.
 */
interface GroceryListItem {
  id: string;
  food_name: string;
  food_global_id: string;
  measurement: string;
  quantity: number;
  isBought: boolean;
  description: string;
  imageUrl: string;
}

/**
 * Represents a grocery list.
 */
interface GroceryList {
  id: string;
  account_id: string;
  createdAt: string;
  last_opened: string;
  grocerylist_name: string;
  description: string;
  grocery_list_items: GroceryListItem[];
  isFamily: boolean;
  isShared: boolean;
  isComplete: boolean;
}

/**
 * Props for the ViewGroceryList component.
 */
interface ViewGroceryListProps {
  id: string;
}

// ==============================

/**
 * ViewGroceryList Component
 *
 * Fetches and displays a grocery list based on the provided ID.
 *
 * @param {ViewGroceryListProps} props - The component props containing the grocery list ID.
 * @returns A JSX.Element representing the grocery list view.
 */
const ViewGroceryList: React.FC<ViewGroceryListProps> = ({ id }) => {
  // Get the current window width to set the component width dynamically.
  const { width } = useWindowDimensions();

  // Local state for the grocery list data and loading status.
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);

  // Retrieve theme colors from React Native Paper.
  const { colors } = useTheme();

  // Fetch the grocery list data when the component mounts or the id prop changes.
  useEffect(() => {
    const fetchList = async () => {
      try {
        const list = await fetchGroceryListByID(id);
        if (list) {
          setGroceryList(list);
        }
      } catch (error) {
        console.error('Error fetching grocery list:', error);
      }
      setLoading(false);
    };
    fetchList();
  }, [id]);

  /**
   * Renders a single grocery list item.
   *
   * @param {Object} param0 - The item object containing grocery list item data.
   * @returns A JSX.Element representing the rendered grocery list item.
   */
  const renderItem = ({ item }: { item: GroceryListItem }) => (
    <View style={styles.itemContainer}>
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.itemImage} 
          resizeMode="contain"
        />
      ) : null}
      <Text style={styles.itemTitle}>{item.food_name}</Text>
      <Text style={styles.itemDetail}>
        {item.quantity} {item.measurement}
      </Text>
      {item.description ? (
        <Text style={styles.itemDescription} numberOfLines={1} ellipsizeMode="tail">
          {item.description}
        </Text>
      ) : null}
    </View>
  );

  // Display a loading spinner while data is being fetched.
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </SafeAreaView>
    );
  }

  // Display an error message if no grocery list was found.
  if (!groceryList) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>Grocery list not found.</Text>
      </SafeAreaView>
    );
  }

  // Format the createdAt date to a user-friendly string.
  const formattedDate = new Date(groceryList.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, width: width - 10 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{groceryList.grocerylist_name}</Text>
        <Text style={styles.subTitle}>Created: {formattedDate}</Text>
        {groceryList.description ? (
          <Text style={styles.description}>{groceryList.description}</Text>
        ) : null}
        <Text style={styles.sectionHeader}>Items</Text>
      </ScrollView>
      <FlatList
          style={{ borderRadius: 10 }}
          data={groceryList.grocery_list_items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    maxWidth: 1000
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'inter-bold',
    color: '#2196F3',
    marginBottom: 10,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 28,
    fontFamily: 'inter-bold',
    color: '#007bff',
    marginTop: 20,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  itemContainer: {
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    width: 150,
    height: 200, // Increased height to allow room for the image and texts.
    marginRight: 10,
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: 100, // Increased height for the image.
    borderRadius: 8,
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'inter-bold',
    color: '#007bff',
    textAlign: 'center',
  },
  itemDetail: {
    fontSize: 14,
    color: '#333',
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 20,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ViewGroceryList;
