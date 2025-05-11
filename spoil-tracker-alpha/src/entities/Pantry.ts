import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  ObjectType,
  ID,
} from 'type-graphql';
import { COLLECTIONS } from './CollectionNames';
import { db } from '../firestore';
import { Account } from './Account';
import { FoodConcreteResolver } from './FoodConcrete';

@ObjectType()
export class Pantry {
  @Field((type) => ID)
  id!: string;

  @Field()
  account_id!: string;

  @Field()
  pantry_name!: string;

  @Field()
  description!: string;

  @Field((type) => [String])
  food_concrete_items!: string[];
}

@Resolver(Pantry)
export class PantryResolver {
  @Query(() => [Pantry])
  async getAllPantries(): Promise<Pantry[]> {
    const snapshot = await db.collection(COLLECTIONS.PANTRY).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Pantry[];
  }

  @Query(() => [Pantry])
  async getAllPantriesforAccount(
    @Arg('account_id') account_id: string
  ): Promise<Pantry[]> {
    const snapshot = await db
      .collection(COLLECTIONS.PANTRY)
      .where('account_id', '==', account_id)
      .get();

    return snapshot.docs.map((doc) => doc.data() as Pantry);
  }

  //Pantry descriptions are updated after creation
  @Mutation(() => Pantry)
  async createPantry(
    @Arg('account_id') account_id: string,
    @Arg('pantry_name') pantry_name: string
  ): Promise<Pantry> {
    //Having multiple pantries with the same name in the same account is okay, even if not recommended

    //Get a doc ID for this document
    const docRef = db.collection(COLLECTIONS.PANTRY).doc();

    const newPantry: Pantry = {
      id: docRef.id,
      account_id,
      pantry_name,
      description: '',
      food_concrete_items: [],
    };

    //Update the Account associated with this Pantry
    const accountRef = db.collection(COLLECTIONS.ACCOUNT).doc(account_id);
    const accountDoc = await accountRef.get();

    if (!accountDoc.exists) {
      throw new Error(`Account with ID ${account_id} does not exist.`);
    }

    const accountData = accountDoc.data() as Account;
    accountData.pantries.push(docRef.id);

    //Save account update
    await accountRef.update({ pantries: accountData.pantries });

    //Save newPantry
    await docRef.set(newPantry);

    return newPantry;
  }

  @Mutation(() => Pantry)
  async updatePantryDescription(
    @Arg('pantry_id') pantry_id: string,
    @Arg('new_description') new_description: string
  ): Promise<Pantry> {
    //Perform update
    await db
      .collection(COLLECTIONS.PANTRY)
      .doc(pantry_id)
      .update({ description: new_description });

    //Return updated document
    const pantryDoc = await db
      .collection(COLLECTIONS.PANTRY)
      .doc(pantry_id)
      .get();
    return pantryDoc.data() as Pantry;
  }

  @Mutation(() => Boolean)
  async deletePantry(@Arg('pantry_id') pantry_id: string): Promise<boolean> {
    const pantryRef = db.collection(COLLECTIONS.PANTRY).doc(pantry_id);
    const pantryDoc = await pantryRef.get();
    if (!pantryDoc.exists) {
      throw new Error(`A pantry with the id "${pantry_id}" doesn't exist.`);
    }
    const pantryData = pantryDoc.data();

    //Delete FoodConcrete items
    if (pantryData && Array.isArray(pantryData.food_concrete_items)) {
      const foodConcreteResolver = new FoodConcreteResolver();
      for (var food_concrete_id of pantryData.food_concrete_items) {
        await foodConcreteResolver.deleteFoodConcrete(food_concrete_id);
      }
    }

    await pantryRef.delete();

    return true;
  }

  @Query(() => Pantry)
  async getPantryById(@Arg('pantry_id') pantry_id: string): Promise<Pantry> {
    const pantryDoc = await db
      .collection(COLLECTIONS.PANTRY)
      .doc(pantry_id)
      .get();
    if (!pantryDoc.exists) {
      throw new Error(`Pantry with ID ${pantry_id} not found`);
    }
    return pantryDoc.data() as Pantry;
  }

  
  /**
   * Searches pantries by a keyword across pantry name and description only.
   *
   * @param account_id – the account to restrict the search to
   * @param query – the search term
   * @returns a list of pantry IDs whose name or description contains the keyword
   */
  @Query(() => [String])
  async searchPantries(
      @Arg("account_id") account_id: string,
      @Arg("query") query: string
  ): Promise<string[]> {
      // fetch all pantries for this account
      const snap = await db
      .collection(COLLECTIONS.PANTRY)
      .where("account_id", "==", account_id)
      .get();

      const lowerQ = query.toLowerCase();
      const matches: string[] = [];

      snap.forEach(doc => {
      const pantry = doc.data() as Pantry;
      if (
          pantry.pantry_name.toLowerCase().includes(lowerQ) ||
          pantry.description.toLowerCase().includes(lowerQ)
      ) {
          matches.push(pantry.id);
      }
      });

      return matches;
  }
}
