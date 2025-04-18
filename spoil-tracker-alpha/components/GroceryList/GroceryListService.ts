
import { gql } from '@apollo/client';
import client from '@/src/ApolloClient'; 

// Service layer functions to allow the client to connect with the server in some convenient manner.

/**
 * GraphQL query to retrieve all grocery lists associated with a given account.
 */
const GET_ALL_GROCERY_LISTS = gql`
  query GetGroceryListsForAccount($account_id: String!) {
    getGroceryListsForAccount(account_id: $account_id) {
        id
        account_id
        createdAt
        last_opened
        grocerylist_name
        description
        grocery_list_items {
            id
            food_name
            food_global_id
            measurement
            quantity
            isBought
            description
            imageUrl
        }
        isFamily
        isShared
        isComplete
    }
  }
`;

/**
 * GraphQL query to retrieve a single grocery list by its ID.
 */
const GET_GROCERY_LIST_BY_ID = gql`
  query GetGroceryListByID($grocery_list_id: String!) {
    getGroceryListByID(grocery_list_id: $grocery_list_id) {
        id
        account_id
        createdAt
        last_opened
        grocerylist_name
        description
        grocery_list_items {
            id
            food_name
            food_global_id
            measurement
            quantity
            isBought
            description
            imageUrl
        }
        isFamily
        isShared
        isComplete
    }
  }
`;

/**
 * GraphQL mutation to create a new grocery list for an account.
 */
const CREATE_GROCERY_LIST = gql`
  mutation CreateGroceryList($account_id: String!, $grocerylist_name: String!) {
    createGroceryList(account_id: $account_id, grocerylist_name: $grocerylist_name) {
        id
        grocerylist_name
        description
        last_opened
    }
  }
`;

/**
 * GraphQL mutation to delete a grocery list by its ID.
 */
const DELETE_GROCERY_LIST = gql`
    mutation DeleteGroceryList($grocerylist_id: String!) {
        deleteGroceryList(grocerylist_id: $grocerylist_id)
  }
`;

/**
 * GraphQL mutation to update the name of a grocery list.
 */
const UPDATE_GROCERY_LIST_NAME = gql`
    mutation UpdateGroceryListName($grocerylist_id: String!, $grocerylist_name: String!) {
        updateGroceryListName(grocerylist_id: $grocerylist_id, grocerylist_name: $grocerylist_name) {
            id
            grocerylist_name
        }
    }
`;

/**
 * GraphQL mutation to update the description of a grocery list.
 */
const UPDATE_GROCERY_LIST_DESCRIPTION = gql`
    mutation UpdateGroceryListDescription($grocerylist_id: String!, $description: String!) {
        updateGroceryListDescription(grocerylist_id: $grocerylist_id, description: $description) {
            id
            grocerylist_name
        }
    }
`;

/**
 * GraphQL mutation to update the last opened timestamp of a grocery list.
 */
const UPDATE_GROCERY_LIST_LAST_OPENED = gql`
    mutation UpdateGroceryListLastOpened($grocerylist_id: String!, $last_opened: String!) {
        updateGroceryListLastOpened(grocerylist_id: $grocerylist_id, last_opened: $last_opened) {
            id
            last_opened
        }
    }
`;

/**
 * GraphQL mutation to update the isFamily flag of a grocery list.
 */
const UPDATE_GROCERY_LIST_IS_FAMILY = gql`
    mutation UpdateGroceryListIsFamily($grocerylist_id: String!, $isFamily: Boolean!) {
        updateGroceryListIsFamily(grocerylist_id: $grocerylist_id, isFamily: $isFamily) {
            id
            isFamily
        }
    }
`;

/**
 * GraphQL mutation to update the isShared flag of a grocery list.
 */
const UPDATE_GROCERY_LIST_IS_SHARED = gql`
    mutation UpdateGroceryListIsShared($grocerylist_id: String!, $isShared: Boolean!) {
        updateGroceryListIsShared(grocerylist_id: $grocerylist_id, isShared: $isShared) {
            id
            isShared
        }
    }
`;

/**
 * GraphQL mutation to update the isComplete flag of a grocery list.
 */
const UPDATE_GROCERY_LIST_IS_COMPLETE = gql`
    mutation UpdateGroceryListIsComplete($grocerylist_id: String!, $isComplete: Boolean!) {
        updateGroceryListIsComplete(grocerylist_id: $grocerylist_id, isComplete: $isComplete) {
            id
            isComplete
        }
    }
`;

/**
 * GraphQL mutation to add a new grocery list item.
 *
 * This mutation creates a new grocery list item based on the provided food data.
 */
