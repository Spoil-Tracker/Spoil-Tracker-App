import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { getAuth } from 'firebase/auth';

/**
 * Fetches the user's grocery lists from Firestore.
 * @returns An object containing completed and incomplete lists.
 */
export const fetchGroceryLists = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User is not logged in');
    }

    // Query to fetch grocery lists for the current user
    const groceryListsQuery = query(
      collection(db, 'grocery_lists'),
      where('owner_id', '==', currentUser.uid)
    );

    const querySnapshot = await getDocs(groceryListsQuery);
    const completed = [];
    const incomplete = [];

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

        const list = {
          id: doc.id,
          name: String(data.name),
          completed: data.completed,
          created: data.created ? formatDate(data.created) : 'Unknown Date',
          description: data.description,
        };

        if (data.completed) {
          completed.push(list);
        } else {
          incomplete.push(list);
        }
      }
    });

    return { completed, incomplete };
  } catch (error) {
    console.error('Error fetching grocery lists: ', error);
    throw error;
  }
};

/**
 * Sorts lists based on the selected criteria.
 * @param lists - The list of grocery lists to be sorted.
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
 * @param lists - The list of grocery lists to filter.
 * @param searchQuery - The search query.
 * @returns The filtered list.
 */
export const filterLists = (lists: any[], searchQuery: string) => {
  return lists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

/**
 * Creates a new grocery list in Firestore.
 * @param newListName - The name of the new grocery list.
 * @param ownerId - The ID of the list owner.
 * @returns The ID of the newly created list.
 */
export const createNewGroceryList = async (
  newListName: string,
  ownerId: string
) => {
  if (!newListName.trim()) {
    throw new Error('Please enter a valid list name');
  }

  try {
    const newListRef = await addDoc(collection(db, 'grocery_lists'), {
      name: newListName,
      owner_id: ownerId,
      completed: false,
      created: new Date().toISOString(),
      description: 'Edit the list description!',
      items: [],
    });

    console.log('New grocery list created with ID: ', newListRef.id);
    return newListRef.id;
  } catch (error) {
    console.error('Error creating new grocery list: ', error);
    throw error;
  }
};
