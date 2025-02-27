import { Resolver, Query, Mutation, Arg, Field, ObjectType, ID, InputType } from "type-graphql";
import { COLLECTIONS } from "./CollectionNames";
import db  from "../firestore";
import { FoodAbstractResolver } from "./FoodAbstract";

// New object types for nutrients

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

// Input types for mutations

@InputType()
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

@InputType()
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

@Resolver(FoodGlobal)
export class FoodGlobalResolver {
    @Query(() => [FoodGlobal])
    async getAllFoodGlobal(): Promise<FoodGlobal[]> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_GLOBAL).get();
        return snapshot.docs.map(doc => doc.data() as FoodGlobal);
    }

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

    // New Query: Get FoodGlobal by its ID
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

        const docRef = db.collection(COLLECTIONS.FOOD_GLOBAL).doc();
        newFoodGlobal.id = docRef.id;
        // Use set() to store the document including the id field
        await docRef.set(newFoodGlobal);
        return newFoodGlobal;
    }


    // New Mutation: Update FoodGlobal fields
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

    @Mutation(() => Boolean)
    async deleteFoodGlobal(
        @Arg("food_global_id") food_global_id: string
    ): Promise<boolean> {
        const foodGlobalRef = db.collection(COLLECTIONS.FOOD_GLOBAL).doc(food_global_id);

        // Delete associated Abstract Food items (cascades down to Concrete Food items)
        const foodAbstractResolver = new FoodAbstractResolver();
        const foodAbstractSnapshot = await db
            .collection(COLLECTIONS.FOOD_ABSTRACT)
            .where("food_global_id", "==", food_global_id)
            .get();

        for (const doc of foodAbstractSnapshot.docs) {
            await foodAbstractResolver.deleteFoodAbstract(doc.id);
        }

        // Delete the FoodGlobal
        await foodGlobalRef.delete();

        return true;
    }
}
