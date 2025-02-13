import {Resolver, Query, Mutation, Arg, Field, ObjectType, ID} from "type-graphql";
import { COLLECTIONS } from "./CollectionNames";
import db from "../firestore";
import { Account } from "./Account";
import { FoodConcreteResolver } from "./FoodConcrete";
import { Pantry } from "./Pantry";

@ObjectType()
export class FoodAbstract {
    @Field(type => ID)
    id!: string;

    @Field()
    account_id!: string;

    @Field()
    food_global_id!: string;

    @Field()
    comment!: string;
}

@Resolver(FoodAbstract)
export class FoodAbstractResolver {

    @Query(() => [FoodAbstract])
    async getAllFoodAbstract(): Promise<FoodAbstract[]> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_ABSTRACT).get();
        return snapshot.docs.map(doc => doc.data() as FoodAbstract);
    }

    @Query(() => [FoodAbstract])
    async getAllFoodAbstractForAccount(
        @Arg("account_id") account_id: string
    ): Promise<FoodAbstract[]> {
        const snapshot = await db.collection(COLLECTIONS.FOOD_ABSTRACT)
            .where("account_id", "==", account_id)
            .get();

        return snapshot.docs.map(doc => doc.data() as FoodAbstract);
    }

    @Mutation(() => FoodAbstract)
    async createFoodAbstract(
        @Arg("account_id") account_id: string,
        @Arg("food_global_id") food_global_id: string
    ): Promise<FoodAbstract> {
        //Check if there is an existing FoodAbstract for the given Account and FoodGlobal
        const existingInfo = await db.collection(COLLECTIONS.FOOD_ABSTRACT)
            .where("food_global_id", "==", food_global_id)
            .where("account_id", "==", account_id)
            .limit(1)
            .get();

        if (!existingInfo.empty) {
            throw new Error(`A FoodAbstract item of "${food_global_id}" belonging to account "${account_id}" already exists`);
        }

        //Get a doc ID for this document
        const docRef = db.collection(COLLECTIONS.FOOD_ABSTRACT).doc();

        const newFoodAbstract: FoodAbstract = {
            id: docRef.id,
            account_id,
            food_global_id,
            comment: ""
        };

        //Update the Account associated with this FoodAbstract
        const accountRef = db.collection(COLLECTIONS.ACCOUNT).doc(account_id);
        const accountDoc = await accountRef.get();

        if (!accountDoc.exists) {
            throw new Error(`Account with ID ${account_id} does not exist.`);
        }

        const accountData = accountDoc.data() as Account;
        accountData.abstract_foods.push(docRef.id);

        //Save account update
        await accountRef.update({ abstract_foods: accountData.abstract_foods })

        //Save newFoodAbstract
        await docRef.set(newFoodAbstract);

        return newFoodAbstract;
    }

    @Mutation(() => FoodAbstract)
    async updateComment(
        @Arg("food_abstract_id") food_abstract_id: string,
        @Arg("new_comment") new_comment: string
    ): Promise <FoodAbstract> {
        await db.collection(COLLECTIONS.FOOD_ABSTRACT)
            .doc(food_abstract_id)
            .update({ comment: new_comment});

        //Return updated document
        const foodAbstractDoc = await db.collection(COLLECTIONS.FOOD_ABSTRACT).doc(food_abstract_id).get();
        return foodAbstractDoc.data() as FoodAbstract;
    }

    @Mutation(() => Boolean)
    async deleteFoodAbstract(
        @Arg("food_abstract_id") food_abstract_id: string
    ): Promise <boolean> {
        const foodAbstractRef = db.collection(COLLECTIONS.FOOD_ABSTRACT).doc(food_abstract_id);
        const foodAbstractDoc = await foodAbstractRef.get()
        if(!foodAbstractDoc.exists) {
            throw new Error(`An abstract food with the id "${food_abstract_id}" doesn't exist`);
        }
        
        //Delete all concrete food items, and their references within any pantries
        const foodConcreteResolver = new FoodConcreteResolver();
        const foodConcreteSnapshot = await db.collection(COLLECTIONS.FOOD_CONCRETE)
            .where("food_abstract_id", "==", food_abstract_id)
            .get();

        for (const doc of foodConcreteSnapshot.docs) {
            const tempData = doc.data();
            const pantryRef = db.collection(COLLECTIONS.PANTRY).doc(tempData.pantry_id)
            const pantryDoc = await pantryRef.get();
            const pantryData = pantryDoc.data() as Pantry;

            if(pantryData) {
                delete pantryData.food_concrete_items[tempData.id];
                
                //Delete pantry reference
                await db.collection(COLLECTIONS.PANTRY)
                    .doc(tempData.pantry_id)
                    .update({ food_concrete_items: pantryData.food_concrete_items})
            }

            await foodConcreteResolver.deleteFoodConcrete(doc.id);
        }

        //Delete the abstract food
        await foodAbstractRef.delete();

        return true;
    }
}