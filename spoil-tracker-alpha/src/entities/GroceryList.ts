import { 
    Resolver, 
    Query, 
    Mutation, 
    Arg, 
    Field, 
    ObjectType, 
    ID,
    InputType,
    Int } from "type-graphql";
import { COLLECTIONS } from "./CollectionNames";
import { 
    admin, 
    db } from "../firestore";
import { Account } from "./Account";
import { GroceryListItem } from "./GroceryListItem";
import { FoodGlobal } from "./FoodGlobal";

@ObjectType()
export class GroceryList {
    @Field(type => ID)
    id!: string;

    @Field()
    account_id!: string;

    @Field()
    createdAt!: string;

    @Field()
    last_opened!: string;

    @Field()
    grocerylist_name!: string;

    @Field()
    description!: string;

    // An array of GroceryListItem objects.
    @Field(() => [GroceryListItem])
    grocery_list_items!: GroceryListItem[];

    @Field()
    isFamily!: boolean;

    @Field()
    isShared!: boolean;

    @Field()
    isComplete!: boolean;
}

@Resolver(GroceryList)
export class GroceryListResolver {
    
    /**
     * Retrieves all grocery lists.
     *
     * @returns An array of all GroceryList objects.
     */
    @Query(() => [GroceryList])
    async getAllGroceryLists(): Promise<GroceryList[]> {
        const snapshot = await db.collection(COLLECTIONS.GROCERYLIST).get();
        return snapshot.docs.map(doc => doc.data() as GroceryList);
    }

    /**
     * Retrieves all grocery lists associated with a specific account.
     *
     * @param account_id - The ID of the account.
     * @returns An array of GroceryList objects for the given account.
     */
    @Query(() => [GroceryList])
    async getGroceryListsForAccount(
        @Arg("account_id") account_id: string
    ): Promise<GroceryList[]> {
        const snapshot = await db.collection(COLLECTIONS.GROCERYLIST)
            .where("account_id", "==", account_id)
            .get();
        return snapshot.docs.map(doc => doc.data() as GroceryList);
    }

    /**
     * Retrieves a single grocery list by its ID.
     *
     * @param grocery_list_id - The ID of the grocery list.
     * @returns The GroceryList object if found; otherwise, null.
     */
    @Query(() => GroceryList, { nullable: true })
    async getGroceryListByID(
        @Arg("grocery_list_id") grocery_list_id: string
    ): Promise<GroceryList | null> {
        const snapshot = await db.collection(COLLECTIONS.GROCERYLIST)
            .where("id", "==", grocery_list_id)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        return snapshot.docs[0].data() as GroceryList;
    }

    /**
     * Creates a new grocery list for an account.
     *
     * This mutation creates a new GroceryList document and updates the associated Account document's
     * grocery_lists array with the new list's ID.
     *
     * @param account_id - The ID of the account.
     * @param grocerylist_name - The name of the new grocery list.
     * @returns The newly created GroceryList object.
     * @throws An error if the account does not exist.
     */
    @Mutation(() => GroceryList)
    async createGroceryList(
        @Arg("account_id") account_id: string,
        @Arg("grocerylist_name") grocerylist_name: string
    ): Promise<GroceryList> {
        const docRef = db.collection(COLLECTIONS.GROCERYLIST).doc();
        const now = new Date().toISOString();

        const newGroceryList: GroceryList = {
            id: docRef.id,
            account_id,
            createdAt: now,
            last_opened: now,
            grocerylist_name,
            description:
            "This is a brand new list. Update the description by clicking on this text field!",
            grocery_list_items: [], // Empty array of GroceryListItem
            isFamily: false,
            isShared: false,
            isComplete: false,
        };

        // Query for the account document using the account id.
        const accountSnapshot = await db
            .collection(COLLECTIONS.ACCOUNT)
            .where("id", "==", account_id)
            .limit(1)
            .get();

        if (accountSnapshot.empty) {
            throw new Error(`Account with id ${account_id} does not exist.`);
        }

        // Get the first matching document
        const accountDoc = accountSnapshot.docs[0];
        const accountData = accountDoc.data() as Account;

        // Update the account's grocery_lists array
        accountData.grocery_lists.push(docRef.id);
        await accountDoc.ref.update({ grocery_lists: accountData.grocery_lists });

        // Save the new grocery list document
        await docRef.set(newGroceryList);

        return newGroceryList;
    }

