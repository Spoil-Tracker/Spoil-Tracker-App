
import { gql } from '@apollo/client';
import client from '@/src/ApolloClient'; 

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

export async function getAccountByOwnerID(owner_id: string) {
    try {
        const result = await client.query({
            query: GET_ACCOUNT_BY_OWNER_ID,
            variables: { owner_id },
        })
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
        })
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
            variables: { account_id, pantry_id, },
        })
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
            variables: { account_id, food_abstract_id, },
        })
        return result.data.deleteFoodAbstractFromAccount;
    } catch (error) {
        console.error('Error deleting food (a):', error);
    
        throw error;
    }
}

export async function deleteAccount(account_id: string) { 
    try {
        const result = await client.mutate({
            mutation: DELETE_ACCOUNT,
            variables: { account_id, },
        })
        return result.data.deleteAccount;
    } catch (error) {
        console.error('Error deleting account:', error);
    
        throw error;
    }
}