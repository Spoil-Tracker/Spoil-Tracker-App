import { gql } from '@apollo/client';
import client from '@/ApolloClient';

// Service layer functions to allow the client to connect with the server in some convenient manner.

// Query to fetch all FoodGlobal items
const GET_ALL_FOOD_GLOBAL = gql`
  query GetAllFoodGlobal {
    getAllFoodGlobal {
      id
      food_name
      food_category
      food_picture_url
      amount_per_serving
      description
      macronutrients {
        total_fat
        sat_fat
        trans_fat
        carbohydrate
        fiber
        total_sugars
        added_sugars
        protein
      }
      micronutrients {
        cholesterol
        sodium
        vitamin_d
        calcium
        iron
        potassium
      }
    }
  }
`;

// Query to fetch a FoodGlobal item by its food_name
const GET_FOOD_GLOBAL_BY_FOOD_NAME = gql`
  query GetFoodGlobalByFoodName($food_name: String!) {
    getFoodGlobalByFoodName(food_name: $food_name) {
      id
      food_name
      food_category
      food_picture_url
      amount_per_serving
      description
      macronutrients {
        total_fat
        sat_fat
        trans_fat
        carbohydrate
        fiber
        total_sugars
        added_sugars
        protein
      }
      micronutrients {
        cholesterol
        sodium
        vitamin_d
        calcium
        iron
        potassium
      }
    }
  }
`;

// Query to fetch a FoodGlobal item by its id
const GET_FOOD_GLOBAL_BY_ID = gql`
  query GetFoodGlobalById($food_global_id: String!) {
    getFoodGlobalById(food_global_id: $food_global_id) {
      id
      food_name
      food_category
      food_picture_url
      amount_per_serving
      description
      macronutrients {
        total_fat
        sat_fat
        trans_fat
        carbohydrate
        fiber
        total_sugars
        added_sugars
        protein
      }
      micronutrients {
        cholesterol
        sodium
        vitamin_d
        calcium
        iron
        potassium
      }
    }
  }
`;

// Mutation to create a new FoodGlobal item
const CREATE_FOOD_GLOBAL = gql`
  mutation CreateFoodGlobal(
    $food_name: String!,
    $food_category: String!,
    $food_picture_url: String!,
    $amount_per_serving: String!,
    $description: String!,
    $macronutrients: MacronutrientsInput!,
    $micronutrients: MicronutrientsInput!
  ) {
    createFoodGlobal(
      food_name: $food_name,
      food_category: $food_category,
      food_picture_url: $food_picture_url,
      amount_per_serving: $amount_per_serving,
      description: $description,
      macronutrients: $macronutrients,
      micronutrients: $micronutrients
    ) {
      id
      food_name
    }
  }
`;

// Mutation to update an existing FoodGlobal item
const UPDATE_FOOD_GLOBAL = gql`
  mutation UpdateFoodGlobal(
    $food_global_id: String!,
    $food_name: String,
    $food_category: String,
    $food_picture_url: String,
    $amount_per_serving: String,
    $description: String,
    $macronutrients: MacronutrientsInput,
    $micronutrients: MicronutrientsInput
  ) {
    updateFoodGlobal(
      food_global_id: $food_global_id,
      food_name: $food_name,
      food_category: $food_category,
      food_picture_url: $food_picture_url,
      amount_per_serving: $amount_per_serving,
      description: $description,
      macronutrients: $macronutrients,
      micronutrients: $micronutrients
    ) {
      id
      food_name
    }
  }
`;

const SEARCH_FOOD_GLOBAL_BY_FOOD_NAME = gql`
  query SearchFoodGlobalByFoodName($query: String!) {
    searchFoodGlobalByFoodName(query: $query) {
      id
      food_name
      food_category
      food_picture_url
      amount_per_serving
      description
      macronutrients {
        total_fat
        sat_fat
        trans_fat
        carbohydrate
        fiber
        total_sugars
        added_sugars
        protein
      }
      micronutrients {
        cholesterol
        sodium
        vitamin_d
        calcium
        iron
        potassium
      }
    }
  }
`;

