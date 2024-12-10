import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type FoodItem = {
  __typename?: 'FoodItem';
  expiration?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addFoodItem: Pantry;
  createPantry: Pantry;
  createUser: User;
};


export type MutationAddFoodItemArgs = {
  foodExpiry: Scalars['String']['input'];
  foodName: Scalars['String']['input'];
  foodQuantity: Scalars['Float']['input'];
  pantryName: Scalars['String']['input'];
  userName: Scalars['String']['input'];
};


export type MutationCreatePantryArgs = {
  name: Scalars['String']['input'];
  ownerName: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Pantry = {
  __typename?: 'Pantry';
  foodItems: Array<FoodItem>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  owner_id: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  getAllPantries: Array<Pantry>;
  getAllUsers: Array<User>;
  getPantryForUser?: Maybe<Array<Pantry>>;
  getUserByName?: Maybe<User>;
};


export type QueryGetPantryForUserArgs = {
  name: Scalars['String']['input'];
};


export type QueryGetUserByNameArgs = {
  name: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  password: Scalars['String']['output'];
};

export type GetAllUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllUsersQuery = { __typename?: 'Query', getAllUsers: Array<{ __typename?: 'User', id: string, name: string, email: string }> };

export type GetPantriesForUserQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type GetPantriesForUserQuery = { __typename?: 'Query', getPantryForUser?: Array<{ __typename?: 'Pantry', id: string, name: string, foodItems: Array<{ __typename?: 'FoodItem', id: string, name: string, quantity: number, expiration?: string | null }> }> | null };


export const GetAllUsersDocument = gql`
    query GetAllUsers {
  getAllUsers {
    id
    name
    email
  }
}
    `;

/**
 * __useGetAllUsersQuery__
 *
 * To run a query within a React component, call `useGetAllUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(GetAllUsersDocument, options);
      }
export function useGetAllUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(GetAllUsersDocument, options);
        }
export function useGetAllUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(GetAllUsersDocument, options);
        }
export type GetAllUsersQueryHookResult = ReturnType<typeof useGetAllUsersQuery>;
export type GetAllUsersLazyQueryHookResult = ReturnType<typeof useGetAllUsersLazyQuery>;
export type GetAllUsersSuspenseQueryHookResult = ReturnType<typeof useGetAllUsersSuspenseQuery>;
export type GetAllUsersQueryResult = Apollo.QueryResult<GetAllUsersQuery, GetAllUsersQueryVariables>;
export const GetPantriesForUserDocument = gql`
    query GetPantriesForUser($name: String!) {
  getPantryForUser(name: $name) {
    id
    name
    foodItems {
      id
      name
      quantity
      expiration
    }
  }
}
    `;

/**
 * __useGetPantriesForUserQuery__
 *
 * To run a query within a React component, call `useGetPantriesForUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPantriesForUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPantriesForUserQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useGetPantriesForUserQuery(baseOptions: Apollo.QueryHookOptions<GetPantriesForUserQuery, GetPantriesForUserQueryVariables> & ({ variables: GetPantriesForUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPantriesForUserQuery, GetPantriesForUserQueryVariables>(GetPantriesForUserDocument, options);
      }
export function useGetPantriesForUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPantriesForUserQuery, GetPantriesForUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPantriesForUserQuery, GetPantriesForUserQueryVariables>(GetPantriesForUserDocument, options);
        }
export function useGetPantriesForUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPantriesForUserQuery, GetPantriesForUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPantriesForUserQuery, GetPantriesForUserQueryVariables>(GetPantriesForUserDocument, options);
        }
export type GetPantriesForUserQueryHookResult = ReturnType<typeof useGetPantriesForUserQuery>;
export type GetPantriesForUserLazyQueryHookResult = ReturnType<typeof useGetPantriesForUserLazyQuery>;
export type GetPantriesForUserSuspenseQueryHookResult = ReturnType<typeof useGetPantriesForUserSuspenseQuery>;
export type GetPantriesForUserQueryResult = Apollo.QueryResult<GetPantriesForUserQuery, GetPantriesForUserQueryVariables>;