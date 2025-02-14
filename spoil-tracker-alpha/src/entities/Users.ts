import { Resolver, Query, Mutation, Arg, Field, ObjectType, ID } from "type-graphql";
import { COLLECTIONS } from "./CollectionNames"
import db from "../firestore"; //Import Firestore instance
import { Account, AccountResolver } from "./Account";

@ObjectType()
export class User {
    @Field()
    createdAt!: string;

    @Field()
    email!: string;             //UK

    @Field()
    username!: string;          
}

@Resolver(User)
export class UserResolver {

    @Query(() => [User])
    async getAllUsers(): Promise<User[]> {
        const snapshot = await db.collection(COLLECTIONS.USERS).get();
        return snapshot.docs.map(doc => doc.data() as User);
    }

    @Query(() => String, {nullable: true})
    async getUserDocIDByEmail(
        @Arg("email") email: string
    ): Promise<string | null> {
        const snapshot = await db.collection(COLLECTIONS.USERS)
        .where("email", "==", email)
        .limit(1)
        .get();

        if(snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].id;
    }

    @Query(() => User, {nullable: true})
    async getUserByEmail(
        @Arg("email") email: string
    ): Promise<User | null> {
        
        const docID = await this.getUserDocIDByEmail(email);

        if(!docID) {
            return null;
        }

        const snapshot = await db.collection(COLLECTIONS.USERS).doc(docID).get();

        return snapshot.data() as User;
    }

    //TO DO: Update username on Account document
    @Mutation(() => User)
    async updateUsername(
        @Arg("email") email: string,
        @Arg("newUsername") newUsername: string
    ): Promise<User> {
        
        const docID = await this.getUserDocIDByEmail(email);

        if(!docID) {
            throw new Error(`User with email "${email} not found.`);
        }

        //Update user document
        await db.collection(COLLECTIONS.USERS)
            .doc(docID)
            .update({ username: newUsername });

        //Return the updated document
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(docID).get();
        return userDoc.data() as User;
    }

    @Mutation(() => Boolean)
    async deleteUser(
        @Arg("email") email: string
    ): Promise<boolean> {

        const docID = await this.getUserDocIDByEmail(email);

        if(!docID) {
            throw new Error(`User with email "${email} not found.`);
        }

        //Delete account associated with user
        const existingAccount = await db.collection(COLLECTIONS.ACCOUNT)
            .where("owner_id", "==", docID)
            .limit(1)
            .get();
        
        if (!existingAccount.empty) {
            throw new Error(`Account with owner_ID ${docID} does not exist.`);
        }

        const accountResolver = new AccountResolver();
        const account_data = await accountResolver.getAccountByOwnerID(docID) as Account;
        const account_id = account_data.id;

        await accountResolver.deleteAccount(account_id);

        //delete user
        await db.collection(COLLECTIONS.USERS).doc(docID).delete();

        return true;
    }
}