const GET_CLOSEST_FOOD_GLOBAL = gql`
  query GetClosestFoodGlobal($searchName: String!, $topN: Int!) {
    getClosestFoodGlobal(searchName: $searchName, topN: $topN) {
      id
      food_name
      food_category
      food_picture_url
      amount_per_serving
      description
      macronutrients {
        total_fat
        sat_fat
        trans_fat
        carbohydrate
        fiber
        total_sugars
        added_sugars
        protein
      }
      micronutrients {
        cholesterol
        sodium
        vitamin_d
        calcium
        iron
        potassium
      }
    }
  }
`;

// Mutation to delete a FoodGlobal item
const DELETE_FOOD_GLOBAL = gql`
  mutation DeleteFoodGlobal($food_global_id: String!) {
    deleteFoodGlobal(food_global_id: $food_global_id)
  }
`;

interface Macronutrients {
  total_fat: number;
  sat_fat: number;
  trans_fat: number;
  carbohydrate: number;
  fiber: number;
  total_sugars: number;
  added_sugars: number;
  protein: number;
}

interface Micronutrients {
  cholesterol: number;
  sodium: number;
  vitamin_d: number;
  calcium: number;
  iron: number;
  potassium: number;
}

export interface FoodGlobal {
  id: string;
  food_name: string;
  food_category: string;
  food_picture_url: string;
  amount_per_serving: string;
  description: string;
  macronutrients: Macronutrients;
  micronutrients: Micronutrients;
}

/**
 * Fetches all FoodGlobal items.
 *
 * @returns A promise that resolves to an array of FoodGlobal items.
 * @throws An error if the query fails.
 */
export async function getAllFoodGlobal() {
  try {
    const result = await client.query({
      query: GET_ALL_FOOD_GLOBAL,
    });
    return result.data.getAllFoodGlobal;
  } catch (error) {
    console.error('Error fetching FoodGlobal items:', error);
    throw error;
  }
}

/**
 * Fetches a FoodGlobal item by its food name.
 *
 * @param food_name - The name of the food item to retrieve.
 * @returns A promise that resolves to the FoodGlobal item or null if not found.
 * @throws An error if the query fails.
 */
export async function getFoodGlobalByFoodName(food_name: string) {
  try {
    const result = await client.query({
      query: GET_FOOD_GLOBAL_BY_FOOD_NAME,
      variables: { food_name },
    });
    return result.data.getFoodGlobalByFoodName;
  } catch (error) {
    console.error('Error fetching FoodGlobal by food_name:', error);
    throw error;
  }
}

/**
 * Fetches a FoodGlobal item by its unique identifier.
 *
 * @param food_global_id - The unique identifier of the food item.
 * @returns A promise that resolves to the FoodGlobal item or null if not found.
 * @throws An error if the query fails.
 */
export async function getFoodGlobalById(food_global_id: string) {
  try {
    const result = await client.query({
      query: GET_FOOD_GLOBAL_BY_ID,
      variables: { food_global_id },
    });
    return result.data.getFoodGlobalById;
  } catch (error) {
    console.error('Error fetching FoodGlobal by id:', error);
    throw error;
  }
}

/**
 * Creates a new FoodGlobal item.
 *
 * Converts the nutrient input objects to plain objects and then calls the createFoodGlobal mutation.
 *
 * @param food_name - The name of the food.
 * @param food_category - The category of the food.
 * @param food_picture_url - The URL of the food's image.
 * @param amount_per_serving - Serving information for the food.
 * @param description - A description of the food.
 * @param macronutrients - An object containing macronutrient values.
 * @param micronutrients - An object containing micronutrient values.
 * @returns A promise that resolves to the newly created FoodGlobal item.
 * @throws An error if the mutation fails.
 */
