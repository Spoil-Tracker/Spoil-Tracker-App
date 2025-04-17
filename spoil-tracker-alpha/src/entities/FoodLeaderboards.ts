import {Resolver, Query, Mutation, Arg, Field, ObjectType, ID, InputType, Int } from "type-graphql"
import { COLLECTIONS } from "./CollectionNames"
import { db } from "../firestore"


/**
 * Record of an account's interaction with a single food_global item
 */

@ObjectType()
class AccountRecords {
    @Field()
    account_id!: string;

    @Field()
    times_bought!: number;

    @Field()
    times_eaten!: number;

    @Field()
    times_tossed!: number;
}

@ObjectType()
export class FoodLeaderboard {
    @Field(type => ID)
    id!: string;

    @Field()
    food_global_id!: string;

    @Field()
    total_times_bought!: number;

    @Field()
    total_times_eaten!: number;

    @Field()
    total_times_tossed!: number;

    @Field(() => [AccountRecords])
    account_record_items!: AccountRecords[];
}


@Resolver(FoodLeaderboard)
export class FoodLeaderboardResolver {
    /**
     * Retrieves all FoodLeaderboard items
     * 
     * @returns An array of FoodLeaderboard items
     */
    @Query(() => [FoodLeaderboard])
    async getAllFoodLeaderboard(): Promise<FoodLeaderboard[]> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_LEADERBOARD).get();
        return snapshot.docs.map(doc => doc.data() as FoodLeaderboard);
    }

    /**
     * Retrieves a FoodLeaderboard item by its food name.
     *
     * @param food_global_ID - The name of the food item to search for.
     * @returns The matching FoodLeaderboard item or null if not found.
     */
    @Query(() => FoodLeaderboard, {nullable: true})
    async getFoodLeaderboardbyFoodID(
        @Arg("food_global_id") food_global_id: string
    ): Promise<FoodLeaderboard | null> {
        const snapshot = await db
            .collection(COLLECTIONS.FOOD_LEADERBOARD)
            .where("food_global_id", "==", food_global_id)
            .limit(1)
            .get();
        
        //If there is no record of this ID, return null
        if(snapshot.empty) {
            return null;
        }
        return snapshot.docs[0].data() as FoodLeaderboard;
    }

    /**
     * HELPER FUNCTION DO NOT CALL DIRECTLY
     * FoodLeaderboard items are created automatically when incremented
     * Creates a new FoodLeaderboard item.
     * 
     * Checks if there already is a FoodLeaderboard item. if so then throws an error
     * 
     * @param food_global_ID
     * @returns (string) Document ID of the newly created FoodLeaderboard item
     * @throws Error if a FoodLeaderboard item already exists for this food_global_ID
     */
    @Mutation(() => FoodLeaderboard)
    async createFoodLeaderboard(
        @Arg("food_global_id") food_global_id: string 
    ): Promise<string> {
        //Check to see an existing FoodLeaderboard with this food id exists
        const existingFoodLeaderboard = await this.getFoodLeaderboardbyFoodID(food_global_id);
        if (existingFoodLeaderboard != null) {
            throw new Error(`A FoodLeaderboard item for the FoodGlobal ID "${food_global_id}" already exists.`);
        }

        //Pre-generate a firestore document ref with an auto generated ID
        const docRef = db.collection(COLLECTIONS.FOOD_LEADERBOARD).doc();
        const newFoodLeaderboard: FoodLeaderboard = {
            id: docRef.id,
            food_global_id,
            total_times_bought: 0,
            total_times_eaten: 0,
            total_times_tossed: 0,
            account_record_items: []
        };

        await docRef.set(newFoodLeaderboard);
        return docRef.id as string;
    }

    /**
     * HELPER FUNCTION
     * Edits a FoodLeaderboard document, changing both the subdocument related to accounts, and "total_x" values
     * If a FoodLeaderboard document does not exist when this function is called, it will create one.
     * 
     * @param food_global_id 
     * @param account_id 
     * @param bought_change: Amount to change times_bought and total_times_bought
     * @param eaten_change: Amount to change times_eaten and total_times_eaten
     * @param thrown_change: Amount to change times_thrown and total_times_thrown
     * @returns The edited FoodLeaderboard
     * @throws An error if the documents associated with food_global_id or account_id don't exist
     */
    @Mutation(() => FoodLeaderboard)
    async editFoodLeaderboard(
        @Arg("food_global_id") food_global_id: string,
        @Arg("account_id") account_id: string,
        @Arg("bought_change") bought_change: number,
        @Arg("eaten_change") eaten_change: number,
        @Arg("tossed_change") tossed_change: number
    ): Promise<FoodLeaderboard> {

        //Throw an error if the Account corresponding to account_id does not exist
        const accountSnapshot = await db.collection(COLLECTIONS.ACCOUNT)
            .where("id", "==", account_id)
            .limit(1)
            .get();
        if (accountSnapshot.empty) {
            throw new Error(`Account with id ${account_id} does not exist.`);
        }

        //Throw an error if the FoodGlobal corresponding to food_global_id does not exist
        const foodGlobalSnapshot = await db.collection(COLLECTIONS.FOOD_GLOBAL)
            .where("id", "==", food_global_id)
            .limit(1)
            .get();
        if (foodGlobalSnapshot.empty) {
            throw new Error(`FoodGlobal with id ${food_global_id} does not exist`);
        }

        //Create a new FoodLeaderboard if one does not exist
        var docID = "";
        const FoodLeaderboardSnapshot = await db.collection(COLLECTIONS.FOOD_LEADERBOARD)
            .where("food_global_id", "==", food_global_id)
            .limit(1)
            .get();
        if(FoodLeaderboardSnapshot.empty) {
            docID = await this.createFoodLeaderboard(food_global_id);
        }
        else {
            docID = FoodLeaderboardSnapshot.docs[0].data().id;
        }

        const FoodLeaderboardDocRef = db.collection(COLLECTIONS.FOOD_LEADERBOARD).doc(docID);
        const FoodLeaderboardDoc = (await FoodLeaderboardDocRef.get()).data() as FoodLeaderboard;

        //Update all "total_x" values
        FoodLeaderboardDoc.total_times_bought += bought_change;
        FoodLeaderboardDoc.total_times_eaten += eaten_change;
        FoodLeaderboardDoc.total_times_tossed += tossed_change;

        //Update AccountRecords
        //If an AccountRecord does not exist, create one
        const indexOfAccount = FoodLeaderboardDoc.account_record_items.findIndex(x => x.account_id === account_id);
        if(indexOfAccount == -1) {
            var blankAccountRecord: AccountRecords = {
                account_id,
                times_bought: bought_change,
                times_eaten: eaten_change,
                times_tossed: tossed_change
            };
            FoodLeaderboardDoc.account_record_items.push(blankAccountRecord);
        }
        else{
            FoodLeaderboardDoc.account_record_items[indexOfAccount].times_bought += bought_change;
            FoodLeaderboardDoc.account_record_items[indexOfAccount].times_eaten += eaten_change;
            FoodLeaderboardDoc.account_record_items[indexOfAccount].times_tossed += tossed_change;
        }

        //All edits complete
        //Update with changes
        await FoodLeaderboardDocRef.set(FoodLeaderboardDoc);
        return FoodLeaderboardDoc;
    }

    /**
     * Increments total_times_bought and times_eaten by one
     * 
     * @param food_global_id 
     * @param account_id 
     * @returns FoodLeaderboard that was changed
     */
    @Mutation(() => FoodLeaderboard)
    async incrementBought(
        @Arg("food_global_id") food_global_id: string,
        @Arg("account_id") account_id: string
    ): Promise<FoodLeaderboard> {
        return await this.editFoodLeaderboard(food_global_id, account_id, 0, 1, 0);
    }

    /**
     * Decrements total_times_bought and times_bought by one
     *
     * @param food_global_id
     * @param account_id
     * @returns FoodLeaderboard that was changed
     */
    @Mutation(() => FoodLeaderboard)
    async decrementBought(
        @Arg("food_global_id") food_global_id: string,
        @Arg("account_id") account_id: string
    ): Promise<FoodLeaderboard> {
        return await this.editFoodLeaderboard(food_global_id, account_id, -1, 0, 0);
    }

    /**
     * Increments total_times_eaten and times_eaten by one
     * 
     * @param food_global_id 
     * @param account_id 
     * @returns FoodLeaderboad that was changed
     */
    @Mutation(() => FoodLeaderboard)
    async incrementEaten(
        @Arg("food_global_id") food_global_id: string,
        @Arg("account_id") account_id: string
    ): Promise<FoodLeaderboard> {
        return await this.editFoodLeaderboard(food_global_id, account_id, 1, 0, 0);
    }

    /**
     * Increments total_times_eaten and times_eaten by one
     * 
     * @param food_global_id 
     * @param account_id 
     * @returns FoodLeaderboad that was changed
     */
    @Mutation(() => FoodLeaderboard)
    async incrementThrown(
        @Arg("food_global_id") food_global_id: string,
        @Arg("account_id") account_id: string
    ): Promise<FoodLeaderboard> {
        return await this.editFoodLeaderboard(food_global_id, account_id, 0, 0, 1);
    }

    /**
     * Returns the sum of total_times_bought across all leaderboard entries.
     */
    @Query(() => Int)
    async getTotalTimesBought(): Promise<number> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_LEADERBOARD).get();
        return snapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().total_times_bought || 0),
        0
        );
    }

    /**
     * Returns the sum of total_times_eaten across all leaderboard entries.
     */
    @Query(() => Int)
    async getTotalTimesEaten(): Promise<number> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_LEADERBOARD).get();
        return snapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().total_times_eaten || 0),
        0
        );
    }

    /**
     * Returns the sum of total_times_tossed across all leaderboard entries.
     */
    @Query(() => Int)
    async getTotalTimesTossed(): Promise<number> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_LEADERBOARD).get();
        return snapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().total_times_tossed || 0),
        0
        );
    }
}