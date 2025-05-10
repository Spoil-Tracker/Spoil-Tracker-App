// src/services/FoodLeaderboardService.ts

import { gql } from '@apollo/client';
import client from '@/ApolloClient';

/**
 * --- GraphQL Queries & Mutations ---
 */

const GET_ALL_FOOD_LEADERBOARD = gql`
  query GetAllFoodLeaderboard {
    getAllFoodLeaderboard {
      id
      food_global_id
      total_times_bought
      total_times_eaten
      total_times_tossed
      account_record_items {
        account_id
        times_bought
        times_eaten
        times_tossed
      }
    }
  }
`;

const GET_FOOD_LEADERBOARD_BY_FOOD_ID = gql`
  query GetFoodLeaderboardByFoodID($food_global_id: String!) {
    getFoodLeaderboardbyFoodID(food_global_id: $food_global_id) {
      id
      food_global_id
      total_times_bought
      total_times_eaten
      total_times_tossed
      account_record_items {
        account_id
        times_bought
        times_eaten
        times_tossed
      }
    }
  }
`;

const CREATE_FOOD_LEADERBOARD = gql`
  mutation CreateFoodLeaderboard($food_global_id: String!) {
    createFoodLeaderboard(food_global_id: $food_global_id) {
      id
      food_global_id
      total_times_bought
      total_times_eaten
      total_times_tossed
      account_record_items {
        account_id
        times_bought
        times_eaten
        times_tossed
      }
    }
  }
`;

const INCREMENT_BOUGHT = gql`
  mutation IncrementBought($food_global_id: String!, $account_id: String!) {
    incrementBought(food_global_id: $food_global_id, account_id: $account_id) {
      id
      total_times_bought
      account_record_items {
        account_id
        times_bought
      }
    }
  }
`;

const DECREMENT_BOUGHT = gql`
  mutation DecrementBought($food_global_id: String!, $account_id: String!) {
    decrementBought(food_global_id: $food_global_id, account_id: $account_id) {
      id
      total_times_bought
      account_record_items {
        account_id
        times_bought
      }
    }
  }
`;

const INCREMENT_EATEN = gql`
  mutation IncrementEaten($food_global_id: String!, $account_id: String!) {
    incrementEaten(food_global_id: $food_global_id, account_id: $account_id) {
      id
      total_times_eaten
      account_record_items {
        account_id
        times_eaten
      }
    }
  }
`;

const INCREMENT_THROWN = gql`
  mutation IncrementThrown($food_global_id: String!, $account_id: String!) {
    incrementThrown(food_global_id: $food_global_id, account_id: $account_id) {
      id
      total_times_tossed
      account_record_items {
        account_id
        times_tossed
      }
    }
  }
`;

const GET_TOTAL_TIMES_BOUGHT = gql`
  query GetTotalTimesBought {
    getTotalTimesBought
  }
`;

const GET_TOTAL_TIMES_EATEN = gql`
  query GetTotalTimesEaten {
    getTotalTimesEaten
  }
`;

const GET_TOTAL_TIMES_TOSSED = gql`
  query GetTotalTimesTossed {
    getTotalTimesTossed
  }
`;

/**
 * --- TypeScript Interfaces ---
 */

export interface AccountRecord {
  account_id: string;
  times_bought: number;
  times_eaten: number;
  times_tossed: number;
}

export interface FoodLeaderboard {
  id: string;
  food_global_id: string;
  total_times_bought: number;
  total_times_eaten: number;
  total_times_tossed: number;
  account_record_items: AccountRecord[];
}

/**
 * Fetches the entire leaderboard.
 */
export async function getAllFoodLeaderboard(): Promise<FoodLeaderboard[]> {
  const { data } = await client.query<{ getAllFoodLeaderboard: FoodLeaderboard[] }>({
    query: GET_ALL_FOOD_LEADERBOARD,
    fetchPolicy: 'no-cache',
  });
  return data.getAllFoodLeaderboard;
}

