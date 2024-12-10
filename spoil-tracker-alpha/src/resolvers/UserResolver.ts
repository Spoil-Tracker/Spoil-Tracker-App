import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { User } from "../entities/User";
import db from "../firestore"; // Import Firestore instance

@Resolver(User)
export class UserResolver {

    @Query(() => [User])
    async getAllUsers(): Promise<User[]> {
        console.log("Fetching users...");
        const snapshot = await db.collection("users").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
    }

    @Query(() => User, {nullable: true})
    async getUserByName(
      @Arg("name") name: string
    ): Promise<User | null> {
      const userSnapshot = await db.collection("users")
        .where("name", "==", name)
        .limit(1)
        .get();
      
      if (userSnapshot.empty) {
        return null; //Return null if no user matches the given name
      }

      const userDoc = userSnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    }

    @Mutation(() => User)
    async createUser(
        @Arg("name") name: string,
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<User> {
      //Check if a user with the same name exists
      const existingUserSnapshot = await db.collection("users")
        .where("name", "==", name)
        .limit(1)
        .get();

      if (!existingUserSnapshot.empty) {
        throw new Error(`A user with the name "${name}" already exists.`)
      }
      
        const newUser = { name, email, password };
        const docRef = await db.collection("users").add(newUser);
        return { id: docRef.id, ...newUser };
    }
}