export async function createFoodGlobal(
  food_name: string,
  food_category: string,
  food_picture_url: string,
  amount_per_serving: string,
  description: string,
  macronutrients: any, // Replace 'any' with your proper type if available
  micronutrients: any
) {
  try {
    // Convert nutrient input objects to plain objects.
    const plainMacronutrients = JSON.parse(JSON.stringify(macronutrients));
    const plainMicronutrients = JSON.parse(JSON.stringify(micronutrients));

    const result = await client.mutate({
      mutation: CREATE_FOOD_GLOBAL,
      variables: { food_name, food_category, food_picture_url, amount_per_serving, description, macronutrients: plainMacronutrients, micronutrients: plainMicronutrients },
    });
    return result.data.createFoodGlobal;
  } catch (error) {
    console.error('Error creating FoodGlobal item:', error);
    throw error;
  }
}

/**
 * Updates an existing FoodGlobal item.
 *
 * Only provided fields will be updated; omitted fields will remain unchanged.
 *
 * @param food_global_id - The unique identifier of the food item to update.
 * @param food_name - (Optional) The new name of the food.
 * @param food_category - (Optional) The new category.
 * @param food_picture_url - (Optional) The new image URL.
 * @param amount_per_serving - (Optional) The new serving information.
 * @param description - (Optional) The new description.
 * @param macronutrients - (Optional) Updated macronutrient values.
 * @param micronutrients - (Optional) Updated micronutrient values.
 * @returns A promise that resolves to the updated FoodGlobal item.
 * @throws An error if the mutation fails.
 */
export async function updateFoodGlobal(
  food_global_id: string,
  food_name?: string,
  food_category?: string,
  food_picture_url?: string,
  amount_per_serving?: string,
  description?: string,
  macronutrients?: any,
  micronutrients?: any
) {
  try {
    const result = await client.mutate({
      mutation: UPDATE_FOOD_GLOBAL,
      variables: { food_global_id, food_name, food_category, food_picture_url, amount_per_serving, description, macronutrients, micronutrients },
    });
    return result.data.updateFoodGlobal;
  } catch (error) {
    console.error('Error updating FoodGlobal item:', error);
    throw error;
  }
}

/**
 * Deletes a FoodGlobal item.
 *
 * @param food_global_id - The unique identifier of the FoodGlobal item to delete.
 * @returns A promise that resolves to the result of the deletion.
 * @throws An error if the mutation fails.
 */
export async function deleteFoodGlobal(food_global_id: string) {
  try {
    const result = await client.mutate({
      mutation: DELETE_FOOD_GLOBAL,
      variables: { food_global_id },
    });
    return result.data.deleteFoodGlobal;
  } catch (error) {
    console.error('Error deleting FoodGlobal item:', error);
    throw error;
  }
}

/**
 * Searches for FoodGlobal items based on a search query.
 *
 * This function sends a GraphQL query (SEARCH_FOOD_GLOBAL_BY_FOOD_NAME) to fetch FoodGlobal items
 * whose food names match or contain the provided query string. The fetch policy is set to 'network-only'
 * to ensure that fresh data is retrieved from the server.
 *
 * @param {string} query - The search query string to match against FoodGlobal item names.
 * @returns {Promise<FoodGlobal[]>} A promise that resolves to an array of FoodGlobal items matching the query.
 * @throws Will throw an error if the query fails.
 */
export async function searchFoodGlobalByFoodName(query: string): Promise<FoodGlobal[]> {
  try {
    const result = await client.query({
      query: SEARCH_FOOD_GLOBAL_BY_FOOD_NAME,
      variables: { query },
      fetchPolicy: 'network-only'
    });
    return result.data.searchFoodGlobalByFoodName;
  } catch (error) {
    console.error('Error searching FoodGlobal by food_name:', error);
    throw error;
  }
}

/**
 * Fetches the top‐N closest FoodGlobal items by name using Levenshtein distance.
 */
export async function getClosestFoodGlobal(
  searchName: string,
  topN: number = 3
): Promise<FoodGlobal[]> {
  const result = await client.query({
    query: GET_CLOSEST_FOOD_GLOBAL,
    variables: { searchName, topN },
    fetchPolicy: 'network-only'
  });
  return result.data.getClosestFoodGlobal;
}