/**
 * Fetches one leaderboard entry by food_global_id.
 */
export async function getFoodLeaderboardByFoodID(
  food_global_id: string
): Promise<FoodLeaderboard | null> {
  const { data } = await client.query<{
    getFoodLeaderboardbyFoodID: FoodLeaderboard | null;
  }>({
    query: GET_FOOD_LEADERBOARD_BY_FOOD_ID,
    variables: { food_global_id },
    fetchPolicy: 'no-cache',
  });
  return data.getFoodLeaderboardbyFoodID;
}

/**
 * Creates a new leaderboard entry for a food (starts all counts at zero).
 */
export async function createFoodLeaderboard(
  food_global_id: string
): Promise<FoodLeaderboard> {
  const { data } = await client.mutate<{ createFoodLeaderboard: FoodLeaderboard }>({
    mutation: CREATE_FOOD_LEADERBOARD,
    variables: { food_global_id },
  });
  return data!.createFoodLeaderboard;
}

/**
 * Increments the buy count for one account+food.
 */
export async function incrementBought(
  food_global_id: string,
  account_id: string
): Promise<Pick<FoodLeaderboard, 'id' | 'total_times_bought'> & { account_record_items: AccountRecord[] }> {
  const { data } = await client.mutate<{ incrementBought: any }>({
    mutation: INCREMENT_BOUGHT,
    variables: { food_global_id, account_id },
  });
  return data!.incrementBought;
}

/**
 * Decrements the buy count for one account+food.
 */
export async function decrementBought(
  food_global_id: string,
  account_id: string
): Promise<Pick<FoodLeaderboard, 'id' | 'total_times_bought'> & { account_record_items: AccountRecord[] }> {
  const { data } = await client.mutate<{ decrementBought: any }>({
    mutation: DECREMENT_BOUGHT,
    variables: { food_global_id, account_id },
  });
  return data!.decrementBought;
}

/**
 * Increments the eaten count for one account+food.
 */
export async function incrementEaten(
  food_global_id: string,
  account_id: string
): Promise<Pick<FoodLeaderboard, 'id' | 'total_times_eaten'> & { account_record_items: AccountRecord[] }> {
  const { data } = await client.mutate<{ incrementEaten: any }>({
    mutation: INCREMENT_EATEN,
    variables: { food_global_id, account_id },
  });
  return data!.incrementEaten;
}

/**
 * Increments the tossed count for one account+food.
 */
export async function incrementThrown(
  food_global_id: string,
  account_id: string
): Promise<Pick<FoodLeaderboard, 'id' | 'total_times_tossed'> & { account_record_items: AccountRecord[] }> {
  const { data } = await client.mutate<{ incrementThrown: any }>({
    mutation: INCREMENT_THROWN,
    variables: { food_global_id, account_id },
  });
  return data!.incrementThrown;
}


/**
 * Fetches the total across all foods: total_times_bought
 */
export async function getTotalTimesBought(): Promise<number> {
    const { data } = await client.query<{ getTotalTimesBought: number }>({
        query: GET_TOTAL_TIMES_BOUGHT,
        fetchPolicy: 'no-cache',
    });
    return data.getTotalTimesBought;
}
  
/**
 * Fetches the total across all foods: total_times_eaten
 */
export async function getTotalTimesEaten(): Promise<number> {
const { data } = await client.query<{ getTotalTimesEaten: number }>({
    query: GET_TOTAL_TIMES_EATEN,
    fetchPolicy: 'no-cache',
});
return data.getTotalTimesEaten;
}

/**
 * Fetches the total across all foods: total_times_tossed
 */
export async function getTotalTimesTossed(): Promise<number> {
const { data } = await client.query<{ getTotalTimesTossed: number }>({
    query: GET_TOTAL_TIMES_TOSSED,
    fetchPolicy: 'no-cache',
});
return data.getTotalTimesTossed;
}