    /**
     * Deletes a grocery list by its ID.
     *
     * This mutation deletes the GroceryList document and also removes its ID from the associated Account's
     * grocery_lists array.
     *
     * @param grocerylist_id - The ID of the grocery list to delete.
     * @returns True if deletion was successful.
     * @throws An error if the grocery list does not exist.
     */
    @Mutation(() => Boolean)
    async deleteGroceryList(
        @Arg("grocerylist_id") grocerylist_id: string
    ): Promise<boolean> {
        const listRef = db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id);
        const listDoc = await listRef.get();

        if (!listDoc.exists) {
            throw new Error(`Grocery list with id ${grocerylist_id} does not exist.`);
        }

        const listData = listDoc.data() as GroceryList;

        // Delete the grocery list document.
        await listRef.delete();

        // Remove the grocery list ID from the associated Account's grocery_lists array.
        const accountSnapshot = await db
            .collection(COLLECTIONS.ACCOUNT)
            .where("id", "==", listData.account_id)
            .limit(1)
            .get();

        if (!accountSnapshot.empty) {
            const accountDoc = accountSnapshot.docs[0];
            const accountData = accountDoc.data() as Account;
            const updatedGroceryLists = accountData.grocery_lists.filter(
                (id) => id !== grocerylist_id
            );
            await accountDoc.ref.update({ grocery_lists: updatedGroceryLists });
        }

