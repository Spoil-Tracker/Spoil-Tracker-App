import { Resolver, Query, Mutation, Arg, Field, ObjectType, ID, registerEnumType } from "type-graphql";
import { COLLECTIONS } from "./CollectionNames"
import db from "../firestore"; //Import Firestore instance
import { PantryResolver } from "./Pantry";
import { FoodAbstractResolver } from "./FoodAbstract";

enum AccountType {
    user = "user",
    family = "family",
}

registerEnumType(AccountType, {
    name: "AccountType"
})

@ObjectType()
export class Account {
    @Field(type => ID)
    id!: string;

    @Field()
    owner_id!: string;

    @Field()
    account_name!: string;

    @Field(type => AccountType)
    account_type!: AccountType;

    @Field(type => [String])
    abstract_foods!: string[];

    @Field(type => [String])
    pantries!: string[];

    @Field(type => [String])
    grocery_lists!: string[];

    @Field(type => [String])
    family_circles!: string[];
}

@Resolver(Account)
export class AccountResolver {

    @Query(() => [Account])
    async getAllAccounts(): Promise<Account[]> {
        const snapshot = await db.collection(COLLECTIONS.ACCOUNT).get();
        return snapshot.docs.map(doc => doc.data() as Account);
    }

    @Query(() => Account)
    async getAccountByOwnerID(
        @Arg("owner_id") owner_id: string
    ): Promise<Account | null> {

        const snapshot = await db.collection(COLLECTIONS.ACCOUNT)
            .where("owner_id", "==", owner_id)
            .limit(1)
            .get();
        
        if(snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data() as Account;
    }

    @Mutation(() => Account)
    async createAccount(
        @Arg("owner_id") owner_id: string,
        @Arg("account_name") account_name: string,
        @Arg("account_type") account_type: string
    ): Promise<Account> {
        //Check if an account with the same owner_id exists
        //If existingAccount is null, then there is no account with this owner_id
        const existingAccount = await this.getAccountByOwnerID(owner_id);
        if(existingAccount != null) {
            throw new Error(`An account with the owner_id of "${owner_id}" already exists.`)
        }

        //account_type is an enum, and must be
        //  "user" OR "family"
        const accountEnum = AccountType[account_type as keyof typeof AccountType];
        if (!accountEnum) {
            throw new Error(`Account type must be "family" or "user". Read in the value "${account_type}".`);
        }

        //Pre-generate a firestore document ref with an auto generated ID
        const docRef = db.collection(COLLECTIONS.ACCOUNT).doc();
        const newAccount: Account = {
            id: docRef.id,
            owner_id, 
            account_name, 
            account_type: accountEnum, 
            abstract_foods: [], 
            pantries: [], 
            grocery_lists: [], 
            family_circles: []
        };
        await docRef.set(newAccount);
        return newAccount as Account;
    }

    @Mutation(() => Boolean)
    async deletePantryFromAccount(
        @Arg("account_id") account_id: string,
        @Arg("pantry_id") pantry_id: string
    ): Promise<boolean> {
        const accountRef = db.collection(COLLECTIONS.ACCOUNT).doc(account_id);
        const accountDoc = await accountRef.get();
        const accountData = accountDoc.data() as Account;

        const pantryRef = db.collection(COLLECTIONS.PANTRY).doc(pantry_id);
        const pantryDoc = await pantryRef.get();
        
        if(!accountDoc.exists) {
            throw new Error(`An account with the id "${account_id}" doesn't exist.`)
        }
        if(!pantryDoc.exists) {
            throw new Error(`A pantry with the id "${pantry_id}" doesn't exist.`)
        }
        //Check to see if the account and pantry are related
        if(!accountData.pantries.includes(pantry_id))
        {
            throw new Error(`The account "${account_id}" and pantry "${pantry_id}" have no association.`)
        }

        //Remove the pantry_id from this account's pantry list
        const newPantriesArray = accountData.pantries.filter(item => item !== pantry_id);
        await accountRef.update({ pantries: newPantriesArray});

        //Delete the pantry
        const pantryResolver = new PantryResolver();
        await pantryResolver.deletePantry(pantry_id);

        return true;
    }

    @Mutation(() => Boolean)
    async deleteFoodAbstractFromAccount(
        @Arg("account_id") account_id: string,
        @Arg("food_abstract_id") food_abstract_id: string
    ): Promise<boolean> {
        const accountRef = db.collection(COLLECTIONS.ACCOUNT).doc(account_id);
        const accountDoc = await accountRef.get();
        const accountData = accountDoc.data() as Account;

        const foodAbstractRef = db.collection(COLLECTIONS.FOOD_ABSTRACT).doc(food_abstract_id);
        const foodAbstractDoc = await foodAbstractRef.get();

        if(!accountDoc.exists) {
            throw new Error(`An account with the id "${account_id}" doesn't exist.`)
        }
        if(!foodAbstractDoc.exists) {
            throw new Error(`An abstract food item with the id "${food_abstract_id}" doesn't exist.`)
        }
        //Check to see if the account and pantry are related
        if(!accountData.abstract_foods.includes(food_abstract_id))
        {
            throw new Error(`The account "${account_id}" and abstract food item "${food_abstract_id}" have no association.`)
        }

        //Remove the food_abstract_id from thi's account's abstract_foods list
        const newAbstractFoodsArray = accountData.abstract_foods.filter(item => item !== food_abstract_id);
        await accountRef.update({ abstract_foods: food_abstract_id});

        //Delete the abstract food
        const foodAbstractResolver = new FoodAbstractResolver();
        foodAbstractResolver.deleteFoodAbstract(food_abstract_id);

        return true;
    }

    @Mutation(() => Boolean)
    async deleteAccount(
        @Arg("account_id") account_id: string
    ): Promise<boolean> {
        const accountRef = db.collection(COLLECTIONS.ACCOUNT).doc(account_id);
        const accountDoc = await accountRef.get();
        const accountData = accountDoc.data() as Account;

        if(!accountDoc.exists) {
            throw new Error(`An account with the id "${account_id}" doesn't exist.`)
        }

        //Delete Pantries
        for(var pantry_id of accountData.pantries) {
            await this.deletePantryFromAccount(account_id, pantry_id);
        }

        //Delete FoodAbstracts
        for(var food_abstract_id of accountData.abstract_foods) {
            await this.deleteFoodAbstractFromAccount(account_id, food_abstract_id);
        }

        await accountRef.delete();

        return true;

    }

    //async changeAccountName

    //async addGroceryList

    //async removeGroceryList
}
