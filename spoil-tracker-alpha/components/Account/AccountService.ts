import { gql } from '@apollo/client';
import client from '@/src/ApolloClient';

/**
 * This file contains service layer functions that allow the client to interact
 * with the GraphQL server to manage accounts, custom items, liked posts, and more.
 * It defines the necessary GraphQL queries and mutations and exports functions
 * that wrap these operations with error handling.
 */

/**
 * GraphQL query to fetch an account by its owner ID.
 */
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
            likedPosts
            likedCommunityGroceryLists
        }
    }
`;

/**
 * GraphQL mutation to create a new account.
 */
const CREATE_ACCOUNT = gql`
    mutation CreateAccount($owner_id: String!, $account_name: String!, $account_type: String!) {
        createAccount(owner_id: $owner_id, account_name: $account_name, account_type: $account_type) {
            id
        }
    }
`;

/**
 * GraphQL mutation to delete a pantry from an account.
 */
const DELETE_PANTRY_FROM_ACCOUNT = gql`
    mutation DeletePantryFromAccount($account_id: String!, $pantry_id: String!) {
        deletePantryFromAccount(account_id: $account_id, pantry_id: $pantry_id)
    }
`;

/**
 * GraphQL mutation to delete a food abstract from an account.
 */
const DELETE_FOOD_ABSTRACT_FROM_ACCOUNT = gql`
    mutation DeleteFoodAbstractFromAccount($account_id: String!, $food_abstract_id: String!) {
        deleteFoodAbstractFromAccount(account_id: $account_id, food_abstract_id: $food_abstract_id)
    }
`;

/**
 * GraphQL mutation to delete an account.
 */
const DELETE_ACCOUNT = gql`
    mutation DeleteAccount($account_id: String!) {
        deleteAccount(account_id: $account_id)
    }
