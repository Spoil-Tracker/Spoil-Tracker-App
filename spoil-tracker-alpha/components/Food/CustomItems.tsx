import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Image } from 'react-native';
import { FoodGlobal } from '@/components/Food/FoodGlobalService'; 

interface CustomItemsMenuProps {
  customItems: FoodGlobal[];
  title?: string;
}

const CustomItemsMenu: React.FC<CustomItemsMenuProps> = ({ customItems, title = "Custom Items" }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleDropdown = () => {
    setExpanded(prev => !prev);
  };

  const renderItem = ({ item }: { item: FoodGlobal }) => (
    <View style={styles.itemContainer}>
      {item.food_picture_url ? (
        <Image source={{ uri: item.food_picture_url }} style={styles.itemImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <Text style={styles.itemTitle}>{item.food_name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleDropdown} style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </Pressable>
      {expanded && (
        <FlatList
          data={customItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    backgroundColor: '#e2e6ea',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  headerText: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  itemContainer: {
    width: 120,
    marginRight: 10,
    alignItems: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    backgroundColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
  },
  itemTitle: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CustomItemsMenu;