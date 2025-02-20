
import { gql } from '@apollo/client';
import client from '@/src/ApolloClient'; 


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
        }
        isFamily
        isShared
        isComplete
    }
  }
`;

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
        }
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

const DELETE_GROCERY_LIST = gql`
    mutation DeleteGroceryList($grocerylist_id: String!) {
        deleteGroceryList(grocerylist_id: $grocerylist_id)
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
    mutation UpdateGroceryListIsComplete($grocerylist_id: String!, $isComplete: Boolean!) {
        updateGroceryListIsComplete(grocerylist_id: $grocerylist_id, isComplete: $isComplete) {
            id
            isComplete
        }
    }
`;

const ADD_GROCERY_LIST_ITEM = gql`
    mutation AddGroceryListItem($grocerylist_id: String!, $food_global_id: String!, $food_name: String!) {
        addGroceryListItem(grocerylist_id: $grocerylist_id, food_global_id: $food_global_id, food_name: $food_name)
    }
`;

const DELETE_GROCERY_LIST_ITEM = gql`
    mutation DeleteGroceryListItem($grocerylist_id: String!, $item_id: String!) {
        deleteGroceryListItem(grocerylist_id: $grocerylist_id, item_id: $item_id)
    }
`;

const UPDATE_GROCERY_LIST_ITEM_MEASUREMENT = gql`
    mutation UpdateGroceryListItemMeasurement($grocerylist_id: String!, $item_id: String!, $measurement: String!) {
        updateGroceryListItemMeasurement(grocerylist_id: $grocerylist_id, item_id: $item_id, measurement: $measurement)
    }
`;

const UPDATE_GROCERY_LIST_ITEM_QUANTITY = gql`
    mutation UpdateGroceryListItemQuantity($grocerylist_id: String!, $item_id: String!, $quantity: Int!) {
        updateGroceryListItemQuantity(grocerylist_id: $grocerylist_id, item_id: $item_id, quantity: $quantity)
    }
`; 

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

export interface GroceryListItem {
    id: string;
    food_name: string;
    food_global_id: string;
    measurement: string;
    quantity: number;
    isBought: boolean;
}
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

export async function addGroceryListItem(grocerylist_id: string, food_global_id: string, food_name: string) {
    try {
        const result = await client.mutate({
            mutation: ADD_GROCERY_LIST_ITEM,
            variables: { grocerylist_id, food_global_id, food_name},
        });

        return result.data.addGroceryListItem;
    } catch (error) {
        console.error('Error adding grocery list item:');
        throw error;
    }
}

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


export async function updateGroceryListItemMeasurement(grocerylist_id: string, item_id: string, measurement: string) {
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
  
export async function updateGroceryListItemQuantity(grocerylist_id: string, item_id: string, quantity: number) {
    try {
        const result = await client.mutate({
            mutation: UPDATE_GROCERY_LIST_ITEM_QUANTITY,
            variables: { grocerylist_id, item_id, quantity },
        });
        return result.data.updateGroceryListItemQuantity;
    } catch (error) {
        console.error('Error updating grocery list item quantity:', error);
        throw error;
    }
}

// Export additional functions for updating, deleting, etc., in a similar fashion.
