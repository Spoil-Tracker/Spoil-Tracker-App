import {
  getAllPantriesforAccount,
  createPantry,
  type Pantry as GraphQLPantry,
} from '@/components/Pantry/PantryService';
import { getAccountByOwnerID } from '@/components/Account/AccountService';

/**
 * Fetches the user's pantries using GraphQL
 * @returns An array of pantry objects with `id`, `name`, and other details
 */
export const fetchPantries = async (userId: string) => {
  try {
    if (!userId) {
      console.warn('User ID not provided, skipping fetchPantries.');
      return [];
    }

    // Get account first
    const account = await getAccountByOwnerID(userId);
    if (!account?.id) {
      throw new Error('Account not found');
    }

    // Fetch pantries using GraphQL service
    const pantriesData = await getAllPantriesforAccount(account.id);

    // Transform GraphQL response to match your UI expectations
    return pantriesData.map((pantry: GraphQLPantry) => ({
      id: pantry.id,
      name: pantry.pantry_name,
      description: pantry.description || '',
      item_amount: pantry.food_concrete_items?.length || 0,
      sections: {
        unordered: { name: 'Unordered', items: [] },
      },
    }));
  } catch (error) {
    console.error('Error fetching pantries: ', error);
    throw error;
  }
};

/**
 * Creates a new pantry using GraphQL
 * @param newPantryName - The name of the new pantry
 * @param userId - The ID of the user creating the pantry
 * @returns The ID of the newly created pantry
 */
export const createNewPantry = async (
  newPantryName: string,
  userId: string
) => {
  if (!newPantryName.trim()) {
    throw new Error('Please enter a valid pantry name');
  }

  if (!userId) {
    throw new Error('User ID is required to create a pantry');
  }

  try {
    // Get account first
    const account = await getAccountByOwnerID(userId);
    if (!account?.id) {
      throw new Error('Account not found');
    }

    // Create pantry using GraphQL service
    const newPantry = await createPantry(account.id, newPantryName);
    return newPantry.id;
  } catch (error) {
    console.error('Error creating new pantry: ', error);
    throw error;
  }
};

/**
 * Sorts lists based on the selected criteria
 * @param lists - The list of Pantry lists to be sorted
 * @param sortCriteria - The sorting criteria (e.g., 'alphabetical')
 * @returns The sorted list
 */
export const sortLists = (lists: any[], sortCriteria: string) => {
  if (!lists) return [];

  const sorted = [...lists]; // Create a copy

  if (sortCriteria === 'alphabetical') {
    return sorted.sort((a, b) => {
      const nameA = a?.pantry_name?.toLowerCase() || '';
      const nameB = b?.pantry_name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }

  return sorted;
};

/**
 * Filters lists based on the user's search query
 * @param lists - The list of pantry lists to filter
 * @param searchQuery - The search query
 * @returns The filtered list
 */
export function filterLists(lists: any, query: any) {
  if (!query.trim()) return lists; // If query is empty, return all lists

  return lists.filter((list: any) =>
    list.pantry_name?.toLowerCase().includes(query.toLowerCase())
  );
}

// Helper function to format dates
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};
