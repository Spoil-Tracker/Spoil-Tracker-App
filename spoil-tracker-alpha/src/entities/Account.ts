import { Resolver, Query, Mutation, Arg, Field, ObjectType, ID, registerEnumType } from "type-graphql";
import db from "../firestore"; //Import Firestore instance

enum AccountType {
    user = "user",
    family = "family",
}

registerEnumType(AccountType, {
    name: "AccountType"
})

//Distinction is made between users and accounts for purposes of family circle
//A user has an account and a family circle has an account
@ObjectType()
export class Account {
    @Field(type => ID)
    id!: string;            //PK

    //ID from User or ID from Family
    @Field(type => ID)
    owner_id!: string;       //FK UK

    //Username from User or FamilyName from Family
    //Many families will have a default "Family" FamilyName, so this does not need to be unique.
    @Field()
    account_name!: string;      

    //dictates if this is an account for a user, or an account for a family circle
    @Field(type => AccountType)
    account_type!: AccountType;

    //A list of all of the id's of pantries 
    @Field(type => [String])
    pantries!: string[];
}

@Resolver(Account) 
export class AccountResolver{
    
    @Query(() => [Account])
    async getAllAccounts(): Promise<Account[]> {
        const snapshot = await db.collection("accounts").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()})) as Account[];
    }

    @Query(() => Account, {nullable: true})
    async getAccountByOwnerID(
        @Arg("owner_id") owner_id: string
    ): Promise<Account | null> {
        const snapshot = await db.collection("accounts")
            .where("owner_id", "==", owner_id)
            .limit(1)
            .get();

        if(snapshot.empty) {
            return null;
        }

        const accountDoc = snapshot.docs[0];
        return {
            id: accountDoc.id,
            ...accountDoc.data(),
        } as Account;
    }

    @Mutation(() => Account)
    async createAccount(
        @Arg("owner_id") owner_id: string,
        @Arg("account_name") account_name: string,
        @Arg("account_type") account_type: string
    ): Promise<Account> {
        //Check if an account with the same account_id already exists
        const existingAccount = await this.getAccountByOwnerID(owner_id)
        if (existingAccount != null) {
            throw new Error(`An account with the owner_id "${owner_id}" already exists.`)
        }
        //account_type is an enum, and must be
        //  "user" OR
        //  "family"
        let accountEnum: AccountType;
        switch (account_type) {
            case "user":
                accountEnum = AccountType.user;
                break;
            case "family":
                accountEnum = AccountType.family;
                break;
            default:
                throw new Error(`Account type must be "family" or "user". Read in the value "${account_type}".`)
        }

        var pantries = new Array<string>();

        const newAccount = {owner_id, account_name, account_type: accountEnum, pantries};
        const docRef = await db.collection("accounts").add(newAccount);
        return {id: docRef.id, ...newAccount};
    }

    
}