import { Resolver, Query, Mutation, Arg, Field, ObjectType, ID, InputType, Int } from "type-graphql";
import { COLLECTIONS } from "./CollectionNames";
import { db } from "../firestore";
import { FoodAbstractResolver } from "./FoodAbstract";


/**
 * Computes the standard Levenshtein distance.
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
      }
    }
    return matrix[b.length][a.length];
  }
  
/**
 * Normalize a string into sorted tokens: lowercased, punctuation removed,
 * split on whitespace, sorted alphabetically, joined by spaces.
 */
function normalizeTokens(s: string): string {
return s
    .toLowerCase()
    .replace(/[^\w\s]/g, "")   // remove punctuation
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

/**
 * Token-sort Levenshtein: applies normalizeTokens then computes distance.
 */
function tokenSortLevenshtein(a: string, b: string): number {
const na = normalizeTokens(a);
const nb = normalizeTokens(b);
return levenshteinDistance(na, nb);
}

/**
 * Represents the macronutrient values for a food item.
 */
@ObjectType()
class Macronutrients {
    @Field()
    total_fat!: number;

    @Field()
    sat_fat!: number;

    @Field()
    trans_fat!: number;

    @Field()
    carbohydrate!: number;

    @Field()
    fiber!: number;

    @Field()
    total_sugars!: number;

    @Field()
    added_sugars!: number;

    @Field()
    protein!: number;
}

/**
 * Represents the micronutrient values for a food item.
 */
@ObjectType()
class Micronutrients {
    @Field()
    cholesterol!: number;

    @Field()
    sodium!: number;

    @Field()
    vitamin_d!: number;

    @Field()
    calcium!: number;

    @Field()
    iron!: number;

    @Field()
    potassium!: number;
}

/**
 * Input type for macronutrient values.
 *
 * Use this type when creating or updating a FoodGlobal item.
 */
export @InputType()
class MacronutrientsInput {
    @Field()
    total_fat!: number;

    @Field()
    sat_fat!: number;

    @Field()
    trans_fat!: number;

    @Field()
    carbohydrate!: number;

    @Field()
    fiber!: number;

    @Field()
    total_sugars!: number;

    @Field()
    added_sugars!: number;

    @Field()
    protein!: number;
}

/**
 * Input type for micronutrient values.
 *
 * Use this type when creating or updating a FoodGlobal item.
 */
export @InputType()
class MicronutrientsInput {
    @Field()
    cholesterol!: number;

    @Field()
    sodium!: number;

    @Field()
    vitamin_d!: number;

    @Field()
    calcium!: number;

    @Field()
    iron!: number;

    @Field()
    potassium!: number;
}

/**
 * Represents a global food item with nutritional information.
 */
@ObjectType()
export class FoodGlobal {
    @Field(type => ID)
    id!: string;

    @Field()
    food_name!: string;

    @Field()
    food_category!: string;

    @Field()
    food_picture_url!: string;

    @Field()
    amount_per_serving!: string;

    @Field()
    description!: string;

    @Field(() => Macronutrients)
    macronutrients!: Macronutrients;

    @Field(() => Micronutrients)
    micronutrients!: Micronutrients;
}

/**
 * Resolver for FoodGlobal operations.
 *
 * Provides queries to retrieve FoodGlobal items and mutations to create, update, or delete them.
 */
@Resolver(FoodGlobal)
export class FoodGlobalResolver {
    /**
     * Retrieves all FoodGlobal items.
     *
     * @returns An array of FoodGlobal items.
     */
    @Query(() => [FoodGlobal])
    async getAllFoodGlobal(): Promise<FoodGlobal[]> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_GLOBAL).get();
        return snapshot.docs.map(doc => doc.data() as FoodGlobal);
    }

    /**
     * Retrieves a FoodGlobal item by its food name.
     *
     * @param food_name - The name of the food item to search for.
     * @returns The matching FoodGlobal item or null if not found.
     */
    @Query(() => FoodGlobal, { nullable: true })
    async getFoodGlobalByFoodName(
        @Arg("food_name") food_name: string
    ): Promise<FoodGlobal | null> {
        const snapshot = await db
            .collection(COLLECTIONS.FOOD_GLOBAL)
            .where("food_name", "==", food_name)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        return snapshot.docs[0].data() as FoodGlobal;
    }

    /**
     * Retrieves a FoodGlobal item by its ID.
     *
     * @param food_global_id - The unique ID of the FoodGlobal item.
     * @returns The matching FoodGlobal item or null if not found.
     */
    @Query(() => FoodGlobal, { nullable: true })
    async getFoodGlobalById(
        @Arg("food_global_id") food_global_id: string
    ): Promise<FoodGlobal | null> {
        const doc = await db.collection(COLLECTIONS.FOOD_GLOBAL).doc(food_global_id).get();
        if (!doc.exists) {
            return null;
        }
        return doc.data() as FoodGlobal;
    }

    /**
     * Creates a new FoodGlobal item.
     *
     * This mutation first checks if a FoodGlobal item with the given name exists.
     * If not, it creates a new FoodGlobal document with the provided nutritional details.
     *
     * @param food_name - The name of the food.
     * @param food_category - The category of the food.
     * @param food_picture_url - The URL of the food's image.
     * @param amount_per_serving - The serving size information.
     * @param description - A description of the food.
     * @param macronutrients - Macronutrient values provided as input.
     * @param micronutrients - Micronutrient values provided as input.
     * @returns The newly created FoodGlobal item.
     * @throws An error if a FoodGlobal with the same name already exists.
     */
    @Mutation(() => FoodGlobal)
    async createFoodGlobal(
        @Arg("food_name") food_name: string,
        @Arg("food_category") food_category: string,
        @Arg("food_picture_url") food_picture_url: string,
        @Arg("amount_per_serving") amount_per_serving: string,
        @Arg("description") description: string,
        @Arg("macronutrients", () => MacronutrientsInput) macronutrients: MacronutrientsInput,
        @Arg("micronutrients", () => MicronutrientsInput) micronutrients: MicronutrientsInput
    ): Promise<FoodGlobal> {
        // Check if an existing FoodGlobal with the given name exists
        const existingFoodGlobal = await this.getFoodGlobalByFoodName(food_name);
        if (existingFoodGlobal != null) {
            throw new Error(`A FoodGlobal item with the name "${food_name}" already exists.`);
        }

        const plainMacronutrients = JSON.parse(JSON.stringify(macronutrients));
        const plainMicronutrients = JSON.parse(JSON.stringify(micronutrients));

        // Explicitly type newFoodGlobal as FoodGlobal (include a placeholder for id)
        const newFoodGlobal: FoodGlobal = {
            id: "", // temporary; will be set below
            food_name,
            food_category,
            food_picture_url,
            amount_per_serving,
            description,
            macronutrients: plainMacronutrients,
            micronutrients: plainMicronutrients,
        };

        // Generate a new document reference and assign its id.
        const docRef = db.collection(COLLECTIONS.FOOD_GLOBAL).doc();
        newFoodGlobal.id = docRef.id;
        // Use set() to store the document including the id field
        await docRef.set(newFoodGlobal);
        return newFoodGlobal;
    }

    /**
     * Updates fields of an existing FoodGlobal item.
     *
     * Only the provided fields are updated; if a field is not provided, its current value is retained.
     *
     * @param food_global_id - The unique ID of the FoodGlobal item to update.
     * @param food_name - (Optional) The new name for the food.
     * @param food_category - (Optional) The new category.
     * @param food_picture_url - (Optional) The new picture URL.
     * @param amount_per_serving - (Optional) The new serving size information.
     * @param description - (Optional) The new description.
     * @param macronutrients - (Optional) Updated macronutrient values.
     * @param micronutrients - (Optional) Updated micronutrient values.
     * @returns The updated FoodGlobal item.
     * @throws An error if the FoodGlobal item does not exist.
     */
    @Mutation(() => FoodGlobal)
    async updateFoodGlobal(
        @Arg("food_global_id") food_global_id: string,
        @Arg("food_name", { nullable: true }) food_name?: string,
        @Arg("food_category", { nullable: true }) food_category?: string,
        @Arg("food_picture_url", { nullable: true }) food_picture_url?: string,
        @Arg("amount_per_serving", { nullable: true }) amount_per_serving?: string,
        @Arg("description", { nullable: true }) description?: string,
        @Arg("macronutrients", () => MacronutrientsInput, { nullable: true }) macronutrients?: MacronutrientsInput,
        @Arg("micronutrients", () => MicronutrientsInput, { nullable: true }) micronutrients?: MicronutrientsInput
    ): Promise<FoodGlobal> {
        const foodGlobalRef = db.collection(COLLECTIONS.FOOD_GLOBAL).doc(food_global_id);
        const doc = await foodGlobalRef.get();
        if (!doc.exists) {
            throw new Error(`FoodGlobal with id ${food_global_id} does not exist.`);
        }
        const currentData = doc.data() as FoodGlobal;
        const updatedData = {
            food_name: food_name ?? currentData.food_name,
            food_category: food_category ?? currentData.food_category,
            food_picture_url: food_picture_url ?? currentData.food_picture_url,
            amount_per_serving: amount_per_serving ?? currentData.amount_per_serving,
            description: description ?? currentData.description,
            macronutrients: macronutrients ?? currentData.macronutrients,
            micronutrients: micronutrients ?? currentData.micronutrients,
        };
        await foodGlobalRef.update(updatedData);
        const updatedDoc = await foodGlobalRef.get();
        return updatedDoc.data() as FoodGlobal;
    }

    /**
     * Deletes a FoodGlobal item by its ID.
     *
     * Before deleting, this mutation also removes any associated FoodAbstract items.
     *
     * @param food_global_id - The ID of the FoodGlobal item to delete.
     * @returns True if deletion was successful.
     */
    @Mutation(() => Boolean)
    async deleteFoodGlobal(
        @Arg("food_global_id") food_global_id: string
    ): Promise<boolean> {
        const foodGlobalRef = db.collection(COLLECTIONS.FOOD_GLOBAL).doc(food_global_id);

        // Instantiate a FoodAbstractResolver to handle cascading deletion.
        const foodAbstractResolver = new FoodAbstractResolver();
        // Retrieve all FoodAbstract items associated with this FoodGlobal.
        const foodAbstractSnapshot = await db
            .collection(COLLECTIONS.FOOD_ABSTRACT)
            .where("food_global_id", "==", food_global_id)
            .get();

        // Delete each associated FoodAbstract item.
        for (const doc of foodAbstractSnapshot.docs) {
            await foodAbstractResolver.deleteFoodAbstract(doc.id);
        }

        // Delete the FoodGlobal
        await foodGlobalRef.delete();

        return true;
    }

    /**
     * Searches FoodGlobal items by food_name.
     * Returns all FoodGlobal items where the food_name contains the search query.
     *
     * @param query - The search keyword.
     * @returns An array of matching FoodGlobal items.
     */
    @Query(() => [FoodGlobal])
    async searchFoodGlobalByFoodName(
        @Arg("query") query: string
    ): Promise<FoodGlobal[]> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_GLOBAL).get();
        const searchQuery = query.toLowerCase();
        const matchingFoods: FoodGlobal[] = [];

        snapshot.forEach(doc => {
            const food = doc.data() as FoodGlobal;
            if (food.food_name.toLowerCase().includes(searchQuery)) {
                matchingFoods.push(food);
            }
        });

        return matchingFoods;
    }

    /**
     * Finds the IDs of the top N FoodGlobal items whose names are closest
     * to the searchName, using token-sort Levenshtein distance.
     */
    @Query(() => [FoodGlobal])
    async getClosestFoodGlobal(
        @Arg("searchName") searchName: string,
        @Arg("topN",   () => Int, { nullable: true }) topN: number = 3
    ): Promise<FoodGlobal[]> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_GLOBAL).get();

        // build array of { food, distance }
        const scored = snapshot.docs.map(doc => {
            const food = doc.data() as FoodGlobal;
            return {
            food,
            distance: tokenSortLevenshtein(food.food_name, searchName),
            };
        });

        // sort and take top N
        scored.sort((a, b) => a.distance - b.distance);
        return scored.slice(0, topN).map(pair => pair.food);
    }

}
