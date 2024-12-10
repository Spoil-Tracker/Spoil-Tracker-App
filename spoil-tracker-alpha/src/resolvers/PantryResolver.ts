import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { User } from "../entities/User";
import { Pantry } from "../entities/Pantry";
import { FoodItem } from "../entities/FoodItem";
import db from "../firestore"; // Import Firestore instance

@Resolver(Pantry)
export class PantryResolver {

    /*
    @Query(() => [Pantry])
    async getAllPantries(): Promise<Pantry[]>{
        const snapshot = await db.collection("pantries").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Pantry[];
    }
    */
    @Query(() => [Pantry])
    async getAllPantries(): Promise<Pantry[]> {
        const snapshot = await db.collection("pantries").get();
    
        const pantries = snapshot.docs.map(doc => {
            const pantryData = doc.data();
    
            // Log the pantry data for debugging
            //console.log("Pantry Data:", pantryData);
    
            // Ensure the foodItems field is typed correctly
            const foodItems: FoodItem[] = pantryData.foodItems || [];
    
            // Log each food item for debugging
            //foodItems.forEach((item: FoodItem) => {
            //    console.log("Food Item:", item);  // Check each food item's data
            //});
    
            // Return the pantry with the mapped foodItems
            return { id: doc.id, ...pantryData, foodItems } as Pantry;
        });
    
        return pantries;
    }
    

    @Query(() => [Pantry], {nullable: true})
    async getPantryForUser(
        @Arg("name") name: string
    ): Promise<Pantry[]> {
        const userSnapshot = await db.collection("users")
        .where("name", "==", name)
        .limit(1)
        .get();
      
      if (userSnapshot.empty) {
        throw new Error(`No pantry found with the name for user "${name}".`);
      }

      const pantriesSnapshot = await db.collection("pantries")
        .where("owner_id", "==", userSnapshot.docs[0].id)
        .get();

      if(pantriesSnapshot.empty) {
        return [];
      }

      const pantries = pantriesSnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as Pantry;
      });

      return pantries;
    }


    @Mutation(() => Pantry)
    async createPantry(
        @Arg("ownerName") ownerName: string,
        @Arg("name") name: string
    ): Promise<Pantry> {
        //Query for the users by name
        const userSnapshot = await db.collection("users")
            .where("name", "==", ownerName)
            .limit(1)
            .get();

        if(userSnapshot.empty) {
            throw new Error(`No user found with the name "${ownerName}".`);
        }

        const owner_id = userSnapshot.docs[0].id;

        const newPantry = { owner_id, name };
        const docRef = await db.collection("pantries").add(newPantry);
        return { 
            id: docRef.id, 
            owner_id,
            name,
            foodItems: []
        };
    }

    @Mutation(() => Pantry)
    async addFoodItem(
        @Arg("userName") userName: string,
        @Arg("pantryName") pantryName: string,
        @Arg("foodName") foodName: string,
        @Arg("foodExpiry") foodExpiry: string,
        @Arg("foodQuantity") foodQuantity: number
    ): Promise<Pantry> {
        const userPantries = await this.getPantryForUser(userName);

        const targetPantry = userPantries?.find((pantry) => pantry.name === pantryName);

        if(!targetPantry) {
            throw new Error(`No pantry found with the name "${pantryName}" for user "${userName}".`);
        }

        //Fetch the pantry document from Firestore
        const pantryDocRef = db.collection("pantries").doc(targetPantry.id);
        const pantryDoc = await pantryDocRef.get();

        if(!pantryDoc.exists) {
            throw new Error(`Pantry with ID "${targetPantry.id}" does not exist.`);
        }

        const pantryData = pantryDoc.data();

        if(!pantryData) {
            throw new Error(`Unable to retrieve data for pantry with ID "${targetPantry.id}".`);
        }

        // Initialize or update the foodItems array
        const foodItems = pantryData.foodItems || [];

        //Create a new FoodItem
        const newFoodItem = {
            id: db.collection("pantries").doc(targetPantry.id).collection("foodItems").doc().id, // Generate unique ID
            name: foodName,
            quantity: foodQuantity,
            expiration: foodExpiry,
        }

        // Add the new FoodItem to the array
        foodItems.push(newFoodItem);

        //Update the pantry document in Firestore
        await pantryDocRef.update({ foodItems });

        //Return the updated pantry
        return {
            id: targetPantry.id,
            owner_id: pantryData.owner_id,
            name: pantryData.name,
            foodItems, // Updated foodItems array
        };
    }
}
