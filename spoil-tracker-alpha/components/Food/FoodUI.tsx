import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  useWindowDimensions, 
  View, 
  Text, 
  StyleSheet,  
  Pressable, 
  Image, 
  TextInput, 
  ScrollView,
  Platform, 
} from 'react-native';
import { getFoodGlobalById, FoodGlobal } from '@/components/Food/FoodGlobalService';
import { getCustomItemsFromAccount } from '@/components/Account/AccountService';
import { platform } from 'os';

/**
 * ProductPage component displays details about a food product.
 * Best used as a modal whenever a user clicks on a food / grocery product.
 * 
 * If the global food lookup returns no result, it will attempt to
 * search the account's custom items.
 *
 * @param props - Component props.
 * @param props.foodId - The unique identifier for the food item.
 * @param props.accountId - The account ID to search for custom items.
 * @returns A React element representing the product page.
 */
export default function ProductPage({ foodId, accountId }: { foodId: string; accountId: string }) {
    const { height, width } = useWindowDimensions();

    // Calculate layout dimensions.
    const pageWidth = width * 0.24;
    const MINWIDTH = 300;

    // State for storing the fetched food data
    const [foodData, setFoodData] = useState<FoodGlobal | null>(null);
    // Loading state.
    const [loading, setLoading] = useState(false);
    // Error message state.
    const [error, setError] = useState('');

    useEffect(() => {
      if (foodId) {
        setLoading(true);
        setError('');
        // First try to get the FoodGlobal item by ID.
        getFoodGlobalById(foodId)
          .then((data) => {
            if (data) {
              // Found global food item.
              setFoodData(data);
            } else {
              // If not found globally, attempt to fetch the account's custom items
              return getCustomItemsFromAccount(accountId)
                .then((customItems) => {
                  // Search for a custom item with matching id.
                  const customItem = customItems.find((item: FoodGlobal) => item.id === foodId);
                  if (customItem) {
                    setFoodData(customItem);
                  } else {
                    setError('Product not found.');
                  }
                });
            }
          })
          .catch((err) => {
            console.error(err);
            setError('Error fetching product.');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }, [foodId, accountId]);

    // The rest of the code below is standard React Native UI components, styling, blah, blah, blah
    if(Platform.OS == 'web') {
      return (
          <View style={{ backgroundColor: 'transparent' }}>
            <ScrollView
              contentContainerStyle={[
                styles.container,
                { width: pageWidth, minWidth: MINWIDTH, height: height - 64 }
              ]}
              showsHorizontalScrollIndicator={false}
            >
              {loading && <Text style={{ color: 'white', textAlign: 'center' }}>Loading...</Text>}
              {error ? <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text> : null}
              {!loading && !error && !foodData && (
                <Text style={{ color: 'white', textAlign: 'center' }}>No product loaded</Text>
              )}
              {foodData && (
                <>
                  <View style={[styles.box, { height: 100, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={[styles.Title, styles.productTitle]}>{foodData.food_name}</Text>
                  </View>
                  <View style={[styles.box, { height: pageWidth, minHeight: MINWIDTH, minWidth: MINWIDTH, width: pageWidth }]}>
                    <Image
                      source={{ uri: foodData.food_picture_url }}
                      style={{ width: '100%', height: '100%', borderRadius: 10 }}
                    />
                  </View>
                  <View style={[styles.box, { height: 150, width: pageWidth, minWidth: MINWIDTH, padding: 10 }]}>
                    <ScrollView showsHorizontalScrollIndicator={false}>
                      <Text style={styles.descriptionText}>{foodData.description}</Text>
                    </ScrollView>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <View
                      style={[
                        styles.box,
                        { width: pageWidth / 2, minWidth: MINWIDTH / 2, height: 300, paddingVertical: 5, alignContent: 'center' }
                      ]}
                    >
                      <View>
                        <Text style={[styles.Title, { fontSize: 20, alignSelf: 'center' }]}>Add comment:</Text>
                      </View>
                      <TextInput
                        style={{
                          width: '90%',
                          height: 200,
                          borderWidth: 1,
                          borderColor: '#ccc',
                          borderRadius: 5,
                          paddingHorizontal: 10,
                          marginTop: 10,
                          alignSelf: 'center'
                        }}
                        placeholder="Type your comment here..."
                        multiline
                      />
                      <Pressable
                        style={[
                          styles.listButton,
                          {
                            width: pageWidth / 2.1,
                            minWidth: MINWIDTH / 2.1,
                            alignSelf: 'center',
                            justifyContent: 'center',
                            height: 40,
                            marginTop: 10,
                            borderRadius: 10
                          }
                        ]}
                        onPress={() => alert('click')}
                      >
                        <Text style={[{ fontFamily: 'inter-bold', color: '#007bff', textAlign: 'center' }]}>
                          Add Comment
                        </Text>
                      </Pressable>
                    </View>
                    <View style={{ justifyContent: 'center' }}>
                      <Pressable
                        style={[styles.sidebarButton, styles.listButton, { width: pageWidth / 2, minWidth: MINWIDTH / 2 }]}
                        onPress={() => alert('click')}
                      >
                        <Text style={[{ fontFamily: 'inter-bold', color: '#007bff', textAlign: 'center' }]}>
                          Add to a List
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.sidebarButton, styles.pantryButton, { width: pageWidth / 2, minWidth: MINWIDTH / 2 }]}
                        onPress={() => alert('click')}
                      >
                        <Text style={[{ fontFamily: 'inter-bold', color: '#39913b', textAlign: 'center' }]}>
                          Add to a Pantry
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.sidebarButton, styles.pantryButton, { width: pageWidth / 2, minWidth: MINWIDTH / 2 }]}
                        onPress={() => alert('click')}
                      >
                        <Text style={[{ fontFamily: 'inter-bold', color: '#39913b', textAlign: 'center' }]}>
                          Add to Intake
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={[styles.box, { height: 70, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={[styles.Title, styles.nutritionTitle]}>Nutrition Facts : {foodData.amount_per_serving}</Text>
                  </View>
                  <View
                    style={[
                      styles.box,
                      { width: pageWidth, minWidth: MINWIDTH, height: 400, flexDirection: 'row', paddingVertical: 5 }
                    ]}
                  >
                    <View style={{ width: pageWidth / 2, minWidth: MINWIDTH / 2 }}>
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Total Fat:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Saturated Fat:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Trans Fat:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Carbohydrates:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Fiber:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Total Sugars:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Added Sugars:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Protein:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Cholesterol:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Sodium:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Vitamin D:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Calcium:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Iron:</Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>Potassium:</Text>
                    </View>
                    <View style={{ height: 400, width: 1, backgroundColor: 'black' }} />
                    <View style={{ width: pageWidth / 2, minWidth: MINWIDTH / 2 }}>
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.macronutrients.total_fat}g
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.macronutrients.sat_fat}g
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.macronutrients.trans_fat}g
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.macronutrients.carbohydrate}g
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.macronutrients.fiber}g
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.macronutrients.total_sugars}g
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.macronutrients.added_sugars}g
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.macronutrients.protein}g
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.micronutrients.cholesterol}mg
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.micronutrients.sodium}mg
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.micronutrients.vitamin_d}mg
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.micronutrients.calcium}mg
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.micronutrients.iron}mg
                      </Text>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>
                        {foodData.micronutrients.potassium}mg
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        );
      }
    if(Platform.OS=='ios') {
      return (
        <View style={{ backgroundColor: 'transparent' }}>
          <ScrollView
            contentContainerStyle={[
              styles.container,
              { width: pageWidth, minWidth: MINWIDTH, flexGrow: 1, minHeight: 1380 }
            ]}
            showsHorizontalScrollIndicator={false}
          >
            {loading && <Text style={{ color: 'white', textAlign: 'center' }}>Loading...</Text>}
            {error ? <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text> : null}
            {!loading && !error && !foodData && (
              <Text style={{ color: 'white', textAlign: 'center' }}>No product loaded</Text>
            )}
            {foodData && (
              <>
                <View style={[styles.box, { minHeight: 100, justifyContent: 'center', alignItems: 'center', minWidth: MINWIDTH }]}>
                  <Text style={[styles.Title, styles.productTitle]}>{foodData.food_name}</Text>
                </View>
                <View style={[styles.box, { minHeight: pageWidth, height: MINWIDTH, minWidth: MINWIDTH, width: pageWidth }]}>
                  <Image
                    source={{ uri: foodData.food_picture_url }}
                    style={{ width: '100%', height: '100%', borderRadius: 10 }}
                  />
                </View>
                <View style={[styles.box, { minHeight: 150, width: pageWidth, minWidth: MINWIDTH, padding: 10 }]}>
                  <ScrollView showsHorizontalScrollIndicator={false}>
                    <Text style={styles.descriptionText}>{foodData.description}</Text>
                  </ScrollView>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <View
                    style={[
                      styles.box,
                      { width: pageWidth / 2, minWidth: MINWIDTH / 2, minHeight: 300, paddingVertical: 5, alignContent: 'center' }
                    ]}
                  >
                    <View>
                      <Text style={[styles.Title, { fontSize: 20, alignSelf: 'center' }]}>Add comment:</Text>
                    </View>
                    <TextInput
                      style={{
                        width: '90%',
                        height: 200,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 5,
                        paddingHorizontal: 10,
                        marginTop: 10,
                        alignSelf: 'center'
                      }}
                      placeholder="Type your comment here..."
                      multiline
                    />
                    <Pressable
                      style={[
                        styles.listButton,
                        {
                          width: pageWidth / 2.1,
                          minWidth: MINWIDTH / 2.1,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          minHeight: 40,
                          marginTop: 10,
                          borderRadius: 10
                        }
                      ]}
                      onPress={() => alert('click')}
                    >
                      <Text style={[{ fontFamily: 'inter-bold', color: '#007bff', textAlign: 'center' }]}>
                        Add Comment
                      </Text>
                    </Pressable>
                  </View>
                  <View style={{ justifyContent: 'center' }}>
                    <Pressable
                      style={[styles.sidebarButton, styles.listButton, { width: pageWidth / 2, minWidth: MINWIDTH / 2 }]}
                      onPress={() => alert('click')}
                    >
                      <Text style={[{ fontFamily: 'inter-bold', color: '#007bff', textAlign: 'center' }]}>
                        Add to a List
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.sidebarButton, styles.pantryButton, { width: pageWidth / 2, minWidth: MINWIDTH / 2 }]}
                      onPress={() => alert('click')}
                    >
                      <Text style={[{ fontFamily: 'inter-bold', color: '#39913b', textAlign: 'center' }]}>
                        Add to a Pantry
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.sidebarButton, styles.pantryButton, { width: pageWidth / 2, minWidth: MINWIDTH / 2 }]}
                      onPress={() => alert('click')}
                    >
                      <Text style={[{ fontFamily: 'inter-bold', color: '#39913b', textAlign: 'center' }]}>
                        Add to Intake
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <View style={[styles.box, { minHeight: 70, justifyContent: 'center', alignItems: 'center', minWidth: MINWIDTH }]}>
                <Text style={[styles.Title, styles.nutritionTitle, { width: '90%', flexShrink: 1 }]}>
                  Nutrition Facts : {foodData.amount_per_serving}
                </Text>
              </View>
                <View
                  style={[
                    styles.box,
                    { width: pageWidth, minWidth: MINWIDTH, height: 400, flexDirection: 'row', paddingVertical: 5 }
                  ]}
                >
                  <View style={{ width: pageWidth / 2, minWidth: MINWIDTH / 2 }}>
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Total Fat:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Saturated Fat:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Trans Fat:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Carbohydrates:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Fiber:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Total Sugars:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Added Sugars:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Protein:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Cholesterol:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Sodium:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Vitamin D:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Calcium:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Iron:</Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>Potassium:</Text>
                  </View>
                  <View style={{ height: 400, width: 1, backgroundColor: 'black' }} />
                  <View style={{ width: pageWidth / 2, minWidth: MINWIDTH / 2 }}>
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.macronutrients.total_fat}g
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.macronutrients.sat_fat}g
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.macronutrients.trans_fat}g
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.macronutrients.carbohydrate}g
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.macronutrients.fiber}g
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.macronutrients.total_sugars}g
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.macronutrients.added_sugars}g
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.macronutrients.protein}g
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.micronutrients.cholesterol}mg
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.micronutrients.sodium}mg
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.micronutrients.vitamin_d}mg
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.micronutrients.calcium}mg
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.micronutrients.iron}mg
                    </Text>
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth }} />
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>
                      {foodData.micronutrients.potassium}mg
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      )
    }
  }

const styles = StyleSheet.create({
    container: {
        alignSelf:'center'
    },
    box: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10
    },
    Title: {
        fontFamily: 'inter-bold',
    },
    productTitle: {
        fontSize: 45,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 20
    },
    sidebarButton: {
      paddingVertical: 10, // reduce vertical padding
      paddingHorizontal: 0,
      borderRadius: 15,
      borderStyle: 'solid',
      borderWidth: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      marginLeft: 5,
      // Remove height: 50 to let the button adapt to the content
    },
    listButton: {
        borderColor: '#007bff',
        backgroundColor: '#e2e6ea',
    },
    pantryButton: {
        borderColor: '#39913b',
        backgroundColor: '#e0e9e0'
    },
    nutritionTitle: {
        fontSize: 30,
        textAlign: 'center',
    },


});