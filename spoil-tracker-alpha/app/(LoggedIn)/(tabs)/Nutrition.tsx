import React, { useState } from 'react';
import { useRouter, router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function NutritionScreen() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const user = "User";

  const nutrients = [
    { name: 'Calories', unit: 'kcal', total: 2000, consumed: 1698, color: '#73CFD4' },
    { name: 'Protein', unit: 'g', total: 100, consumed: 70, color: '#FFBB33' },
    { name: 'Carbs', unit: 'g', total: 225, consumed: 169, color: '#FF6666' },
    { name: 'Fats', unit: 'g', total: 78, consumed: 39, color: '#66CC99' },
  ];

  const changeDay = (days: number) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + days);
      setSelectedDate(newDate);
    }
  };

  const formatDate = (date: Date | null) => {
    const today = new Date();
    return date && date.toDateString() === today.toDateString() ? "Today" : date?.toLocaleDateString();
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
          <FontAwesome
            name="calendar"
            size={20}
            color="white"
            style={styles.calendarIcon}
          />
          <Text style={styles.todayText}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDay(1)}>
          <AntDesign name="right" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
          inline
        />
      )}

      {/* Nutrient Info Grid */}
      <View style={styles.nutrientGrid}>
        {nutrients.map((nutrient, index) => {
          const remaining = nutrient.total - nutrient.consumed;
          const percentage = nutrient.consumed / nutrient.total;
          return (
            <View key={index} style={styles.nutrientBox}>
              <Text style={styles.caloriesGoalText}>{nutrient.name} Goal: {nutrient.total} {nutrient.unit}</Text>
              <AnimatedCircularProgress
                size={100}
                width={8}
                fill={percentage * 100}
                tintColor={nutrient.color}
                backgroundColor='white'
              >
                {() => (
                  <Text style={styles.percentageText}>{(percentage * 100).toFixed(2)}%</Text>
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
        <Text style={styles.manageButtonText}>Manage Nutrition Metric</Text>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
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
});
