import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { getAuth } from 'firebase/auth';

/**
 * Fetches the user's pantries from Firestore.
 * @returns An array of pantry objects with `id`, `name`, and other details.
 */
export const fetchPantries = async (user: unknown) => {
  try {
    const user = getAuth().currentUser;

    if (!user) {
      console.warn('User is not logged in, skipping fetchPantries.');
      return []; // Return empty array instead of throwing an error
    }

    // Query to fetch pantries for the current user
    const pantriesQuery = query(
      collection(db, 'pantry'),
      where('user_id', '==', user.uid)
    );

    const querySnapshot = await getDocs(pantriesQuery);
    const pantries: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data?.name) {
        const formatDate = (isoString: string) => {
          const date = new Date(isoString);
          return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
        };

        pantries.push({
          id: doc.id,
          name: String(data.name),
          created: data.created ? formatDate(data.created) : 'Unknown Date',
          description: data.description,
          item_amount: data.item_amount || 0,
          sections: data.sections || {
            unordered: { name: 'Unordered', items: [] },
          },
        });
      }
    });

    return pantries;
  } catch (error) {
    console.error('Error fetching pantries: ', error);
    throw error;
  }
};

/**
 * Sorts lists based on the selected criteria.
 * @param lists - The list of Pantry lists to be sorted.
 * @param sortCriteria - The sorting criteria (e.g., 'alphabetical').
 * @returns The sorted list.
 */
export const sortLists = (lists: any[], sortCriteria: string) => {
  if (sortCriteria === 'alphabetical') {
    return lists.sort((a, b) => a.name.localeCompare(b.name));
  }
  return lists; // Default no sort (add more sorting criteria if needed)
};

/**
 * Filters lists based on the user's search query.
 * @param lists - The list of pantry lists to filter.
 * @param searchQuery - The search query.
 * @returns The filtered list.
 */
export const filterLists = (lists: any[], searchQuery: string) => {
  return lists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

/**
 * Creates a new pantry in Firestore.
 * @param newPantryName - The name of the new pantry.
 * @param userId - The ID of the user creating the pantry (optional).
 * @returns The ID of the newly created pantry.
 */
export const createNewPantry = async (
  newPantryName: string,
  userId?: string
) => {
  if (!newPantryName.trim()) {
    throw new Error('Please enter a valid pantry name');
  }

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Use the provided userId or fall back to the current user's UID
  const resolvedUserId = userId || currentUser?.uid;

  if (!resolvedUserId) {
    throw new Error('User ID is required to create a pantry');
  }

  try {
    const newPantryRef = await addDoc(collection(db, 'pantry'), {
      name: newPantryName,
      user_id: resolvedUserId,
      created: new Date().toISOString(),
      description: 'A newly made pantry!',
      item_amount: 0,
      sections: { unordered: { name: 'Unordered', items: [] } },
    });

    console.log('New pantry created with ID: ', newPantryRef.id);
    return newPantryRef.id;
  } catch (error) {
    console.error('Error creating new pantry: ', error);
    throw error;
  }
};
