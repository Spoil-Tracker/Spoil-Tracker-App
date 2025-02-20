import { 
    Resolver, 
    Query, 
    Mutation, 
    Arg, 
    Field, 
    ObjectType, 
    ID } from "type-graphql";
import { COLLECTIONS } from "./CollectionNames";
import { 
    admin, 
    db } from "../firestore";
import { Account } from "./Account";
import { GroceryListItem } from "./GroceryListItem";

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

    // Now an array of GroceryListItem objects rather than strings
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
    
    @Query(() => [GroceryList])
    async getAllGroceryLists(): Promise<GroceryList[]> {
        const snapshot = await db.collection(COLLECTIONS.GROCERYLIST).get();
        return snapshot.docs.map(doc => doc.data() as GroceryList);
    }

    @Query(() => [GroceryList])
    async getGroceryListsForAccount(
        @Arg("account_id") account_id: string
    ): Promise<GroceryList[]> {
        const snapshot = await db.collection(COLLECTIONS.GROCERYLIST)
            .where("account_id", "==", account_id)
            .get();
        return snapshot.docs.map(doc => doc.data() as GroceryList);
    }

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

        await listRef.delete();

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

    @Mutation(() => GroceryList)
    async updateGroceryListName(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("grocerylist_name") grocerylist_name: string
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ grocerylist_name });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListDescription(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("description") description: string
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ description });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListLastOpened(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("last_opened") last_opened: string
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ last_opened });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListIsFamily(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("isFamily") isFamily: boolean
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ isFamily });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListIsShared(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("isShared") isShared: boolean
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ isShared });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListIsComplete(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("isComplete") isComplete: boolean
    ): Promise<GroceryList> {
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({ isComplete });
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    // Mutation to add a GroceryListItem to the grocery_list_items array.
    @Mutation(() => Boolean)
    async addGroceryListItem(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("food_global_id") food_global_id: string,
        @Arg("food_name") food_name: string,
    ): Promise<boolean> {
        // Check that the FoodGlobal item exists
        const foodGlobalDoc = await db.collection(COLLECTIONS.FOOD_GLOBAL).doc(food_global_id).get();
        if (!foodGlobalDoc.exists) {
            throw new Error(`FoodGlobal with id ${food_global_id} does not exist.`);
        }

        // Generate a unique ID for the new embedded GroceryListItem.
        const newItemId = db.collection(COLLECTIONS.GROCERYLIST).doc().id;

        const newItem: GroceryListItem = {
            id: newItemId,
            food_name,
            food_global_id,
            measurement: 'unit',
            quantity: 1,
            isBought: false,
        };

        // Add the new item to the grocery_list_items array using arrayUnion.
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({
            grocery_list_items: admin.firestore.FieldValue.arrayUnion(newItem)
        });

        return true;
    }

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

    // Mutation to update the measurement field of a specific embedded grocery list item
    @Mutation(() => GroceryList)
    async updateGroceryListItemMeasurement(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("item_id") item_id: string,
        @Arg("measurement") measurement: string
    ): Promise<GroceryList> {
        const listRef = db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id);
        const listDoc = await listRef.get();
        if (!listDoc.exists) {
            throw new Error(`Grocery list with id ${grocerylist_id} does not exist.`);
        }
        const listData = listDoc.data() as GroceryList;
        const updatedItems = listData.grocery_list_items.map(item => {
        if (item.id === item_id) {
            return { ...item, measurement };
        }
        return item;
        });
        await listRef.update({ grocery_list_items: updatedItems });
        const updatedDoc = await listRef.get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListItemQuantity(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("item_id") item_id: string,
        @Arg("quantity") quantity: number
    ): Promise<GroceryList> {
        const listRef = db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id);
        const listDoc = await listRef.get();
        if (!listDoc.exists) {
            throw new Error(`Grocery list with id ${grocerylist_id} does not exist.`);
        }
        const listData = listDoc.data() as GroceryList;
        const updatedItems = listData.grocery_list_items.map(item => {
            if (item.id === item_id) {
                return { ...item, quantity };
            }
            return item;
        });
        await listRef.update({ grocery_list_items: updatedItems });
        const updatedDoc = await listRef.get();
        return updatedDoc.data() as GroceryList;
    }
}
