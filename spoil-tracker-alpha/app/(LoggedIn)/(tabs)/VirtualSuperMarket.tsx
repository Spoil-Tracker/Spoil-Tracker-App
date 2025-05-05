import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { getAllFoodGlobal } from '@/components/Food/FoodGlobalService';
import ProductPage from '@/components/Food/FoodUI'; // product page displaying all the foods
import { useAuth } from '@/services/authContext'; // calls account auth for transfering items to pantry/ grocery list
import { getAccountByOwnerID } from '@/components/Account/AccountService'; // calls account id for transfering items to pantry/ grocery list
import { useTheme } from 'react-native-paper'; // allows for dark mode

// virtual supermarket that displays all of the items available in the server
const VirtualSupermarket = () => {
  const [foodByCategory, setFoodByCategory] = useState<{
    [category: string]: any[];
  }>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [accountId, setAccountId] = useState<string | null>(null);
  const { colors } = useTheme();

  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // fetches food data to display to the user
  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        const foods = await getAllFoodGlobal();
        const categorized: { [category: string]: any[] } = {};

        foods.forEach((food: any) => {
          if (!categorized[food.food_category]) {
            categorized[food.food_category] = [];
          }
          categorized[food.food_category].push(food);
        });

        setFoodByCategory(categorized);
      } catch (error) {
        console.error('Error fetching foods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodData();
  }, []);

  // loads account information
  useEffect(() => {
    const loadAccount = async () => {
      if (!user) return;
      const account = await getAccountByOwnerID(user.uid);
      setAccountId(account.id);
    };
    loadAccount();
  }, [user]);

  // modal for displaying information of that specific food
  const openProductModal = (foodGlobalId: string) => {
    setSelectedFoodId(foodGlobalId);
    setProductModalVisible(true);
  };

  // closes the modal
  const closeProductModal = () => {
    setSelectedFoodId(null);
    setProductModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  const allFoodItems = Object.values(foodByCategory).flat();
  const initialItems = allFoodItems.slice(0, 8);
  const remainingItems = allFoodItems.slice(8);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // displays everything to the user
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <Text style={[styles.title, { color: '#4CAE4F', fontSize: 40 }]}>
          Virtual Supermarket
        </Text>

        {/* All Items expandable card */}
        <View style={styles.categoryCard}>
          <Text style={styles.categoryTitle}>All Items</Text>
          <View style={styles.foodGrid}>
            {initialItems.map((food) => (
              <Pressable
                key={food.id}
                style={styles.foodItem}
                onPress={() => openProductModal(food.id)}
              >
                <Image
                  source={{
                    uri: food.food_picture_url || 'https://placehold.co/80x80',
                  }}
                  style={styles.foodImage}
                />
                <Text style={styles.foodName}>{food.food_name}</Text>
              </Pressable>
            ))}

            {expanded &&
              remainingItems.map((food) => (
                <Pressable
                  key={food.id}
                  style={styles.foodItem}
                  onPress={() => openProductModal(food.id)}
                >
                  <Image
                    source={{
                      uri:
                        food.food_picture_url || 'https://placehold.co/80x80',
                    }}
                    style={styles.foodImage}
                  />
                  <Text style={styles.foodName}>{food.food_name}</Text>
                </Pressable>
              ))}
          </View>

          <Pressable onPress={toggleExpand} style={styles.expandButton}>
            <Text style={styles.expandButtonText}>
              {expanded ? 'Collapse' : 'Expand'}
            </Text>
          </Pressable>
        </View>

        {/* Other categories */}
        {Object.entries(foodByCategory).map(([category, foodItems]) => (
          <View key={category} style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {foodItems.map((food) => (
                <Pressable
                  key={food.id}
                  style={styles.foodItem}
                  onPress={() => openProductModal(food.id)}
                >
                  <Image
                    source={{
                      uri:
                        food.food_picture_url || 'https://placehold.co/80x80',
                    }}
                    style={styles.foodImage}
                  />
                  <Text style={styles.foodName}>{food.food_name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {/* Modal for viewing a single product */}
      <Modal
        visible={productModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeProductModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Pressable onPress={closeProductModal} style={styles.closeButton}>
              <Text style={{ fontSize: 24 }}>✕</Text>
            </Pressable>

            {selectedFoodId && accountId && (
              <ScrollView style={{ flex: 1 }}>
                <ProductPage foodId={selectedFoodId} accountId={accountId} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VirtualSupermarket;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontFamily: 'inter-bold',
    marginVertical: 15,
    alignSelf: 'center',
  },
  categoryCard: {
    width: '75%',
    alignSelf: 'center',
    backgroundColor: '#f9f9f9',
    marginVertical: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  foodItem: {
    width: 105,
    margin: 5,
    alignItems: 'center',
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 5,
  },
  foodName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
  expandButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  expandButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '40%',
    height: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 10,
    padding: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 10,
  },
});
