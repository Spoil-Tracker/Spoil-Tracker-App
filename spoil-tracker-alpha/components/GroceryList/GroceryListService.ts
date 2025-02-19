
import { gql } from '@apollo/client';
import client from '@/src/ApolloClient'; 


const GET_ALL_GROCERY_LISTS = gql`
  query GetGroceryListsForAccount($account_id: String!) {
    getGroceryListsForAccount(account_id: $account_id) {
      id
      account_id
      last_opened
      grocerylist_name
      description
      food_global_items
      isFamily
      isShared
      isComplete
    }
  }
`;


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

const UPDATE_GROCERY_LIST_NAME = gql`
    mutation UpdateGroceryListName($grocerylist_id: String!, $grocerylist_name: String!) {
        updateGroceryListName(grocerylist_id: $grocerylist_id, grocerylist_name: $grocerylist_name) {
            id
            grocerylist_name
        }
    }
`;

const UPDATE_GROCERY_LIST_DESCRIPTION = gql`
    mutation UpdateGroceryListDescription($grocerylist_id: String!, $description: String!) {
        updateGroceryListDescription(grocerylist_id: $grocerylist_id, description: $description) {
            id
            grocerylist_name
        }
    }
`;

const UPDATE_GROCERY_LIST_LAST_OPENED = gql`
    mutation UpdateGroceryListLastOpened($grocerylist_id: String!, $last_opened: String!) {
        updateGroceryListLastOpened(grocerylist_id: $grocerylist_id, last_opened: $last_opened) {
            id
            last_opened
        }
    }
`;

const UPDATE_GROCERY_LIST_IS_FAMILY = gql`
    mutation UpdateGroceryListIsFamily($grocerylist_id: String!, $isFamily: Boolean!) {
        updateGroceryListIsFamily(grocerylist_id: $grocerylist_id, isFamily: $isFamily) {
            id
            isFamily
        }
    }
`;

const UPDATE_GROCERY_LIST_IS_SHARED = gql`
    mutation UpdateGroceryListIsShared($grocerylist_id: String!, $isShared: Boolean!) {
        updateGroceryListIsShared(grocerylist_id: $grocerylist_id, isShared: $isShared) {
            id
            isShared
        }
    }
`;

const UPDATE_GROCERY_LIST_IS_COMPLETE = gql`
    mutation UpdateGroceryListIsComplete($grocerylist_id: String!, $isCompleted: Boolean!) {
        updateGroceryListIsComplete(grocerylist_id: $grocerylist_id, isCompleted: $isCompleted) {
            id
            isCompleted
        }
    }
`;

export interface GroceryList {
    id: string;
    account_id: string;
    createdAt: string;
    last_opened: string;
    grocerylist_name: string;
    description: string;
    food_global_items: string[];
    isFamily: boolean;
    isShared: boolean;
    isComplete: boolean;
};
// Add more mutations/queries as needed…

// Function to fetch all grocery lists
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

// Function to create a new grocery list
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

export async function updateGroceryListDescription(grocerylist_id: string, new_description: string) {
    try{
        const result = await client.mutate({
            mutation: UPDATE_GROCERY_LIST_DESCRIPTION,
            variables: { grocerylist_id, new_description },
        });

        return result.data.updateGroceryListDescription;
    } catch (error) {
        console.error('Error updating grocery list description:', error);
        throw error;
    }
}

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

// Export additional functions for updating, deleting, etc., in a similar fashion.
