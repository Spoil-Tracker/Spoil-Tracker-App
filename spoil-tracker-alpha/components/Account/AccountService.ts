import { gql } from '@apollo/client';
import client from '@/src/ApolloClient';

// Existing operations
const GET_ACCOUNT_BY_OWNER_ID = gql`
    query GetAccountByOwnerID($owner_id: String!) {
        getAccountByOwnerID(owner_id: $owner_id) {
            id
            owner_id
            account_name
            account_type
            abstract_foods
            pantries
            grocery_lists
            family_circles
            custom_items {
              id
              food_name
            }
        }
    }
`;

const CREATE_ACCOUNT = gql`
    mutation CreateAccount($owner_id: String!, $account_name: String!, $account_type: String!) {
        createAccount(owner_id: $owner_id, account_name: $account_name, account_type: $account_type) {
            id
        }
    }
`;

const DELETE_PANTRY_FROM_ACCOUNT = gql`
    mutation DeletePantryFromAccount($account_id: String!, $pantry_id: String!) {
        deletePantryFromAccount(account_id: $account_id, pantry_id: $pantry_id)
    }
`;

const DELETE_FOOD_ABSTRACT_FROM_ACCOUNT = gql`
    mutation DeleteFoodAbstractFromAccount($account_id: String!, $food_abstract_id: String!) {
        deleteFoodAbstractFromAccount(account_id: $account_id, food_abstract_id: $food_abstract_id)
    }
`;

const DELETE_ACCOUNT = gql`
    mutation DeleteAccount($account_id: String!) {
        deleteAccount(account_id: $account_id)
    }
`;

// === New operations for custom items ===

// Mutation to add a custom item
const ADD_CUSTOM_ITEM = gql`
  mutation AddCustomItem(
    $account_id: String!,
    $food_name: String!,
    $food_category: String!,
    $food_picture_url: String!,
    $amount_per_serving: String!,
    $description: String!,
    $macronutrients: MacronutrientsInput!,
    $micronutrients: MicronutrientsInput!
  ) {
    addCustomItem(
      account_id: $account_id,
      food_name: $food_name,
      food_category: $food_category,
      food_picture_url: $food_picture_url,
      amount_per_serving: $amount_per_serving,
      description: $description,
      macronutrients: $macronutrients,
      micronutrients: $micronutrients
    ) {
      id
      custom_items {
        id
        food_name
      }
    }
  }
`;

// Mutation to delete a custom item by its id
const DELETE_CUSTOM_ITEM = gql`
  mutation DeleteCustomItem($account_id: String!, $food_global_id: String!) {
    deleteCustomItem(account_id: $account_id, food_global_id: $food_global_id) {
      id
      custom_items {
        id
        food_name
      }
    }
  }
`;

// Mutation to update a custom item
const UPDATE_CUSTOM_ITEM = gql`
  mutation UpdateCustomItem(
    $account_id: String!,
    $food_global_id: String!,
    $food_name: String,
    $food_category: String,
    $food_picture_url: String,
    $amount_per_serving: String,
    $description: String,
    $macronutrients: MacronutrientsInput,
    $micronutrients: MicronutrientsInput
  ) {
    updateCustomItem(
      account_id: $account_id,
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
      custom_items {
        id
        food_name
        food_category
        food_picture_url
        amount_per_serving
        description
      }
    }
  }
`;

// Query to fetch all custom items from an account
const GET_CUSTOM_ITEMS_FROM_ACCOUNT = gql`
  query GetCustomItemsFromAccount($account_id: String!) {
    getCustomItemsFromAccount(account_id: $account_id) {
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

// === Exported functions ===

export async function getAccountByOwnerID(owner_id: string) {
    try {
        const result = await client.query({
            query: GET_ACCOUNT_BY_OWNER_ID,
            variables: { owner_id },
        });
        return result.data.getAccountByOwnerID;
    } catch (error) {
        console.error('Error fetching account document:', error);
        throw error;
    }
}

export async function createAccount(owner_id: string, account_name: string, account_type: string) {
    try {
        const result = await client.mutate({
            mutation: CREATE_ACCOUNT,
            variables: { owner_id, account_name, account_type },
        });
        return result.data.createAccount;
    } catch (error) {
        console.error('Error creating account:', error);
        throw error;
    }
}

export async function deletePantryFromAccount(account_id: string, pantry_id: string) {
    try {
        const result = await client.mutate({
            mutation: DELETE_PANTRY_FROM_ACCOUNT,
            variables: { account_id, pantry_id },
        });
        return result.data.deletePantryFromAccount;
    } catch (error) {
        console.error('Error deleting pantry:', error);
        throw error;
    }
}

export async function deleteFoodAbstractFromAccount(account_id: string, food_abstract_id: string) {
    try {
        const result = await client.mutate({
            mutation: DELETE_FOOD_ABSTRACT_FROM_ACCOUNT,
            variables: { account_id, food_abstract_id },
        });
        return result.data.deleteFoodAbstractFromAccount;
    } catch (error) {
        console.error('Error deleting food abstract:', error);
        throw error;
    }
}

export async function deleteAccount(account_id: string) { 
    try {
        const result = await client.mutate({
            mutation: DELETE_ACCOUNT,
            variables: { account_id },
        });
        return result.data.deleteAccount;
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
}

export async function addCustomItem(
    account_id: string,
    food_name: string,
    food_category: string,
    food_picture_url: string,
    amount_per_serving: string,
    description: string,
    macronutrients: any, // Use appropriate type if available
    micronutrients: any
) {
    try {
        const result = await client.mutate({
            mutation: ADD_CUSTOM_ITEM,
            variables: {
                account_id,
                food_name,
                food_category,
                food_picture_url,
                amount_per_serving,
                description,
                macronutrients,
                micronutrients,
            },
        });
        return result.data.addCustomItem;
    } catch (error) {
        console.error('Error adding custom item:', error);
        throw error;
    }
}

export async function deleteCustomItem(account_id: string, food_global_id: string) {
    try {
        const result = await client.mutate({
            mutation: DELETE_CUSTOM_ITEM,
            variables: { account_id, food_global_id },
        });
        return result.data.deleteCustomItem;
    } catch (error) {
        console.error('Error deleting custom item:', error);
        throw error;
    }
}

export async function updateCustomItem(
    account_id: string,
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
            mutation: UPDATE_CUSTOM_ITEM,
            variables: {
                account_id,
                food_global_id,
                food_name,
                food_category,
                food_picture_url,
                amount_per_serving,
                description,
                macronutrients,
                micronutrients,
            },
        });
        return result.data.updateCustomItem;
    } catch (error) {
        console.error('Error updating custom item:', error);
        throw error;
    }
}

export async function getCustomItemsFromAccount(account_id: string) {
    try {
        const result = await client.query({
            query: GET_CUSTOM_ITEMS_FROM_ACCOUNT,
            variables: { account_id },
            fetchPolicy: 'no-cache',
        });
        return result.data.getCustomItemsFromAccount;
    } catch (error) {
        console.error('Error fetching custom items:', error);
        throw error;
    }
}
