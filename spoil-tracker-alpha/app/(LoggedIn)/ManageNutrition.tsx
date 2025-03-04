import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Svg, Circle } from 'react-native-svg';

export default function ManageNutritionScreen() {
  const [dailyCalories, setDailyCalories] = useState('');
  const [calculated, setCalculated] = useState(false);
  const [customMacros, setCustomMacros] = useState(false);
  const [carbs, setCarbs] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);

  const calculateMacros = () => {
    const calories = parseInt(dailyCalories, 10);
    if (!isNaN(calories) && calories > 0) {
      setCarbs((calories * 0.45) / 4);
      setProtein((calories * 0.20) / 4);
      setFat((calories * 0.35) / 9);
      setCalculated(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Nutrition</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter your daily calorie goal"
        value={dailyCalories}
        onChangeText={setDailyCalories}
      />

      <TouchableOpacity style={styles.button} onPress={calculateMacros}>
        <Text style={styles.buttonText}>Calculate</Text>
      </TouchableOpacity>

      {calculated && (
        <View style={styles.resultWrapper}>
          {/* If toggle is OFF, show the left box */}
          {!customMacros && (
            <View style={styles.nutritionBox}>
              <Text style={styles.macroTargetText}>
                My macronutrient targets are providing {dailyCalories} cals per day:
              </Text>
              <Text style={styles.description}>
                Your daily macronutrient distribution is calculated based on the recommended 45:20:35 ratio for Carbs, Protein, and Fats.
              </Text>
              <View style={styles.resultContainer}>
                <View style={styles.circleContainer}>
                  <Svg height="200" width="200" viewBox="0 0 100 100">
                    <Circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#FF6666"
                      strokeWidth={10}
                      fill="none"
                      strokeDasharray="251.2"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    <Circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#FFBB33"
                      strokeWidth={10}
                      fill="none"
                      strokeDasharray="251.2"
                      strokeDashoffset={0.45 * 251.2}
                      strokeLinecap="round"
                    />
                    <Circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#66CC99"
                      strokeWidth={10}
                      fill="none"
                      strokeDasharray="251.2"
                      strokeDashoffset={0.65 * 251.2}
                      strokeLinecap="round"
                    />
                  </Svg>
                  <View style={styles.nutrientRow}>
                    <Text style={[styles.label, styles.carbs]}>Carbs:</Text>
                    <Text style={styles.value}>{carbs.toFixed(1)}g</Text>
                  </View>
                  <View style={styles.nutrientRow}>
                    <Text style={[styles.label, styles.protein]}>Protein:</Text>
                    <Text style={styles.value}>{protein.toFixed(1)}g</Text>
                  </View>
                  <View style={styles.nutrientRow}>
                    <Text style={[styles.label, styles.fat]}>Fat:</Text>
                    <Text style={styles.value}>{fat.toFixed(1)}g</Text>
                  </View>
                </View>

                <View style={styles.macroContainer}>
                  <Text style={styles.macroTitle}>Macro Distribution:</Text>
                  <Text style={styles.macroText}>Calories, %: 45:20:35</Text>
                </View>
              </View>
            </View>
          )}

          {/* Right Box - center if toggle is ON */}
          <View
            style={[
              styles.rightBox,
              customMacros && styles.centeredRightBox, // if toggle ON, we expand/center the box
            ]}
          >
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleTitle}>Customizing Macros Target</Text>
              <Switch value={customMacros} onValueChange={setCustomMacros} />
            </View>

            <Text style={styles.description}>
              Customize macros by setting fixed grams for each macro. Your daily Total Macro target is a fixed number of grams and will not change with
              calories budget changes. You will need to update target grams yourself, as needed.
            </Text>

            <TextInput
              style={styles.macroInput}
              keyboardType="numeric"
              placeholder="Total Carbs, g"
              editable={customMacros}
            />
            <TextInput
              style={styles.macroInput}
              keyboardType="numeric"
              placeholder="Total Protein, g"
              editable={customMacros}
            />
            <TextInput
              style={styles.macroInput}
              keyboardType="numeric"
              placeholder="Total Fat, g"
              editable={customMacros}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Screen Layout
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF9F2',
    padding: 20,
  },
  title: {
    fontSize: 40,
    color: '#4CAE4F',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#5DADE2',
    padding: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },

  // Wrapper
  resultWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },

  // Left Box
  nutritionBox: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#FFF1DB',
    padding: 20,
    borderRadius: 10,
  },

  // Right Box
  rightBox: {
    width: '48%',
    backgroundColor: '#FFF1DB',
    borderRadius: 10,
    padding: 25,
    justifyContent: 'center',
  },
  centeredRightBox: {
    width: '80%',
    alignSelf: 'center',
  },

  // Nutrient Box
  macroTargetText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    marginBottom: 15,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  circleContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  macroContainer: {
    alignItems: 'flex-start',
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroText: {
    fontSize: 14,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Macros Input
  macroInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: 'white',
  },

  // Nutrient Rows
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    justifyContent: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  value: {
    fontSize: 16,
  },

  // Colors
  carbs: {
    fontWeight: 'bold',
    color: '#FF6666',
  },
  protein: {
    fontWeight: 'bold',
    color: '#FFBB33',
  },
  fat: {
    fontWeight: 'bold',
    color: '#66CC99',
  },
});
