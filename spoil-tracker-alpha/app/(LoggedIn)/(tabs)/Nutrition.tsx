import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function NutritionScreen() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const user = 'User'; // Replace with actual user data
  const totalCalories = 2000;
  const consumedCalories = 1698;
  const remainingCalories = totalCalories - consumedCalories;
  const percentage = consumedCalories / totalCalories;

  const changeDay = (days: number) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + days);
      setSelectedDate(newDate);
    }
  };

  const formatDate = (date: Date | null) => {
    const today = new Date();
    if (date && date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date ? date.toLocaleDateString() : 'Today';
  };

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <Text style={styles.greeting}>Hello, {user}!</Text>

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

      {/* Calories Info */}
      <View style={styles.caloriesContainer}>
        <Text style={styles.caloriesGoalText}>
          Calories Goal: {totalCalories} kcal
        </Text>
        <View style={styles.progressWrapper}>
          <AnimatedCircularProgress
            size={100}
            width={8}
            fill={percentage * 100}
            tintColor="#73CFD4"
            backgroundColor="white"
          >
            {() => (
              <Text style={styles.percentageText}>
                {(percentage * 100).toFixed(2)}%
              </Text>
            )}
          </AnimatedCircularProgress>
          <View style={styles.caloriesInfo}>
            <Text style={[styles.caloriesText, styles.rightAlign]}>
              Consumed: {consumedCalories} kcal
            </Text>
            <Text style={[styles.caloriesText, styles.rightAlign]}>
              Remaining: {remainingCalories} kcal
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  caloriesContainer: {
    backgroundColor: '#FFF1DB',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  caloriesGoalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesInfo: {
    marginLeft: 15,
  },
  caloriesText: {
    fontSize: 16,
    marginVertical: 4,
  },
  rightAlign: {
    textAlign: 'right',
  },
  percentageText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
});
