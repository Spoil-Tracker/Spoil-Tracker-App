
import { gql } from '@apollo/client';
import client from '@/src/ApolloClient'; 

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
  mutation UpdatePantryDescription($pantry_id: String!, $new_description: String!) {
    updatePantryDescription(pantry_id: $pantry_id, new_description: $new_description) {
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
        })

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
        })

        return result.data.createPantry;
    } catch (error) {
        console.error('Error creating pantry:', error);
        
        throw error;
    }
}

export async function updatePantryDescription(pantry_id: string, new_description: string) {
    try {
        const result = await client.mutate({
            mutation: UPDATE_PANTRY_DESCRIPTION,
            variables: { pantry_id, new_description },
        })

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
        })

        return result.data.deletePantry;
    } catch (error) {
        console.error('Error deleting pantry:', error);
        
        throw error;
    }
}