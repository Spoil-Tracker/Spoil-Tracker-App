import { Resolver, Query, Mutation, Arg, Field, ObjectType, ID } from "type-graphql";
import db from "../firestore"; //Import Firestore instance

@ObjectType()
export class User {
    @Field(type => ID)
    id!: string;            //PK

    @Field()
    username!: string;      //UK    All usernames must be unique

    @Field()
    email!: string;         //UK    All emails must be unique
}

@Resolver(User)
export class UserResolver {
    
    @Query(() => [User])
    async getAllUsers(): Promise<User[]> {
        const snapshot = await db.collection("users").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()})) as User[];
    }

    @Query(() => User, {nullable: true})
    async getUserByUsername(
        @Arg("username") username: string
    ): Promise<User | null> {
        const snapshot = await db.collection("users")
            .where("username", "==", username)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const userDoc = snapshot.docs[0];
        return {
            id: userDoc.id,
            ...userDoc.data(),
        } as User;
    }

    @Query(() => User, {nullable: true})
    async getUserByEmail(
        @Arg("email") email: string
    ): Promise<User | null> {
        const snapshot = await db.collection("users")
            .where("email", "==", email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const userDoc = snapshot.docs[0];
        return {
            id: userDoc.id,
            ...userDoc.data(),
        } as User;
    }

    @Mutation(() => User)
    async createUser(
        @Arg("username") username: string,
        @Arg("email") email: string
    ): Promise<User> {
        //Check if a user with the same email or username exists
        const existingEmailUser = await this.getUserByEmail(email)
        if (existingEmailUser != null) {
            throw new Error(`A user with the email "${email}" already exists.`)
        }
        const existingUsernameUser = await this.getUserByUsername(username)
        if (existingUsernameUser != null){
            throw new Error(`A user with the username "${username}" already exists`)
        }

        const newUser = {username, email};
        const docRef = await db.collection("users").add(newUser);
        return {id: docRef.id, ...newUser};
    }
}