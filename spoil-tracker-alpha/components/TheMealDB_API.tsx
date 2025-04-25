// components/MealSearch.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Image, StyleSheet } from 'react-native';

const MealSearch = () => {
  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchMeal = async () => {
    try {
      setError(null);
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await res.json();

      if (data.meals && data.meals.length > 0) {
        setMeal(data.meals[0]);
      } else {
        setMeal(null);
        setError('No meals found.');
      }
    } catch (err) {
      setError('Error fetching data');
      setMeal(null);
    }
  };

  const renderIngredients = () => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`${ingredient} - ${measure}`);
      }
    }
    return ingredients.map((item, index) => (
      <Text key={index} style={styles.ingredient}>{item}</Text>
    ));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Search for a Meal</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter meal name..."
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Search" onPress={searchMeal} />
      {error && <Text style={styles.error}>{error}</Text>}
      {meal && (
        <View style={styles.mealCard}>
          <Text style={styles.mealName}>{meal.strMeal}</Text>
          {meal.strMealThumb && <Image source={{ uri: meal.strMealThumb }} style={styles.image} />}
          <Text style={styles.sectionTitle}>Category: {meal.strCategory}</Text>
          <Text style={styles.sectionTitle}>Area: {meal.strArea}</Text>
          <Text style={styles.sectionTitle}>Tags: {meal.strTags}</Text>
          <Text style={styles.sectionTitle}>Instructions:</Text>
          <Text style={styles.instructions}>{meal.strInstructions}</Text>
          <Text style={styles.sectionTitle}>Ingredients:</Text>
          {renderIngredients()}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 8,
  },
  header: {
    fontSize: 24,
    fontFamily: 'inter-bold',
    color: '#4CAE4F',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  error: {
    color: 'red',
    marginVertical: 10,
  },
  mealCard: {
    backgroundColor: '#FFF1DB',
    padding: 15,
    borderRadius: 8,
    borderColor: '#954535',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  mealName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  instructions: {
    marginTop: 5,
    marginBottom: 10,
  },
  ingredient: {
    fontSize: 14,
    marginLeft: 5,
  },
});

export default MealSearch;
