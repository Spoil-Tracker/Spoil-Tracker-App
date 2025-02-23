import { gql } from '@apollo/client';
import client from '@/src/ApolloClient';

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

// Mutation to delete a FoodGlobal item
const DELETE_FOOD_GLOBAL = gql`
  mutation DeleteFoodGlobal($food_global_id: String!) {
    deleteFoodGlobal(food_global_id: $food_global_id)
  }
`;

// Service functions

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
