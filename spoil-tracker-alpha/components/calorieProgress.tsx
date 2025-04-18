import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface CalorieProgressProps {
  totalCalories: number;
  consumedCalories: number;
}

const CalorieProgress = ({
  totalCalories,
  consumedCalories,
}: CalorieProgressProps) => {
  const remainingCalories = totalCalories - consumedCalories;
  const percentage = (consumedCalories / totalCalories) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.caloriesGoalText}>
        Calories Goal: {totalCalories} kcal
      </Text>
      <View style={styles.progressWrapper}>
        <AnimatedCircularProgress
          size={100}
          width={8}
          fill={percentage}
          tintColor="#73CFD4"
          backgroundColor="white"
        >
          {() => (
            <Text style={styles.percentageText}>{percentage.toFixed(2)}%</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF1DB',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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

export default CalorieProgress;
