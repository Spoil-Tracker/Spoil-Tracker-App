import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, FlatList, Image } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { auth, db } from '../../../services/firebaseConfig';
import { doc, getDoc, collection, getDocs, DocumentData, updateDoc } from 'firebase/firestore';


export default function NutritionScreen() {
  const router = useRouter();
  const userID = auth.currentUser?.uid;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentData[]>([]);
  const [loggedFoods, setLoggedFoods] = useState<DocumentData[]>([]);

  const [nutrients, setNutrients] = useState([
    { name: 'Calories', unit: 'kcal', total: 0, consumed: 0, color: '#73CFD4' },
    { name: 'Protein', unit: 'g', total: 0, consumed: 0, color: '#FFBB33' },
    { name: 'Carbs', unit: 'g', total: 0, consumed: 0, color: '#FF6666' },
    { name: 'Fats', unit: 'g', total: 0, consumed: 0, color: '#66CC99' },
  ]);

  //const todayStr = selectedDate.toISOString().split('T')[0];

  const updateNutrients = (log: any) => {
    setNutrients(prev => prev.map(n => {
      const key = `consumed${n.name}`;
      return { ...n, consumed: log[key] || 0 };
    }));
  };

  const fetchNutritionData = useCallback(async () => {
    const todayStr = selectedDate.toISOString().split('T')[0];
    if (!userID) return;
    const ref = doc(db, 'nutrition', userID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const goal = data.dailyGoals.find((g: { date: string; }) => g.date === todayStr) || {};
    const log = data.dailyLogs.find((l: { date: string; }) => l.date === todayStr) || {};

    setNutrients([
      { name: 'Calories', unit: 'kcal', total: Math.round((goal.caloriesGoal || 0) * 10) / 10, consumed: log.consumedCalories || 0, color: '#73CFD4' },
      { name: 'Protein', unit: 'g', total: Math.round((goal.proteinGoal || 0) * 10) / 10, consumed: log.consumedProtein || 0, color: '#FFBB33' },
      { name: 'Carbs', unit: 'g', total: Math.round((goal.carbsGoal || 0) * 10) / 10, consumed: log.consumedCarbs || 0, color: '#FF6666' },
      { name: 'Fats', unit: 'g', total: Math.round((goal.fatsGoal || 0) * 10) / 10, consumed: log.consumedFats || 0, color: '#66CC99' },
    ]);
    setLoggedFoods(log.foodItems || []);
  }, [userID, selectedDate]);

  useEffect(() => { fetchNutritionData(); }, [fetchNutritionData]);
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await fetchNutritionData();
      };
      fetchData();
    }, [selectedDate])
  );
  
    
  const changeDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date | null) => {
    const today = new Date();
    return date && date.toDateString() === today.toDateString() ? "Today" : date?.toLocaleDateString();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return setSearchResults([]);
    const snap = await getDocs(collection(db, 'food_global'));
    const results = snap.docs.map(d => d.data()).filter(f => f.food_name.toLowerCase().includes(searchQuery.toLowerCase()));
    setSearchResults(results);
  };

  const handleLogFood = async (food: any) => {
    const todayStr = selectedDate.toISOString().split('T')[0];
    if (!userID) return;
    const ref = doc(db, 'nutrition', userID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    let dailyLogs = data.dailyLogs || [];
    const macros = food.macronutrients;
    food.servingSize = 1;

    let log = dailyLogs.find((l: { date: string; }) => l.date === todayStr) || {
      date: todayStr, consumedCalories: 0, consumedProtein: 0, consumedCarbs: 0, consumedFats: 0, foodItems: []
    };

    log.consumedCalories += Math.round((macros.protein * 4 + macros.carbohydrate * 4 + macros.total_fat * 9) * 10) / 10;
    log.consumedProtein += macros.protein;
    log.consumedCarbs += macros.carbohydrate;
    log.consumedFats += macros.total_fat;
    log.foodItems.push(food);

    dailyLogs = dailyLogs.filter((l: { date: string; }) => l.date !== todayStr);
    dailyLogs.push(log);
    await updateDoc(ref, { dailyLogs });

    setLoggedFoods(log.foodItems);
    updateNutrients(log);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveFood = async (index: any) => {
    const todayStr = selectedDate.toISOString().split('T')[0];
    if (!userID) return;
    const ref = doc(db, 'nutrition', userID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    let dailyLogs = data.dailyLogs || [];
    let log = dailyLogs.find((l: { date: string; }) => l.date === todayStr);
    if (!log) return;

    log.foodItems.splice(index, 1);
    log.consumedCalories = log.consumedProtein = log.consumedCarbs = log.consumedFats = 0;

    for (const food of log.foodItems) {
      const m = food.macronutrients;
      const size = food.servingSize || 1;
      log.consumedCalories += Math.round((m.protein * 4 + m.carbohydrate * 4 + m.total_fat * 9) * size * 10) / 10;
      log.consumedProtein += m.protein * size;
      log.consumedCarbs += m.carbohydrate * size;
      log.consumedFats += m.total_fat * size;
    }

    dailyLogs = dailyLogs.filter((l: { date: string; }) => l.date !== todayStr);
    dailyLogs.push(log);
    await updateDoc(ref, { dailyLogs });

    setLoggedFoods(log.foodItems);
    updateNutrients(log);
  };

  const UpdateServingSize = async (index: any, newSize: any) => {
    const todayStr = selectedDate.toISOString().split('T')[0];
    if (!userID) return;
    const ref = doc(db, 'nutrition', userID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    let dailyLogs = data.dailyLogs || [];
    let log = dailyLogs.find((l: { date: string; }) => l.date === todayStr);
    if (!log) return;

    const food = log.foodItems[index];
    food.servingSize = newSize;

    log.consumedCalories = log.consumedProtein = log.consumedCarbs = log.consumedFats = 0;
    for (const item of log.foodItems) {
      const m = item.macronutrients;
      const size = item.servingSize || 1;
      log.consumedCalories += Math.round((m.protein * 4 + m.carbohydrate * 4 + m.total_fat * 9) * size * 10) / 10;
      log.consumedProtein += m.protein * size;
      log.consumedCarbs += m.carbohydrate * size;
      log.consumedFats += m.total_fat * size;
    }

    dailyLogs = dailyLogs.filter((l: { date: string; }) => l.date !== todayStr);
    dailyLogs.push(log);
    await updateDoc(ref, { dailyLogs });
    setLoggedFoods([...log.foodItems]);
    updateNutrients(log);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Calendar Bar */}
      <View style={styles.calendarBar}>
        <TouchableOpacity onPress={() => changeDay(-1)}>
          <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.todayContainer}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <FontAwesome name="calendar" size={20} color="white" style={styles.calendarIcon} />
          <Text style={styles.todayText}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDay(1)}>
          <AntDesign name="right" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
          inline
        />
      )}

      {/* Search Food */}
      <View style={[styles.cardWrapper, { width: '80%' }]}>
        <Text style={styles.cardTitle}>Log Food Eaten</Text>
        <TextInput
          placeholder="Search food..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
        />

        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.foodCard} onPress={() => handleLogFood(item)}>
              <Image source={{ uri: item.food_picture_url }} style={styles.foodImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{item.food_name}</Text>
                <Text>{item.amount_per_serving}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

       {/* Logged Food Items List */}
      {loggedFoods.length > 0 && (
        <View style={[styles.cardWrapper, { width: '80%' }]}>
          <Text style={styles.cardTitle}>Today's Logged Foods</Text>
          {loggedFoods.map((food, index) => (
            <View key={index} style={styles.foodCard}>
            <Image source={{ uri: food.food_picture_url }} style={styles.foodImage} />
            <View style={styles.foodDetails}>
              <Text style={styles.foodName}>{food.food_name}</Text>
              <Text style={styles.servingInfo}>{food.amount_per_serving}</Text>
          
              <View style={styles.macrosRow}>
                <Text style={styles.macroText}>Calories: {Math.round((food.macronutrients.protein * 4 + food.macronutrients.carbohydrate * 4 + food.macronutrients.total_fat * 9) * 10) / 10} kcal</Text>
              </View>
          
              <View style={styles.macroBreakdown}>
                <Text style={styles.macroValue}>Protein: <Text style={styles.bold}>{food.macronutrients.protein.toFixed(1)}g || </Text></Text>
                <Text style={styles.macroValue}>Carbs: <Text style={styles.bold}>{food.macronutrients.carbohydrate.toFixed(1)}g || </Text></Text>
                <Text style={styles.macroValue}>Fat: <Text style={styles.bold}>{food.macronutrients.total_fat.toFixed(1)}g </Text></Text>
              </View>
          
              <View style={styles.servingRow}>
                <Text style={styles.servingText}>Serving:</Text>
                <TextInput
                  style={styles.servingInput}
                  keyboardType="numeric"
                  value={String(food.servingSize || 1)}
                  onChangeText={(text) => {
                    const parsed = parseFloat(text);
                    if (!isNaN(parsed)) UpdateServingSize(index, parsed);
                  }}
                />
              </View>
            </View>
          
            <TouchableOpacity onPress={() => handleRemoveFood(index)}>
              <AntDesign name="delete" size={22} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          ))}
        </View>
      )} 

      {/* Nutrient Info Grid */}
      <View style={styles.nutrientGrid}>
        {nutrients.map((nutrient, index) => {
          const remaining = nutrient.total - nutrient.consumed;
          const percentage = nutrient.total > 0 ? (nutrient.consumed / nutrient.total) * 100 : 0;
          return (
            <View key={index} style={styles.nutrientBox}>
              <Text style={styles.caloriesGoalText}>{nutrient.name} Goal: {nutrient.total} {nutrient.unit}</Text>
              <AnimatedCircularProgress
                size={100}
                width={8}
                fill={percentage}
                tintColor={nutrient.color}
                backgroundColor='white'
                rotation = {0}
                lineCap = 'round'
              >
                {() => (
                  <Text style={styles.percentageText}>{percentage.toFixed(2)}%</Text>
                )}
              </AnimatedCircularProgress>
              <View style={styles.caloriesInfo}>
                <Text style={[styles.caloriesText, styles.rightAlign]}>Consumed: {nutrient.consumed} {nutrient.unit}</Text>
                <Text style={[styles.caloriesText, styles.rightAlign]}>Remaining: {remaining} {nutrient.unit}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Manage Nutrition Metric Button */}
      <TouchableOpacity style={styles.manageButton} onPress={() => router.push('/ManageNutrition')}>
        <Text style={styles.manageButtonText}>Set Daily Goals</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#FEF9F2',
    padding: 20,
  },
  calendarBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 20,
    backgroundColor: '#4CAE4F',
    padding: 10,
    borderRadius: 10,
  },
  todayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 8,
  },
  todayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  manageButton: {
    marginTop: 20,
    backgroundColor: '#5DADE2',
    padding: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '80%',
  },
  nutrientBox: {
    backgroundColor: '#FFF1DB',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  caloriesGoalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  caloriesInfo: {
    marginTop: 10,
  },
  caloriesText: {
    fontSize: 14,
    marginVertical: 2,
  },
  rightAlign: {
    textAlign: 'right',
  },
  percentageText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  cardWrapper: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#76b947', // light green
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  }, 
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign:'center',
    marginBottom: 10,
  },
  searchInput: {
    width: '100%',
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    gap: 10,
  },
  foodDetails: {
    flex: 1,
  },
  
  servingInfo: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
  },
  
  macrosRow: {
    marginBottom: 4,
  },
  
  macroBreakdown: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  
  macroValue: {
    fontSize: 12,
    color: '#333',
  },
  
  bold: {
    fontWeight: 'bold',
  },
  macroText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  foodImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  foodName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  foodDesc: {
    fontSize: 12,
    color: 'gray'
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  servingText: {
    marginRight: 6,
  },
  servingInput: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: 50,
    textAlign: 'center',
    padding: 2
  },
});