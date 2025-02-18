
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
        delete
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
