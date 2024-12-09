import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { User } from "../entities/User";
import db from "../firestore"; // Import Firestore instance

@Resolver(User)
export class UserResolver {
  private collection = db.collection("users");

  @Query(() => [User])
  async users(): Promise<User[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
  }

  @Mutation(() => User)
  async createUser(
    @Arg("name") name: string,
    @Arg("email") email: string,
    @Arg("age", { nullable: true }) age?: number
  ): Promise<User> {
    const newUser = { name, email, age };
    const docRef = await this.collection.add(newUser);
    return { id: docRef.id, ...newUser };
  }
}
