import { gql } from '@apollo/client';
import client from '@/ApolloClient';

/**
 * GraphQL query to fetch the entire community feed.
 */
const GET_COMMUNITY = gql`
  query GetCommunity {
    getCommunity {
      posts {
        id
        title
        content
        likes
        account_id
        createdAt
        comments {
          account_id
          message
          createdAt
        }
      }
      copiedGroceryLists {
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
        likes
        snapshotAt
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;

/**
 * GraphQL mutation to create a new post.
 */
const CREATE_POST = gql`
  mutation CreatePost($input: PostInput!) {
    createPost(input: $input) {
      posts {
        id
        title
        content
        likes
        account_id
        createdAt
        comments {
          account_id
          message
          createdAt
        }
      }
      copiedGroceryLists {
        id
        grocerylist_name
        likes
        snapshotAt 
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;

/**
 * GraphQL mutation to update an existing post.
 */
const UPDATE_POST = gql`
  mutation UpdatePost($post_id: String!, $input: UpdatePostInput!) {
    updatePost(post_id: $post_id, input: $input) {
      posts {
        id
        title
        content
        likes
        account_id
        createdAt
        comments {
          account_id
          message
          createdAt
        }
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;

/**
 * GraphQL mutation to increment the likes of a post.
 */
const INCREMENT_POST_LIKES = gql`
  mutation IncrementPostLikes($post_id: String!) {
    incrementPostLikes(post_id: $post_id) {
      posts {
        id
        likes
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;

/**
 * GraphQL mutation to decrement the likes of a post.
 */
const DECREMENT_POST_LIKES = gql`
  mutation DecrementPostLikes($post_id: String!) {
    decrementPostLikes(post_id: $post_id) {
      posts {
        id
        likes
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;

/**
 * GraphQL mutation to add a comment to a post.
 */
const ADD_COMMENT_TO_POST = gql`
  mutation AddCommentToPost($post_id: String!, $account_id: String!, $message: String!) {
    addCommentToPost(post_id: $post_id, account_id: $account_id, message: $message) {
      posts {
        id
        comments {
          account_id
          message
          createdAt
        }
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;

/**
 * GraphQL mutation to delete a post.
 */
const DELETE_POST = gql`
  mutation DeletePost($post_id: String!) {
    deletePost(post_id: $post_id) {
      posts {
        id
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;

/**
 * GraphQL mutation to add a copied grocery list to the community.
 */
const ADD_COPIED_GROCERY_LIST = gql`
  mutation AddCopiedGroceryList($grocery_list_id: String!) {
    addCopiedGroceryList(grocery_list_id: $grocery_list_id) {
      copiedGroceryLists {
        id
        grocerylist_name
        likes
        snapshotAt 
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;

/**
 * GraphQL mutation to increment the likes of a copied grocery list.
 */
const INCREMENT_COPIED_GROCERY_LIST_LIKES = gql`
  mutation IncrementCopiedGroceryListLikes($grocery_list_id: String!) {
    incrementCopiedGroceryListLikes(grocery_list_id: $grocery_list_id) {
      copiedGroceryLists {
        id
        likes
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;

/**
 * GraphQL mutation to remove a copied grocery list from the community.
 */
const REMOVE_COPIED_GROCERY_LIST = gql`
  mutation RemoveCopiedGroceryList($grocery_list_id: String!) {
    removeCopiedGroceryList(grocery_list_id: $grocery_list_id) {
      copiedGroceryLists {
        id
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;

const GET_POPULAR_FOODS = gql`
  query GetPopularFoods($apiKey: String!) {
    getPopularFoods(apiKey: $apiKey)
  }
`;

const GET_SEASONAL_FOODS = gql`
  query GetSeasonalFoods($apiKey: String!) {
    getSeasonalFoods(apiKey: $apiKey)
  }
`;

const DECREMENT_COPIED_GROCERY_LIST_LIKES = gql`
  mutation DecrementCopiedGroceryListLikes($grocery_list_id: String!) {
    decrementCopiedGroceryListLikes(grocery_list_id: $grocery_list_id) {
      copiedGroceryLists {
        id
        likes
      }
      updated
      popular_foods
      seasonal_foods
    }
  }
`;


// ---
// Updated type definitions
// ---

export interface Comment {
  account_id: string;
  message: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  likes: number;
  account_id: string;
  createdAt: string;
  comments: Comment[];
}

/**
 * Fetches the entire community feed.
 */
export async function getCommunity() {
  try {
    const result = await client.query({
      query: GET_COMMUNITY,
      fetchPolicy: 'no-cache',
    });
    return result.data.getCommunity;
  } catch (error) {
    console.error('Error fetching community feed:', error);
    throw error;
  }
}

/**
 * Creates a new post.
 */
export async function createPost(input: { title: string; content: string; account_id: string }) {
  try {
    const result = await client.mutate({
      mutation: CREATE_POST,
      variables: { input },
    });
    return result.data.createPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

/**
 * Updates an existing post.
 */
export async function updatePost(post_id: string, input: { title?: string; content?: string }) {
  try {
    const result = await client.mutate({
      mutation: UPDATE_POST,
      variables: { post_id, input },
    });
    return result.data.updatePost;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

/**
 * Increments the likes of a post.
 */
export async function incrementPostLikes(post_id: string) {
  try {
    const result = await client.mutate({
      mutation: INCREMENT_POST_LIKES,
      variables: { post_id },
    });
    return result.data.incrementPostLikes;
  } catch (error) {
    console.error('Error incrementing post likes:', error);
    throw error;
  }
}

/**
 * Decrements the likes of a post.
 */
export async function decrementPostLikes(post_id: string) {
  try {
    const result = await client.mutate({
      mutation: DECREMENT_POST_LIKES,
      variables: { post_id },
    });
    return result.data.decrementPostLikes;
  } catch (error) {
    console.error('Error decrementing post likes:', error);
    throw error;
  }
}

/**
 * Adds a comment to a post.
 */
export async function addCommentToPost(post_id: string, account_id: string, message: string) {
  try {
    const result = await client.mutate({
      mutation: ADD_COMMENT_TO_POST,
      variables: { post_id, account_id, message },
    });
    return result.data.addCommentToPost;
  } catch (error) {
    console.error('Error adding comment to post:', error);
    throw error;
  }
}

/**
 * Deletes a post.
 */
export async function deletePost(post_id: string) {
  try {
    const result = await client.mutate({
      mutation: DELETE_POST,
      variables: { post_id },
    });
    return result.data.deletePost;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

/**
 * Adds a copied grocery list to the community feed.
 */
export async function addCopiedGroceryList(grocery_list_id: string) {
  try {
    const result = await client.mutate({
      mutation: ADD_COPIED_GROCERY_LIST,
      variables: { grocery_list_id },
    });
    return result.data.addCopiedGroceryList;
  } catch (error) {
    console.error('Error adding copied grocery list:', error);
    throw error;
  }
}

/**
 * Increments the likes of a copied grocery list.
 */
export async function incrementCopiedGroceryListLikes(grocery_list_id: string) {
  try {
    const result = await client.mutate({
      mutation: INCREMENT_COPIED_GROCERY_LIST_LIKES,
      variables: { grocery_list_id },
    });
    return result.data.incrementCopiedGroceryListLikes;
  } catch (error) {
    console.error('Error incrementing copied grocery list likes:', error);
    throw error;
  }
}

/**
 * Removes a copied grocery list from the community feed.
 */
export async function removeCopiedGroceryList(grocery_list_id: string) {
  try {
    const result = await client.mutate({
      mutation: REMOVE_COPIED_GROCERY_LIST,
      variables: { grocery_list_id },
    });
    return result.data.removeCopiedGroceryList;
  } catch (error) {
    console.error('Error removing copied grocery list:', error);
    throw error;
  }
}

/**
 * Fetches the popular_foods array.
 *
 * @returns The list of popular food IDs.
 */
export async function fetchPopularFoods() {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY!;
    const result = await client.query({
      query: GET_POPULAR_FOODS,
      variables: { apiKey },
      fetchPolicy: 'no-cache',
    });
    return result.data.getPopularFoods;
  } catch (error) {
    console.error('Error fetching popular foods:', error);
    throw error;
  }
}

/**
 * Fetches the seasonal_foods array.
 *
 * @returns The list of seasonal food IDs.
 */
export async function fetchSeasonalFoods() {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY!;
    const result = await client.query({
      query: GET_SEASONAL_FOODS,
      variables: { apiKey },
      fetchPolicy: 'no-cache',
    });
    return result.data.getSeasonalFoods;
  } catch (error) {
    console.error('Error fetching seasonal foods:', error);
    throw error;
  }
}

export async function decrementCopiedGroceryListLikes(grocery_list_id: string) {
  try {
    const result = await client.mutate({
      mutation: DECREMENT_COPIED_GROCERY_LIST_LIKES,
      variables: { grocery_list_id },
    });
    return result.data.decrementCopiedGroceryListLikes;
  } catch (error) {
    console.error('Error decrementing copied grocery list likes:', error);
    throw error;
  }
}