`;

/**
 * GraphQL mutation to add a custom item to an account.
 */
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

/**
 * GraphQL mutation to delete a custom item by its food_global_id.
 */
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

/**
 * GraphQL mutation to update an existing custom item.
 */
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

/**
 * GraphQL query to fetch all custom items from a specific account.
 */
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

/**
 * GraphQL query to search for custom items from a specific account by food name.
 */
const SEARCH_CUSTOM_ITEMS_FROM_ACCOUNT = gql`
  query SearchCustomItemsFromAccount($account_id: String!, $query: String!) {
    searchCustomItemsFromAccount(account_id: $account_id, query: $query) {
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

/**
 * GraphQL mutation to add a liked post to an account.
 */
const ADD_LIKED_POST = gql`
    mutation AddLikedPost($account_id: String!, $post_id: String!) {
        addLikedPost(account_id: $account_id, post_id: $post_id) {
            id
            likedPosts
        }
    }
`;

/**
 * GraphQL mutation to remove a liked post from an account.
 */
const REMOVE_LIKED_POST = gql`
    mutation RemoveLikedPost($account_id: String!, $post_id: String!) {
        removeLikedPost(account_id: $account_id, post_id: $post_id) {
            id
            likedPosts
        }
    }
`;

/**
 * GraphQL mutation to add a liked community grocery list to an account.
 */
const ADD_LIKED_COMMUNITY_GROCERY_LIST = gql`
    mutation AddLikedCommunityGroceryList($account_id: String!, $grocery_list_id: String!) {
        addLikedCommunityGroceryList(account_id: $account_id, grocery_list_id: $grocery_list_id) {
            id
            likedCommunityGroceryLists
        }
    }
`;

/**
 * GraphQL mutation to remove a liked community grocery list from an account.
 */
const REMOVE_LIKED_COMMUNITY_GROCERY_LIST = gql`
    mutation RemoveLikedCommunityGroceryList($account_id: String!, $grocery_list_id: String!) {
        removeLikedCommunityGroceryList(account_id: $account_id, grocery_list_id: $grocery_list_id) {
            id
            likedCommunityGroceryLists
        }
    }
`;

/**
 * Represents a Grocery List.
 */
export interface GroceryList {
    id: string;
    account_id: string;
    createdAt: string;
    last_opened: string;
    grocerylist_name: string;
    description: string;
    grocery_list_items: GroceryListItem[];
    isFamily: boolean;
    isShared: boolean;
    isComplete: boolean;
}

/**
 * Represents an item within a Grocery List.
 */
export interface GroceryListItem {
    id: string;
    food_name: string;
    food_global_id: string;
    measurement: string;
    quantity: number;
    isBought: boolean;
    description: string;
    imageUrl: string;
}

/**
 * Fetches an account document by owner_id.
 *
 * @param {string} owner_id - The owner ID to search for. For users, this is typically the auth user's uid.
 * @returns A promise that resolves to the account data corresponding to the given owner_id.
 * @throws An error if the query fails.
 */
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

/**
 * Creates a new account.
 *
 * @param {string} owner_id - The owner ID for the new account.
 * @param {string} account_name - The name of the account.
 * @param {string} account_type - The type of the account (e.g., "user" or "family").
 * @returns A promise that resolves to the created account document.
 * @throws An error if the mutation fails.
 */
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

/**
 * Deletes a pantry from an account.
 *
 * @param {string} account_id - The ID of the account.
 * @param {string} pantry_id - The ID of the pantry to delete.
 * @returns A promise that resolves to the result of the deletion.
 * @throws An error if the mutation fails.
 */
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

/**
 * Deletes a food abstract from an account.
 *
 * @param {string} account_id - The ID of the account.
 * @param {string} food_abstract_id - The ID of the food abstract to delete.
 * @returns A promise that resolves to the result of the deletion.
 * @throws An error if the mutation fails.
 */
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

/**
 * Deletes an account.
 *
 * @param {string} account_id - The ID of the account to delete.
 * @returns A promise that resolves to the result of the deletion.
 * @throws An error if the mutation fails.
 */
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

/**
 * Adds a custom food item to an account.
 *
 * @param {string} account_id - The ID of the account.
 * @param {string} food_name - The name of the custom food item.
 * @param {string} food_category - The category of the custom food item.
 * @param {string} food_picture_url - The URL for the food item's image.
 * @param {string} amount_per_serving - The serving amount.
 * @param {string} description - A description of the food item.
 * @param {any} macronutrients - An object containing macronutrient values.
 * @param {any} micronutrients - An object containing micronutrient values.
 * @returns A promise that resolves to the updated account document after adding the custom item.
 * @throws An error if the mutation fails.
 */
export async function addCustomItem(
    account_id: string,
    food_name: string,
    food_category: string,
    food_picture_url: string,
    amount_per_serving: string,
    description: string,
    macronutrients: any,
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

/**
 * Deletes a custom food item from an account.
 *
 * @param {string} account_id - The ID of the account.
 * @param {string} food_global_id - The ID of the custom food item to delete.
 * @returns A promise that resolves to the updated account document after deletion.
 * @throws An error if the mutation fails.
 */
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

/**
 * Updates an existing custom food item in an account.
 *
 * @param {string} account_id - The ID of the account.
 * @param {string} food_global_id - The ID of the custom food item to update.
 * @param {string} [food_name] - (Optional) The new name for the food item.
 * @param {string} [food_category] - (Optional) The new category for the food item.
 * @param {string} [food_picture_url] - (Optional) The new picture URL for the food item.
 * @param {string} [amount_per_serving] - (Optional) The updated amount per serving.
 * @param {string} [description] - (Optional) The updated description.
 * @param {any} [macronutrients] - (Optional) An object with updated macronutrient values.
 * @param {any} [micronutrients] - (Optional) An object with updated micronutrient values.
 * @returns A promise that resolves to the updated account document after the custom item is modified.
 * @throws An error if the mutation fails.
 */
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

/**
 * Fetches all custom food items for a specific account.
 *
 * @param {string} account_id - The ID of the account.
 * @returns A promise that resolves to an array of custom food items for the account.
 * @throws An error if the query fails.
 */
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

/**
 * Adds a liked post to the account.
 *
 * @param {string} account_id - The ID of the account.
 * @param {string} post_id - The ID of the post to like.
 * @returns A promise that resolves to the updated account document.
 * @throws An error if the mutation fails.
 */
export async function addLikedPost(account_id: string, post_id: string) {
    try {
        const result = await client.mutate({
            mutation: ADD_LIKED_POST,
            variables: { account_id, post_id },
        });
        return result.data.addLikedPost;
    } catch (error) {
        console.error('Error adding liked post:', error);
        throw error;
    }
}

/**
 * Removes a liked post from the account.
 *
 * @param {string} account_id - The ID of the account.
 * @param {string} post_id - The ID of the post to remove from liked posts.
 * @returns A promise that resolves to the updated account document.
 * @throws An error if the mutation fails.
 */
export async function removeLikedPost(account_id: string, post_id: string) {
    try {
        const result = await client.mutate({
            mutation: REMOVE_LIKED_POST,
            variables: { account_id, post_id },
        });
        return result.data.removeLikedPost;
    } catch (error) {
        console.error('Error removing liked post:', error);
        throw error;
    }
}

/**
 * Adds a liked community grocery list to the account.
 *
 * @param {string} account_id - The ID of the account.
 * @param {string} grocery_list_id - The ID of the grocery list to add to liked community grocery lists.
 * @returns A promise that resolves to the updated account document.
 * @throws An error if the mutation fails.
 */
export async function addLikedCommunityGroceryList(account_id: string, grocery_list_id: string) {
    try {
        const result = await client.mutate({
            mutation: ADD_LIKED_COMMUNITY_GROCERY_LIST,
            variables: { account_id, grocery_list_id },
        });
        return result.data.addLikedCommunityGroceryList;
    } catch (error) {
        console.error('Error adding liked community grocery list:', error);
        throw error;
    }
}

/**
 * Removes a liked community grocery list from the account.
 *
 * @param {string} account_id - The ID of the account.
 * @param {string} grocery_list_id - The ID of the grocery list to remove from liked community grocery lists.
 * @returns A promise that resolves to the updated account document.
 * @throws An error if the mutation fails.
 */
export async function removeLikedCommunityGroceryList(account_id: string, grocery_list_id: string) {
    try {
        const result = await client.mutate({
            mutation: REMOVE_LIKED_COMMUNITY_GROCERY_LIST,
            variables: { account_id, grocery_list_id },
        });
        return result.data.removeLikedCommunityGroceryList;
    } catch (error) {
        console.error('Error removing liked community grocery list:', error);
        throw error;
    }
}

/**
 * Searches for custom food items from a specific account based on a query string.
 *
 * This function sends a GraphQL query (SEARCH_CUSTOM_ITEMS_FROM_ACCOUNT) to fetch custom food items
 * whose food names match or contain the provided query string. The fetch policy is set to 'network-only'
 * to ensure that fresh data is retrieved from the server.
 *
 * @param {string} account_id - The ID of the account for which to search custom items.
 * @param {string} query - The search query string to filter custom items.
 * @returns {Promise<any[]>} A promise that resolves to an array of custom food items matching the query.
 * @throws Will throw an error if the query fails.
 */
export async function searchCustomItemsFromAccount(account_id: string, query: string) {
    try {
      const result = await client.query({
        query: SEARCH_CUSTOM_ITEMS_FROM_ACCOUNT,
        variables: { account_id, query },
        fetchPolicy: 'network-only'
      });
      return result.data.searchCustomItemsFromAccount;
    } catch (error) {
      console.error('Error searching custom items:', error);
      throw error;
    }
}