        return true;
    }

    /**
     * Updates the name of a grocery list.
     *
     * @param grocerylist_id - The ID of the grocery list to update.
     * @param grocerylist_name - The new name for the grocery list.
     * @returns The updated GroceryList object.
     */
    @Mutation(() => GroceryList)
    async updateGroceryListName(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("grocerylist_name") grocerylist_name: string
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ grocerylist_name });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    /**
     * Updates the description of a grocery list.
     *
     * @param grocerylist_id - The ID of the grocery list.
     * @param description - The new description for the grocery list.
     * @returns The updated GroceryList object.
     */
    @Mutation(() => GroceryList)
    async updateGroceryListDescription(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("description") description: string
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ description });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    /**
     * Updates the last opened timestamp of a grocery list.
     *
     * @param grocerylist_id - The ID of the grocery list.
     * @param last_opened - The new last opened timestamp (ISO string).
     * @returns The updated GroceryList object.
     */
    @Mutation(() => GroceryList)
    async updateGroceryListLastOpened(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("last_opened") last_opened: string
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ last_opened });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    /**
     * Updates the isFamily flag of a grocery list.
     *
     * @param grocerylist_id - The ID of the grocery list.
     * @param isFamily - The new boolean value for isFamily.
     * @returns The updated GroceryList object.
     */
    @Mutation(() => GroceryList)
    async updateGroceryListIsFamily(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("isFamily") isFamily: boolean
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ isFamily });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    /**
     * Updates the isShared flag of a grocery list.
     *
     * @param grocerylist_id - The ID of the grocery list.
     * @param isShared - The new boolean value for isShared.
     * @returns The updated GroceryList object.
     */
    @Mutation(() => GroceryList)
    async updateGroceryListIsShared(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("isShared") isShared: boolean
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ isShared });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    /**
     * Updates the isComplete flag of a grocery list.
     *
     * @param grocerylist_id - The ID of the grocery list.
     * @param isComplete - The new boolean value for isComplete.
     * @returns The updated GroceryList object.
     */
    @Mutation(() => GroceryList)
    async updateGroceryListIsComplete(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("isComplete") isComplete: boolean
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ isComplete });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    /**
     * Adds a new grocery list item to a specified grocery list.
     *
     * This mutation checks for the food item in the global food collection first. If not found,
     * it falls back to the account's custom items. A new GroceryListItem is created and added to the
     * grocery_list_items array.
     *
     * @param grocerylist_id - The ID of the grocery list.
     * @param account_id - The ID of the account (for custom items lookup).
     * @param food_global_id - The ID of the food item.
     * @param food_name - The name of the food item.
     * @returns True if the item is added successfully.
     * @throws An error if the food item is not found or if the grocery list document does not exist.
     */
    @Mutation(() => Boolean)
    async addGroceryListItem(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("account_id") account_id: string,
        @Arg("food_global_id") food_global_id: string,
        @Arg("food_name") food_name: string
    ): Promise<boolean> {
        let foodData: FoodGlobal | undefined;

        // Check in the global collection first.
        const foodGlobalDoc = await db.collection(COLLECTIONS.FOOD_GLOBAL).doc(food_global_id).get();
        if (foodGlobalDoc.exists) {
            foodData = foodGlobalDoc.data() as FoodGlobal;
        } else {
            // Fall back to the account's custom items if sys can't find it in the foodGlobal collection.
            const accountDoc = await db.collection(COLLECTIONS.ACCOUNT).doc(account_id).get();
            if (accountDoc.exists) {
            const accountData = accountDoc.data() as Account;
            foodData = accountData.custom_items.find(item => item.id === food_global_id);
            }
        }

        if (!foodData) {
            throw new Error(`Food item with id ${food_global_id} does not exist in either global or custom items.`);
        }

        // Generate a unique ID for the new GroceryListItem.
        const newItemId = db.collection(COLLECTIONS.GROCERYLIST).doc().id;

        const newItem: GroceryListItem = {
            id: newItemId,
            food_name,
            food_global_id,
            measurement: 'unit', // Default measurement; adjust as needed
            quantity: 1,
            isBought: false,
            description: foodData.description ?? "No description available",
            imageUrl: foodData.food_picture_url ?? "",
        };

        // Ensure the grocery list document exists.
        const groceryListRef = db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id);
        const groceryListDoc = await groceryListRef.get();
        if (!groceryListDoc.exists) {
            throw new Error(`Grocery list document with id ${grocerylist_id} does not exist.`);
        }

        // Add the new item to the grocery list using admin.firestore.FieldValue.arrayUnion.
        await groceryListRef.update({
            grocery_list_items: admin.firestore.FieldValue.arrayUnion(newItem)
        });

        return true;
    }

    /**
     * Deletes a grocery list item from a grocery list.
     *
     * @param grocerylist_id - The ID of the grocery list.
     * @param item_id - The ID of the grocery list item to delete.
     * @returns True if deletion was successful.
     * @throws An error if the grocery list does not exist.
     */
    @Mutation(() => Boolean)
    async deleteGroceryListItem(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("item_id") item_id: string
    ): Promise<boolean> {
        const listRef = db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id);
        const listDoc = await listRef.get();

        if (!listDoc.exists) {
            throw new Error(`Grocery list with id ${grocerylist_id} does not exist.`);
        }

        const listData = listDoc.data() as GroceryList;
        const updatedItems = listData.grocery_list_items.filter((item) => item.id !== item_id);
        await listRef.update({ grocery_list_items: updatedItems });
        return true;
    }

    /**
     * Updates the measurement of a specific grocery list item.
     *
     * @param grocerylist_id - The ID of the grocery list.
     * @param item_id - The ID of the grocery list item.
     * @param measurement - The new measurement value.
     * @returns True if the update was successful.
     * @throws An error if the grocery list does not exist or if grocery_list_items is not an array.
     */
    @Mutation(() => Boolean)
    async updateGroceryListItemMeasurement(
    @Arg("grocerylist_id") grocerylist_id: string,
    @Arg("item_id") item_id: string,
    @Arg("measurement") measurement: string
    ): Promise<boolean> {
    try {
        const listRef = db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id);
        const listDoc = await listRef.get();
        if (!listDoc.exists) {
        throw new Error(`Grocery list with id ${grocerylist_id} does not exist.`);
        }
        const listData = listDoc.data() as GroceryList;
        
        if (!Array.isArray(listData.grocery_list_items)) {
        throw new Error("grocery_list_items is not an array");
        }
        
        const updatedItems = listData.grocery_list_items.map(item => {
        if (item.id === item_id) {
            return { ...item, measurement };
        }
        return item;
        });
        
        await listRef.update({ grocery_list_items: updatedItems });
        return true;
    } catch (error) {
        console.error("Error updating grocery list item measurement:", error);
        return false;
    }
    }

    /**
     * Updates the quantity of a specific grocery list item.
     *
     * @param grocerylist_id - The ID of the grocery list.
     * @param item_id - The ID of the grocery list item.
     * @param quantity - The new quantity (integer).
     * @returns True if the update was successful.
     * @throws An error if the grocery list does not exist or if grocery_list_items is not an array.
     */
    @Mutation(() => Boolean)
    async updateGroceryListItemQuantity(
    @Arg("grocerylist_id") grocerylist_id: string,
    @Arg("item_id") item_id: string,
    @Arg("quantity", () => Int) quantity: number
    ): Promise<boolean> {
    try {
        const listRef = db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id);
        const listDoc = await listRef.get();
        if (!listDoc.exists) {
        throw new Error(`Grocery list with id ${grocerylist_id} does not exist.`);
        }
        const listData = listDoc.data() as GroceryList;

        if (!Array.isArray(listData.grocery_list_items)) {
        throw new Error("grocery_list_items is not an array");
        }

        const updatedItems = listData.grocery_list_items.map(item => {
        if (item.id === item_id) {
            return { ...item, quantity };
        }
        return item;
        });

        await listRef.update({ grocery_list_items: updatedItems });
        console.log("Successfully updated grocery list item quantity");
        return true;
        } catch (error) {
            console.error("Error updating grocery list item quantity:", error);
            return false;
        }
    }

    /**
     * Toggles the isBought flag for a specific grocery list item.
     *
     * @param grocerylist_id - The ID of the grocery list.
     * @param item_id - The ID of the grocery list item.
     * @returns True if the toggle was successful.
     * @throws An error if the grocery list does not exist or if grocery_list_items is not an array.
     */
    @Mutation(() => Boolean)
    async updateGroceryListItemIsBought(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("item_id") item_id: string
    ): Promise<boolean> {
    try {
        const listRef = db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id);
        const listDoc = await listRef.get();
        if (!listDoc.exists) {
        throw new Error(`Grocery list with id ${grocerylist_id} does not exist.`);
        }
        const listData = listDoc.data() as GroceryList;

        if (!Array.isArray(listData.grocery_list_items)) {
        throw new Error("grocery_list_items is not an array");
        }

        // Toggle isBought for the matching item
        const updatedItems = listData.grocery_list_items.map(item => {
        if (item.id === item_id) {
            return { ...item, isBought: !item.isBought };
        }
        return item;
        });

        await listRef.update({ grocery_list_items: updatedItems });
        return true;
        } catch (error) {
            console.error("Error toggling grocery list item isBought:", error);
            return false;
        }
    }

    /**
     * Searches grocery lists by a query/keyword.
     * The keyword is checked in the grocery list title, description, date fields (createdAt, last_opened),
     * and within the grocery list items (food_name and description).
     *
     * @param account_id - The ID of the account.
     * @param query - The search keyword.
     * @returns A list of grocery list IDs that match the search criteria.
     */
    @Query(() => [String])
    async searchGroceryLists(
        @Arg("account_id") account_id: string,
        @Arg("query") query: string
    ): Promise<string[]> {
        // Retrieve all grocery lists for the given account
        const snapshot = await db.collection(COLLECTIONS.GROCERYLIST)
            .where("account_id", "==", account_id)
            .get();

        const searchQuery = query.toLowerCase();
        const matchingListIds: string[] = [];

        snapshot.forEach(doc => {
            const list = doc.data() as GroceryList;
            // Check the title, description and date fields (createdAt and last_opened)
            const title = list.grocerylist_name.toLowerCase();
            const description = list.description.toLowerCase();
            const createdAt = list.createdAt.toLowerCase();
            const lastOpened = list.last_opened.toLowerCase();

            let matchFound = title.includes(searchQuery) ||
                            description.includes(searchQuery) ||
                            createdAt.includes(searchQuery) ||
                            lastOpened.includes(searchQuery);

            // If no match found, check within each grocery list item
            if (!matchFound && Array.isArray(list.grocery_list_items)) {
                for (const item of list.grocery_list_items) {
                    const foodName = item.food_name.toLowerCase();
                    const itemDescription = (item.description || "").toLowerCase();
                    if (foodName.includes(searchQuery) || itemDescription.includes(searchQuery)) {
                        matchFound = true;
                        break;
                    }
                }
            }

            // If a match was found in any field, add the grocery list ID to the result list.
            if (matchFound) {
                matchingListIds.push(list.id);
            }
        });

        return matchingListIds;
}
}
