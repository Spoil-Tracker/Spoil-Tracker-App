import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  Image
} from 'react-native';
import { useTheme } from 'react-native-paper';

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

export interface GroceryList {
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
  snapshotAt?: string;
}

interface ViewGroceryListProps {
  groceryList: GroceryList;
}

const ViewGroceryList: React.FC<ViewGroceryListProps> = ({ groceryList }) => {
  const { height, width } = useWindowDimensions()
  const { colors } = useTheme();

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
        {groceryList.snapshotAt && (
          <Text style={styles.snapshotText}>
            Posted: {new Date(groceryList.snapshotAt).toLocaleString()}
          </Text>
        )}
        <Text style={styles.sectionHeader}>Items</Text>
      </ScrollView>
      <FlatList
          style={{borderRadius: 10}}
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
    height: 200,
    marginRight: 10,
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: 100,
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
  snapshotText: {
    fontSize: 12,
    color: '#555',
    marginTop: 5,
  },
});

export default ViewGroceryList;
