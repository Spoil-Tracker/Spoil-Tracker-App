import {Resolver, Query, Mutation, Arg, Field, ObjectType, ID} from "type-graphql";
import { COLLECTIONS } from "./CollectionNames";
import db from "../firestore";
import { Pantry } from "./Pantry";

@ObjectType()
export class FoodConcrete {
    @Field(type => ID)
    id!: string;

    @Field()
    pantry_id!: string;

    @Field()
    food_abstract_id!: string;

    @Field()
    expiration_date!: string;

    @Field()
    quantity!: number;

    @Field()
    quantity_type!: string;
}

@Resolver(FoodConcrete)
export class FoodConcreteResolver {

    @Query(() => [FoodConcrete])
    async getAllFoodConcrete(): Promise<FoodConcrete[]> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_GLOBAL).get();
        return snapshot.docs.map(doc => doc.data() as FoodConcrete);
    }

    @Query(() => [FoodConcrete])
    async getAllFoodConcreteInPantry(
        @Arg("pantry_id") pantry_id: string
    ): Promise<FoodConcrete[]> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_CONCRETE)
            .where("pantry_id", "==", pantry_id)
            .get();
        
        return snapshot.docs.map(doc => doc.data() as FoodConcrete);
    }

    @Mutation(() => FoodConcrete)
    async createFoodConcrete(
        @Arg("pantry_id") pantry_id: string,
        @Arg("food_abstract_id") food_abstract_id: string,
        @Arg("expiration_date") expiration_date: string,
        @Arg("quantity") quantity: number,
        @Arg("quantity_type") quantity_type: string
    ): Promise<FoodConcrete> {
        //Having multiple FoodConcretes of the same item in the same pantry is okay

        //Get a doc ID for this document
        const docRef = db.collection(COLLECTIONS.FOOD_CONCRETE).doc();

        const newFoodConcrete: FoodConcrete = {
            id: docRef.id,
            pantry_id,
            food_abstract_id,
            expiration_date,
            quantity,
            quantity_type
        }

        //Update the Pantry associated with this FoodConcrete
        const pantryRef = db.collection(COLLECTIONS.PANTRY).doc(pantry_id);
        const pantryDoc = await pantryRef.get();

        if (!pantryDoc.exists) {
            throw new Error(`Pantry with ID ${pantry_id} does not exist.`);
        }

        const pantryData = pantryDoc.data() as Pantry;
        pantryData.food_concrete_items.push(docRef.id);

        //Save pantry update
        await pantryRef.update({ food_concrete_items: pantryData.food_concrete_items})

        //Save new FoodConcrete
        await docRef.set(newFoodConcrete);

        return newFoodConcrete;
    }

    @Mutation(() => FoodConcrete)
    async updateQuantity(
        @Arg("food_concrete_id") food_concrete_id: string,
        @Arg("quantity") quantity: number,
        @Arg("quantity_type") quantity_type: string
    ): Promise<FoodConcrete> {
        //Perform update
        await db.collection(COLLECTIONS.FOOD_CONCRETE)
            .doc(food_concrete_id)
            .update({ quantity, quantity_type});

        //Return updated document
        const foodConcreteDoc = await db.collection(COLLECTIONS.FOOD_CONCRETE).doc(food_concrete_id).get();
        return foodConcreteDoc.data() as FoodConcrete;
    }

    @Mutation(() => Boolean)
    async deleteFoodConcrete(
        @Arg("food_concrete_id") food_concrete_id: string
    ): Promise<boolean> {
        const foodConcreteRef = db.collection(COLLECTIONS.FOOD_CONCRETE).doc(food_concrete_id);

        await foodConcreteRef.delete();

        return true;
    }
}