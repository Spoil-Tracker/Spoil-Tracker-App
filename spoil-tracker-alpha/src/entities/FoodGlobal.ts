import {Resolver, Query, Mutation, Arg, Field, ObjectType, ID} from "type-graphql";
import db from "../firestore";

@ObjectType()
export class FoodGlobal {
    @Field(type => ID)
    id!: string;

    @Field()
    food_name!: string;

    @Field()
    food_category!: string;
}

@Resolver(FoodGlobal) 
export class FoodGlobalResolver {

    @Query(() => [FoodGlobal])
    async getAllFoodGlobal(): Promise<FoodGlobal[]> {
        const snapshot = await db.collection("food_global").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()})) as FoodGlobal[];
    }

    @Query(() => FoodGlobal, {nullable: true})
    async getFoodByID(
        @Arg("id") food_id: string
    ): Promise<FoodGlobal | null> {
        const snapshot = await db.collection("food_global")
            .where("id", "==", food_id)
            .limit(1)
            .get();

        if(snapshot.empty) {
            return null;
        }

        const foodDoc = snapshot.docs[0];
        return {
            id: foodDoc.id,
            ...foodDoc.data(),
        } as FoodGlobal;
    }
}