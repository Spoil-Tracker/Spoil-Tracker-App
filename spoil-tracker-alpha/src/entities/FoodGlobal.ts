import {Resolver, Query, Mutation, Arg, Field, ObjectType, ID} from "type-graphql";
import { COLLECTIONS } from "./CollectionNames";
import db from "../firestore";
import { FoodAbstractResolver } from "./FoodAbstract";

@ObjectType()
export class FoodGlobal {
    @Field(type => ID)
    id!: string;
    
    @Field()
    food_name!: string;                 //PK

    @Field()
    food_category!: string;

    @Field()
    food_picture_url!: string;
}

@Resolver(FoodGlobal)
export class FoodGlobalResolver {

    @Query(() => [FoodGlobal])
    async getAllFoodGlobal(): Promise<FoodGlobal[]> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_GLOBAL).get();
        return snapshot.docs.map(doc => doc.data() as FoodGlobal);
    }

    @Query(() => FoodGlobal, {nullable: true})
    async getFoodGlobalbyFoodName (
        @Arg("food_name") food_name: string
    ): Promise<FoodGlobal | null> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_GLOBAL)
            .where("food_name", "==", food_name)
            .limit(1)
            .get();
        
        if(snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data() as FoodGlobal;
    }

    @Mutation(() => FoodGlobal)
    async createFoodGlobal(
        @Arg("food_name") food_name: string,
        @Arg("food_category") food_category: string,
        @Arg("food_picture_url") food_picture_url: string
    ): Promise<FoodGlobal> {
        //Check if an existing FoodGlobal has the given name
        const existingFoodGlobal = await this.getFoodGlobalbyFoodName(food_name);
        if (existingFoodGlobal != null) {
            throw new Error(`A FoodGlobal item with the name "${food_name}" already exists.`)
        }

        const docRef = await db.collection(COLLECTIONS.FOOD_GLOBAL).doc();


        const newFoodGlobal: FoodGlobal = {
            id: docRef.id,
            food_name, 
            food_category, 
            food_picture_url
        };

        //Save new FoodGlobal
        await docRef.set(newFoodGlobal);

        const savedDoc = await docRef.get();
        console.log("Saved FoodGlobal In Firestore:", savedDoc.data());
        
        return newFoodGlobal as FoodGlobal;
    }

    @Mutation(() => Boolean)
    async deleteFoodGlobal(
        @Arg("food_global_id") food_global_id: string
    ): Promise<boolean> {
        const foodGlobalRef = db.collection(COLLECTIONS.FOOD_GLOBAL).doc(food_global_id);

        //Delete associated Abstract Food items (cascades down to Concrete Food items)
        const foodAbstractResolver = new FoodAbstractResolver();
        const foodAbstractSnapshot = await db.collection(COLLECTIONS.FOOD_ABSTRACT)
            .where("food_global_id", "==", food_global_id)
            .get();

        for (const doc of foodAbstractSnapshot.docs) {
            await foodAbstractResolver.deleteFoodAbstract(doc.id);
        }

        //Delete the FoodGlobal
        await foodGlobalRef.delete();

        return true;
    }
}