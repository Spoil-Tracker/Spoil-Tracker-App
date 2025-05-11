import { gql } from '@apollo/client';
import client from '@/ApolloClient';

const GET_ALL_PANTRIES_FOR_ACCOUNT = gql`
  query GetAllPantriesForAccount($account_id: String!) {
    getAllPantriesforAccount(account_id: $account_id) {
      id
      account_id
      pantry_name
      description
      food_concrete_items
    }
  }
`;

const CREATE_PANTRY = gql`
  mutation CreatePantry($account_id: String!, $pantry_name: String!) {
    createPantry(account_id: $account_id, pantry_name: $pantry_name) {
      id
      pantry_name
    }
  }
`;

const UPDATE_PANTRY_DESCRIPTION = gql`
  mutation UpdatePantryDescription(
    $pantry_id: String!
    $new_description: String!
  ) {
    updatePantryDescription(
      pantry_id: $pantry_id
      new_description: $new_description
    ) {
      id
      description
    }
  }
`;

const DELETE_PANTRY = gql`
  mutation DeletePantry($pantry_id: String!) {
    deletePantry(pantry_id: $pantry_id)
  }
`;

const SEARCH_PANTRIES = gql`
  query SearchPantries($account_id: String!, $query: String!) {
    searchPantries(account_id: $account_id, query: $query)
  }
`;

export interface Pantry {
  id: string;
  account_id: string;
  pantry_name: string;
  description: string;
  food_concrete_items: string[];
}

export async function getAllPantriesforAccount(account_id: string) {
  try {
    const result = await client.query({
      query: GET_ALL_PANTRIES_FOR_ACCOUNT,
      variables: { account_id },
      fetchPolicy: 'network-only',
    });
    return result.data.getAllPantriesforAccount;
  } catch (error) {
    console.error('Error getting pantries:', error);
    throw error;
  }
}

export async function createPantry(account_id: string, pantry_name: string) {
  try {
    const result = await client.mutate({
      mutation: CREATE_PANTRY,
      variables: { account_id, pantry_name },
    });
    return result.data.createPantry;
  } catch (error) {
    console.error('Error creating pantry:', error);
    throw error;
  }
}

export async function updatePantryDescription(
  pantry_id: string,
  new_description: string
) {
  try {
    const result = await client.mutate({
      mutation: UPDATE_PANTRY_DESCRIPTION,
      variables: { pantry_id, new_description },
    });
    return result.data.updatePantryDescription;
  } catch (error) {
    console.error('Error updating pantry description:', error);
    throw error;
  }
}

export async function deletePantry(pantry_id: string) {
  try {
    const result = await client.mutate({
      mutation: DELETE_PANTRY,
      variables: { pantry_id },
    });
    return result.data.deletePantry;
  } catch (error) {
    console.error('Error deleting pantry:', error);
    throw error;
  }
}

const GET_FOOD_CONCRETE_ITEMS = gql`
  query GetFoodConcreteItems($pantry_id: String!) {
    getAllFoodConcreteInPantry(pantry_id: $pantry_id) {
      id
      pantry_id
      food_abstract_id
      expiration_date
      quantity
      quantity_type
    }
  }
`;

const CREATE_FOOD_CONCRETE = gql`
  mutation CreateFoodConcrete(
    $pantry_id: String!
    $food_abstract_id: String!
    $expiration_date: String!
    $quantity: Float!
    $quantity_type: String!
  ) {
    createFoodConcrete(
      pantry_id: $pantry_id
      food_abstract_id: $food_abstract_id
      expiration_date: $expiration_date
      quantity: $quantity
      quantity_type: $quantity_type
    ) {
      id
      pantry_id
      food_abstract_id
      expiration_date
      quantity
      quantity_type
    }
  }
`;

const UPDATE_FOOD_CONCRETE = gql`
  mutation UpdateFoodConcrete(
    $food_concrete_id: String!
    $quantity: Float!
    $quantity_type: String!
  ) {
    updateQuantity(
      food_concrete_id: $food_concrete_id
      quantity: $quantity
      quantity_type: $quantity_type
    ) {
      id
      quantity
      quantity_type
    }
  }
`;

const DELETE_FOOD_CONCRETE = gql`
  mutation DeleteFoodConcrete($food_concrete_id: String!) {
    deleteFoodConcrete(food_concrete_id: $food_concrete_id)
  }
`;

export async function getFoodConcreteItems(pantry_id: string) {
  try {
    const result = await client.query({
      query: GET_FOOD_CONCRETE_ITEMS,
      variables: { pantry_id },
      fetchPolicy: 'network-only',
    });
    return result.data.getAllFoodConcreteInPantry;
  } catch (error) {
    console.error('Error getting food concrete items:', error);
    throw error;
  }
}

export async function createFoodConcrete(
  pantry_id: string,
  food_abstract_id: string, // <- using food_abstract_id now
  expiration_date: string,
  quantity: number,
  quantity_type: string
) {
  try {
    const result = await client.mutate({
      mutation: CREATE_FOOD_CONCRETE,
      variables: {
        pantry_id,
        food_abstract_id, // <- use food_abstract_id
        expiration_date,
        quantity,
        quantity_type,
      },
    });
    return result.data.createFoodConcrete;
  } catch (error) {
    console.error('Error creating food concrete:', error);
    throw error;
  }
}

export async function updateQuantity(
  food_concrete_id: string,
  quantity: number,
  quantity_type: string
) {
  try {
    const result = await client.mutate({
      mutation: UPDATE_FOOD_CONCRETE,
      variables: {
        food_concrete_id,
        quantity,
        quantity_type,
      },
    });
    return result.data.updateQuantity;
  } catch (error) {
    console.error('Error updating quantity:', error);
    throw error;
  }
}

export async function deleteFoodConcrete(food_concrete_id: string) {
  try {
    const result = await client.mutate({
      mutation: DELETE_FOOD_CONCRETE,
      variables: { food_concrete_id },
    });
    return result.data.deleteFoodConcrete;
  } catch (error) {
    console.error('Error deleting food concrete:', error);
    throw error;
  }
}

const GET_PANTRY_BY_ID = gql`
  query GetPantryById($pantry_id: String!) {
    getPantryById(pantry_id: $pantry_id) {
      id
      pantry_name
      description
      food_concrete_items
      account_id
    }
  }
`;

export async function getPantryById(pantry_id: string) {
  try {
    const result = await client.query({
      query: GET_PANTRY_BY_ID,
      variables: { pantry_id },
      fetchPolicy: 'network-only',
    });
    return result.data.getPantryById;
  } catch (error) {
    console.error('Error fetching pantry:', error);
    throw error;
  }
}

/**
 * Returns an array of pantry IDs whose name or description matches the query.
 */
export async function searchPantries(
  account_id: string,
  query: string
): Promise<string[]> {
  try {
    const result = await client.query<{ searchPantries: string[] }>({
      query: SEARCH_PANTRIES,
      variables: { account_id, query },
      fetchPolicy: 'network-only',
    });
    return result.data.searchPantries;
  } catch (error) {
    console.error('Error searching pantries:', error);
    throw error;
  }
}