const ADD_GROCERY_LIST_ITEM = gql`
    mutation AddGroceryListItem(
        $grocerylist_id: String!,
        $account_id: String!,
        $food_global_id: String!,
        $food_name: String!
    ) {
    addGroceryListItem(
        grocerylist_id: $grocerylist_id,
        account_id: $account_id,
        food_global_id: $food_global_id,
        food_name: $food_name
    )
}
`;

/**
 * GraphQL mutation to delete a grocery list item by its ID.
 */
const DELETE_GROCERY_LIST_ITEM = gql`
    mutation DeleteGroceryListItem($grocerylist_id: String!, $item_id: String!) {
        deleteGroceryListItem(grocerylist_id: $grocerylist_id, item_id: $item_id)
    }
`;

/**
 * GraphQL mutation to update the measurement field of a grocery list item.
 */
const UPDATE_GROCERY_LIST_ITEM_MEASUREMENT = gql`
    mutation UpdateGroceryListItemMeasurement($grocerylist_id: String!, $item_id: String!, $measurement: String!) {
        updateGroceryListItemMeasurement(grocerylist_id: $grocerylist_id, item_id: $item_id, measurement: $measurement)
    }
`;

/**
 * GraphQL mutation to update the quantity of a grocery list item.
 */
const UPDATE_GROCERY_LIST_ITEM_QUANTITY = gql`
  mutation UpdateGroceryListItemQuantity(
    $grocerylist_id: String!
    $item_id: String!
    $quantity: Int!
  ) {
    updateGroceryListItemQuantity(
      grocerylist_id: $grocerylist_id,
      item_id: $item_id,
      quantity: $quantity
    )
  }
`;

/**
 * GraphQL mutation to toggle the isBought flag of a grocery list item.
 */
const UPDATE_GROCERY_LIST_ITEM_IS_BOUGHT = gql`
  mutation UpdateGroceryListItemIsBought($grocerylist_id: String!, $item_id: String!) {
    updateGroceryListItemIsBought(grocerylist_id: $grocerylist_id, item_id: $item_id)
  }
`;

const GET_SHARED_GROCERY_LISTS = gql`
  query GetAllGroceryLists {
    getAllGroceryLists {
      id
      account_id
      createdAt
      last_opened
      grocerylist_name
      description
      grocery_list_items {
        id
        food_name
        food_global_id
        measurement
        quantity
        isBought
        description
        imageUrl
      }
      isFamily
      isShared
      isComplete
    }
  }
`;

