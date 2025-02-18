import {Resolver, Query, Mutation, Arg, Field, ObjectType, ID} from "type-graphql";
import { COLLECTIONS } from "./CollectionNames";
import { admin, db } from "../firestore";
import { Account } from "./Account";

@ObjectType()
export class GroceryList {
    @Field(type => ID)
    id!: string;

    @Field()
    owner_id!: string;

    @Field()
    createdAt!: string;

    @Field()
    last_opened!: string;

    @Field()
    grocerylist_name!: string;

    @Field()
    description!: string;

    @Field(type => [String])
    food_global_items!: string[];
    
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
        @Arg("owner_id") owner_id: string
    ): Promise<GroceryList[]> {
        const snapshot = await db.collection(COLLECTIONS.GROCERYLIST)
            .where("owner_id", "==", owner_id)
            .get();
        return snapshot.docs.map(doc => doc.data() as GroceryList);
    }

    @Mutation(() => GroceryList)
    async createGroceryList(
        @Arg("owner_id") owner_id: string,
        @Arg("grocerylist_name") grocerylist_name: string,
    ): Promise<GroceryList> {
        const docRef = db.collection(COLLECTIONS.GROCERYLIST).doc();
        const now = new Date().toISOString();

        const newGroceryList: GroceryList = {
            id: docRef.id,
            owner_id,
            createdAt: now,
            last_opened: now,
            grocerylist_name,
            description: 
            "This is a brand new list. Update \
            the description by clicking on this \
            text field!",
            food_global_items: [],
            isFamily: false,
            isShared: false,
            isComplete: false,
        };

        // Query for the account document where owner_id equals the provided owner_id.
        const accountSnapshot = await db
            .collection(COLLECTIONS.ACCOUNT)
            .where("owner_id", "==", owner_id)
            .limit(1)
            .get();

        if (accountSnapshot.empty) {
            throw new Error(`Account with owner_id ${owner_id} does not exist.`);
        }

        // Get the first matching document
        const accountDoc = accountSnapshot.docs[0];
        const accountData = accountDoc.data() as Account;

        // Update the grocery_lists array
        accountData.grocery_lists.push(docRef.id);

        // Use the document reference from the snapshot to update the account
        await accountDoc.ref.update({ grocery_lists: accountData.grocery_lists });

        // Save the new grocery list document
        await docRef.set(newGroceryList);

        return newGroceryList;
    }


    @Mutation(() => GroceryList)
    async updateGroceryListName(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("grocerylist_name") grocerylist_name: string,
    ): Promise<GroceryList> {
        await db.collection("GroceryLists").doc(grocerylist_id).update({ grocerylist_name });
        const updatedDoc = await db.collection("GroceryLists").doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListDescription(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("description") description: string,
    ): Promise<GroceryList> {
        await db.collection("GroceryLists").doc(grocerylist_id).update({ description });
        const updatedDoc = await db.collection("GroceryLists").doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListLastOpened(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("last_opened") last_opened: string,
    ): Promise<GroceryList> {
        await db.collection("GroceryLists").doc(grocerylist_id).update({ last_opened });
        const updatedDoc = await db.collection("GroceryLists").doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateFoodGlobalItems(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("food_global_items", () => [String]) food_global_items: string[],
    ): Promise<GroceryList> {
        await db.collection("GroceryLists").doc(grocerylist_id).update({ food_global_items });
        const updatedDoc = await db.collection("GroceryLists").doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListIsFamily(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("isFamily") isFamily: boolean,
    ): Promise<GroceryList> {
        await db.collection("GroceryLists").doc(grocerylist_id).update({ isFamily });
        const updatedDoc = await db.collection("GroceryLists").doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListIsShared(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("isShared") isShared: boolean,
    ): Promise<GroceryList> {
        await db.collection("GroceryLists").doc(grocerylist_id).update({ isShared });
        const updatedDoc = await db.collection("GroceryLists").doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async updateGroceryListIsComplete(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("isComplete") isComplete: boolean,
    ): Promise<GroceryList> {
        await db.collection("GroceryLists").doc(grocerylist_id).update({ isComplete });
        const updatedDoc = await db.collection("GroceryLists").doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }

    @Mutation(() => GroceryList)
    async addFoodGlobalToGroceryList(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("food_global_id") food_global_id: string
    ): Promise<GroceryList> {
        // Optional: Check that the FoodGlobal item exists
        const foodGlobalDoc = await db.collection(COLLECTIONS.FOOD_GLOBAL).doc(food_global_id).get();
        if (!foodGlobalDoc.exists) {
            throw new Error(`FoodGlobal with id ${food_global_id} does not exist.`);
        }
        
        // Use Firestore's arrayUnion to add the food_global_id to the food_global_items array
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({
            food_global_items: admin.firestore.FieldValue.arrayUnion(food_global_id)
        });
        
        // Return the updated GroceryList
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }
    
    @Mutation(() => GroceryList)
    async removeFoodGlobalFromGroceryList(
        @Arg("grocerylist_id") grocerylist_id: string,
        @Arg("food_global_id") food_global_id: string
    ): Promise<GroceryList> {
        // Optional: Validate that the FoodGlobal document exists.
        const foodGlobalDoc = await db.collection(COLLECTIONS.FOOD_GLOBAL).doc(food_global_id).get();
        if (!foodGlobalDoc.exists) {
            throw new Error(`FoodGlobal with id ${food_global_id} does not exist.`);
        }
        
        // Atomically remove the food_global_id from the food_global_items array
        await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).update({
            food_global_items: admin.firestore.FieldValue.arrayRemove(food_global_id),
        });
        
        // Return the updated GroceryList document
        const updatedDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocerylist_id).get();
        return updatedDoc.data() as GroceryList;
    }
}

