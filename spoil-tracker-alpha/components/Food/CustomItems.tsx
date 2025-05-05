import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FoodGlobal } from '@/components/Food/FoodGlobalService';
import CustomGroceryItemScreen from './AddCustom';
import { deleteCustomItem, getAccountByOwnerID } from '@/components/Account/AccountService';
import { useAuth } from '@/services/authContext';

interface CustomItemsMenuProps {
  customItems: FoodGlobal[];
  title?: string;
  onItemsChange?: () => void;
}

const DROPDOWN_EXPANDED_HEIGHT = 200;

const CustomItemsMenu: React.FC<CustomItemsMenuProps> = ({
  customItems,
  title = 'Custom Items',
  onItemsChange,
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const [items, setItems] = useState<FoodGlobal[]>(customItems);
  const { user } = useAuth();

  const toggleDropdown = () => {
    setExpanded(prev => !prev);
  };

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, animation]);

  useEffect(() => {
    setItems(customItems);
  }, [customItems]);

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, DROPDOWN_EXPANDED_HEIGHT],
  });

  const handleDelete = async (itemId: string) => {
    try {
      if (!user) return;
      const account = await getAccountByOwnerID(user.uid);
      await deleteCustomItem(account.id, itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      Alert.alert('Item Deleted', 'The custom item was deleted successfully.');
      onItemsChange?.();
    } catch (error) {
      console.error('Error deleting custom item:', error);
      Alert.alert('Error', 'Failed to delete the item.');
    }
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
      <Text
        style={styles.itemTitle}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.food_name}
      </Text>
      <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { width: '100%' }]}>  
      <Pressable onPress={toggleDropdown} style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </Pressable>

      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>      
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item.id ? item.id : index.toString())}
          horizontal
          contentContainerStyle={styles.listContainer}
          showsHorizontalScrollIndicator={false}
        />
      </Animated.View>

      <View style={styles.buttonRow}>
        <Pressable onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New Virtual Item</Text>
        </Pressable>
        <Pressable onPress={() => router.push('../barcodeScanning')} style={styles.scanButton}>
          <Text style={styles.scanButtonText}>Scan Real Item</Text>
        </Pressable>
      </View>

      {/* Add Item Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <CustomGroceryItemScreen
            onItemAdded={() => {
              onItemsChange?.();
              setModalVisible(false);
            }}
          />
          <Pressable
            onPress={() => setModalVisible(false)}
            style={styles.closeModalButton}
          >
            <Text style={styles.closeModalText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

export default CustomItemsMenu;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  header: {
    backgroundColor: '#f3e5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8e44ad',
    width: '100%',
  },
  headerText: {
    fontSize: 18,
    color: '#8e44ad',
    fontFamily: 'inter-bold',
    textAlign: 'center',
  },
  dropdown: {
    overflow: 'hidden',
  },
  listContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  itemContainer: {
    marginRight: 10,
    alignItems: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: 140,
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    aspectRatio: 1,
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
    fontFamily: 'inter-bold',
  },
  deleteButton: {
    marginTop: 5,
    backgroundColor: '#d9534f',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'inter-bold',
  },
  buttonRow: {
    // flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#8e44ad',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    marginVertical: 2
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'inter-bold',
  },
  scanButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    marginVertical: 2
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'inter-bold',
  },
  closeModalButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 20,
  },
  closeModalText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
