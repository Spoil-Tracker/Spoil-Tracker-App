import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Image, Animated } from 'react-native';
import { FoodGlobal } from '@/components/Food/FoodGlobalService'; 

interface CustomItemsMenuProps {
  customItems: FoodGlobal[];
  title?: string;
}

const CustomItemsMenu: React.FC<CustomItemsMenuProps> = ({ customItems, title = "Custom Items" }) => {
  const [expanded, setExpanded] = useState(false);
  // Create an animated value that will control the dropdown animation.
  const animation = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    setExpanded(prev => !prev);
  };

  // Animate the dropdown whenever the expanded state changes.
  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [expanded, animation]);

  // Interpolate the animated value for opacity and a slight vertical slide.
  const dropdownStyle = {
    opacity: animation,
    transform: [{
      translateY: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 0],
      })
    }]
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
      <Animated.View style={[styles.dropdown, dropdownStyle]}>
        <FlatList
          data={customItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          contentContainerStyle={styles.listContainer}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    backgroundColor: '#f3e5f5', // light lavender background
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8e44ad', // purple border
  },
  headerText: {
    fontSize: 18,
    color: '#8e44ad', // purple text
    fontFamily: 'inter-bold',
    textAlign: 'center',
  },
  dropdown: {
    overflow: 'hidden', // ensures the animated view clips its content during the animation
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
