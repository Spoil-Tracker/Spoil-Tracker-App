import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';

type Nutrient = {
  nutrientName: string;
  value: number;
  unitName: string;
};

const FdcSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFoodData = async () => {
    setLoading(true);
    setResults([]);
    setError('');

    try {
      const apiKey = process.env.EXPO_PUBLIC_FDA_API_KEY;
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${apiKey}`
      );
      const data = await response.json();

      if (data.foods?.length) {
        setResults(data.foods);
      } else {
        setError('No results found.');
      }
    } catch (err) {
      setError('Failed to fetch food data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.spoilTrackerText}>Food Search</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g., Cheddar Cheese"
        value={query}
        onChangeText={setQuery}
        placeholderTextColor="#999"
      />

      <View style={styles.buttonWrapper}>
        <Button title="Search" onPress={fetchFoodData} color="#4CAE4F" />
      </View>

      {loading && <ActivityIndicator size="large" color="#4CAE4F" style={{ marginTop: 20 }} />}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {results.map((item) => (
        <View key={item.fdcId} style={styles.listSection}>
          <Text style={styles.pantryName}>{item.description}</Text>
          <View style={styles.nutrientList}>
            {item.foodNutrients
              ?.sort((a: Nutrient, b: Nutrient) => a.nutrientName.localeCompare(b.nutrientName))
              .map((nutrient: Nutrient) => (
                <Text key={nutrient.nutrientName} style={styles.nutrientText}>
                  • {nutrient.nutrientName}: {nutrient.value} {nutrient.unitName}
                </Text>
              ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 8,
    backgroundColor: '#F9F9F9',
  },
  spoilTrackerText: {
    fontSize: 24,
    fontFamily: 'inter-bold',
    color: '#4CAE4F',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#954535',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  buttonWrapper: {
    marginBottom: 10,
    alignSelf: 'center',
    width: '50%',
  },
  listSection: {
    marginVertical: 10,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  pantryName: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  nutrientList: {
    marginTop: 5,
  },
  nutrientText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 1,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default FdcSearch;
