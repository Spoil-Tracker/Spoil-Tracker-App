import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Svg, Circle } from 'react-native-svg';

interface NutritionItemProps {
  currentCount: number;
  goalCount: number;
  label: string;
}

const NutritionItem: React.FC<NutritionItemProps> = ({ currentCount, goalCount, label }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;

  // Calculate the percentage of progress
  const percentage = Math.min((currentCount / goalCount) * 100, 100); // Ensure it's between 0 and 100

  // SVG circle properties
  const radius = 40; // Radius of the circle
  const strokeWidth = 10; // Width of the stroke for the circle
  const circumference = 2 * Math.PI * radius; // Calculate the circumference of the circle
  const strokeDasharray = circumference; // This controls the full circle length
  const strokeDashoffset = circumference - (percentage / 100) * circumference; // Controls the filled portion

  // Function to toggle dropdown visibility with animation
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);

    // Animate dropdown height
    Animated.timing(dropdownHeight, {
      toValue: dropdownVisible ? 0 : 100, // Toggle between 0 and 100 (height in px)
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.itemContainer}>
      {/* Touchable wrapper to make it clickable */}
      <TouchableOpacity onPress={toggleDropdown} style={styles.clickableContainer}>
        {/* Pie Chart */}
        <View style={styles.chartContainer}>
          <Svg width={100} height={100} viewBox="0 0 100 100">
            {/* Background Circle (Gray) */}
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#e6e6e6"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Foreground Circle (Colored, representing the progress) */}
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#4CAE4F" // Green color for the progress
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>
          {/* Label and Counts */}
          <View style={styles.textContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.count}>
              {currentCount} / {goalCount}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Dropdown Content (Initially Hidden) */}
      <Animated.View
        style={[
          styles.dropdownContainer,
          { height: dropdownHeight }, // Animated height for dropdown view
        ]}
      >
        <View style={styles.dropdownContent}>
          <Text style={styles.dropdownText}>Here is more information about {label}!</Text>
          {/* You can add more content here */}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  clickableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  textContainer: {
    marginLeft: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  count: {
    fontSize: 14,
    color: '#777',
  },
  dropdownContainer: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  dropdownContent: {
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
});

export default NutritionItem;