const SEARCH_GROCERY_LISTS = gql`
  query SearchGroceryLists($account_id: String!, $query: String!) {
    searchGroceryLists(account_id: $account_id, query: $query)
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
};

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
 * Fetches all grocery lists for a given account.
 *
 * @param account_id - The ID of the account.
 * @returns An array of grocery lists for the account.
 * @throws Error if the query fails.
 */
export async function fetchAllGroceryLists(account_id: string) {
    try {
        const result = await client.query({ 
            query: GET_ALL_GROCERY_LISTS,
            variables: { account_id }, 
            fetchPolicy: 'network-only' });

        return result.data.getGroceryListsForAccount;
        } catch (error) {
        console.error('Error fetching grocery lists:', error);

        throw error;
    }
}

export async function fetchSharedGroceryLists(): Promise<GroceryList[]> {
    try {
        const result = await client.query({
            query: GET_SHARED_GROCERY_LISTS,
            fetchPolicy: 'network-only',
        });
        // The query should return all lists; filter to get only shared lists.
        const allLists: GroceryList[] = result.data.getAllGroceryLists;
        const sharedLists = allLists.filter(list => list.isShared);
        return sharedLists;
        } catch (error) {
        console.error('Error fetching shared grocery lists:', error);
        throw error;
    }
  }

/**
 * Fetches a single grocery list by its ID.
 *
 * @param grocery_list_id - The ID of the grocery list.
 * @returns The grocery list object if found, otherwise null.
 * @throws Error if the query fails.
 */
export async function fetchGroceryListByID(grocery_list_id: string): Promise<GroceryList | null> {
    try {
      const result = await client.query({
        query: GET_GROCERY_LIST_BY_ID,
        variables: { grocery_list_id },
        fetchPolicy: 'network-only',
      });
      // Since the resolver returns a single GroceryList or null, we return that directly.
      return result.data.getGroceryListByID;
    } catch (error) {
      console.error('Error fetching grocery list by ID:', error);
      throw error;
    }
  }

/**
 * Creates a new grocery list.
 *
 * @param account_id - The ID of the account that owns the grocery list.
 * @param grocerylist_name - The name for the new grocery list.
 * @returns The newly created grocery list object.
 * @throws Error if the mutation fails.
 */
export async function createGroceryList(account_id: string, grocerylist_name: string) {
    try {
        const result = await client.mutate({
            mutation: CREATE_GROCERY_LIST,
            variables: { account_id, grocerylist_name },
        });

        return result.data.createGroceryList;
    } catch (error) {
        console.error('Error creating grocery list:', error);
        
        throw error;
    }
}

/**
 * Deletes a grocery list.
 *
 * @param grocerylist_id - The ID of the grocery list to delete.
 * @returns The result of the deletion mutation.
 * @throws Error if the mutation fails.
 */
export async function deleteGroceryList(grocerylist_id: string) {
    try {
        const result = await client.mutate({
            mutation: DELETE_GROCERY_LIST,
            variables: { grocerylist_id },
        });

        return result.data.deleteGroceryList;
    } catch (error) {
        console.error('Error deleting grocery list:', error);
        
        throw error;
    }
}

/**
 * Updates the name of a grocery list.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param grocerylist_name - The new name for the grocery list.
 * @returns The updated grocery list object.
 * @throws Error if the mutation fails.
 */
export async function updateGroceryListName(grocerylist_id: string, grocerylist_name: string) {
    try {
        const result = await client.mutate({
            mutation: UPDATE_GROCERY_LIST_NAME,
            variables: { grocerylist_id, grocerylist_name },
        });

        return result.data.updateGroceryListName;
    } catch (error) {
        console.error('Error updating grocery list name:', error);
        
        throw error;
    }
}

/**
 * Updates the description of a grocery list.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param description - The new description for the grocery list.
 * @returns The updated grocery list object.
 * @throws Error if the mutation fails.
 */
export async function updateGroceryListDescription(grocerylist_id: string, description: string) {
    try{
        const result = await client.mutate({
            mutation: UPDATE_GROCERY_LIST_DESCRIPTION,
            variables: { grocerylist_id, description },
        });

        return result.data.updateGroceryListDescription;
    } catch (error) {
        console.error('Error updating grocery list description:', error);
        throw error;
    }
}

/**
 * Updates the last opened timestamp of a grocery list.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param last_opened - The new last opened timestamp (ISO string).
 * @returns The updated grocery list object.
 * @throws Error if the mutation fails.
 */
export async function updateGroceryListLastOpened(grocerylist_id: string, last_opened: string) {
    try {
        const result = await client.mutate({
            mutation: UPDATE_GROCERY_LIST_LAST_OPENED,
            variables: { grocerylist_id, last_opened },
        });

        return result.data.updateGroceryListLastOpened;
    } catch (error) {
        console.error('Error updating grocery list time opened:');
        throw error;
    }
}

/**
 * Updates the isFamily flag of a grocery list.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param isFamily - The new value for the isFamily flag.
 * @returns The updated grocery list object.
 * @throws Error if the mutation fails.
 */
export async function updateGroceryListIsFamily(grocerylist_id: string, isFamily: boolean) {
    try {
        const result = await client.mutate({
            mutation: UPDATE_GROCERY_LIST_IS_FAMILY,
            variables: { grocerylist_id, isFamily },
        });
        
        return result.data.updateGroceryListIsFamily;
    } catch (error) {
        console.error('Error updating grocery list family status:');
        throw error;
    }
}

/**
 * Updates the isShared flag of a grocery list.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param isShared - The new value for the isShared flag.
 * @returns The updated grocery list object.
 * @throws Error if the mutation fails.
 */
export async function updateGroceryListIsShared(grocerylist_id: string, isShared: boolean) {
    try {
        const result = await client.mutate({
            mutation: UPDATE_GROCERY_LIST_IS_SHARED,
            variables: { grocerylist_id, isShared },
        });

        return result.data.updateGroceryListIsShared;
    } catch (error) {
        console.error('Error updating grocery list shared status:');
        throw error;
    }
}

/**
 * Updates the isComplete flag of a grocery list.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param isComplete - The new value for the isComplete flag.
 * @returns The updated grocery list object.
 * @throws Error if the mutation fails.
 */
export async function updateGroceryListIsComplete(grocerylist_id: string, isComplete: boolean) {
    try {
        const result = await client.mutate({
            mutation: UPDATE_GROCERY_LIST_IS_COMPLETE,
            variables: { grocerylist_id, isComplete },
        });

        return result.data.updateGroceryListIsComplete;
    } catch (error) {
        console.error('Error updating grocery list complete status:');
        throw error;
    }
}

/**
 * Adds a new grocery list item to a grocery list.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param account_id - The ID of the account (used to locate custom items if needed).
 * @param food_global_id - The global food item ID.
 * @param food_name - The name of the food item.
 * @returns The result of the add grocery list item mutation.
 * @throws Error if the mutation fails.
 */
export async function addGroceryListItem(
    grocerylist_id: string,
    account_id: string,
    food_global_id: string,
    food_name: string
) {
    try {
        const result = await client.mutate({
        mutation: ADD_GROCERY_LIST_ITEM,
        variables: { grocerylist_id, account_id, food_global_id, food_name },
        });

        return result.data.addGroceryListItem;
    } catch (error) {
        console.error('Error adding grocery list item:');
        throw error;
    }
}
  
/**
 * Deletes a grocery list item from a grocery list.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param item_id - The ID of the item to delete.
 * @returns The result of the delete grocery list item mutation.
 * @throws Error if the mutation fails.
 */
export async function deleteGroceryListItem(grocerylist_id: string, item_id: string) {
    try {
        const result = await client.mutate({
            mutation: DELETE_GROCERY_LIST_ITEM,
            variables: { grocerylist_id, item_id},
        });

        return result.data.deleteGroceryListItem;
    } catch (error) {
        console.error('Error deleting grocery list item:');
        throw error;
    }
}

/**
 * Updates the measurement of a specific grocery list item.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param item_id - The ID of the item to update.
 * @param measurement - The new measurement value.
 * @returns The result of the update grocery list item measurement mutation.
 * @throws Error if the mutation fails.
 */
export async function updateGroceryListItemMeasurement(
    grocerylist_id: string, 
    item_id: string, 
    measurement: string
) {
    try {
        const result = await client.mutate({
            mutation: UPDATE_GROCERY_LIST_ITEM_MEASUREMENT,
            variables: { grocerylist_id, item_id, measurement },
        });

        return result.data.updateGroceryListItemMeasurement;
    } catch (error) {
        console.error('Error updating grocery list item measurement:', error);
        throw error;
    }
  }

/**
 * Updates the quantity of a specific grocery list item.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param item_id - The ID of the item to update.
 * @param quantity - The new quantity (integer).
 * @returns A boolean indicating whether the update was successful.
 * @throws Error if the mutation fails.
 */
export async function updateGroceryListItemQuantity(
    grocerylist_id: string,
    item_id: string,
    quantity: number
) {
    try {
        const result = await client.mutate({
        mutation: UPDATE_GROCERY_LIST_ITEM_QUANTITY,
        variables: { grocerylist_id, item_id, quantity },
        });
        console.log("Mutation result:", result.data);
        return result.data.updateGroceryListItemQuantity as boolean;
    } catch (error) {
        console.error('Error updating grocery list item quantity:', error);
        throw error;
    }
}

/**
 * Toggles the isBought flag for a specific grocery list item.
 *
 * @param grocerylist_id - The ID of the grocery list.
 * @param item_id - The ID of the item to toggle.
 * @returns A boolean indicating whether the toggle was successful.
 * @throws Error if the mutation fails.
 */
export async function updateGroceryListItemIsBought(grocerylist_id: string, item_id: string) {
    try {
        const result = await client.mutate({
        mutation: UPDATE_GROCERY_LIST_ITEM_IS_BOUGHT,
        variables: { grocerylist_id, item_id },
        });
        return result.data.updateGroceryListItemIsBought as boolean;
    } catch (error) {
        console.error('Error toggling grocery list item isBought:', error);
        throw error;
    }
}

/**
 * Searches for grocery lists associated with a specific account based on a query string.
 *
 * This function sends a GraphQL query (SEARCH_GROCERY_LISTS) to the server to retrieve
 * all grocery lists for the provided account ID that match the given search query.
 * The fetch policy is set to 'network-only' to ensure that fresh data is retrieved.
 *
 * @param {string} account_id - The ID of the account for which to search grocery lists.
 * @param {string} query - The search query string to filter grocery lists.
 * @returns {Promise<string[]>} A promise that resolves to an array of grocery list IDs that match the query.
 * @throws Will throw an error if the query fails.
 */
export async function searchGroceryLists(account_id: string, query: string): Promise<string[]> {
    try {
      const result = await client.query({
        query: SEARCH_GROCERY_LISTS,
        variables: { account_id, query },
        fetchPolicy: 'network-only'
      });
      return result.data.searchGroceryLists;
    } catch (error) {
      console.error('Error searching grocery lists:', error);
      throw error;
    }
  }
// Export additional functions for updating, deleting, etc., in a similar fashion.
