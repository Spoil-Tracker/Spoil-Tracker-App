import { Resolver, Query, Mutation, Arg, Field, ObjectType, ID } from "type-graphql";
import { COLLECTIONS } from "./CollectionNames";
import { db } from "../firestore";

@ObjectType()
export class NutritionGoal {
    @Field()
    date!: string;

    @Field()
    caloriesGoal!: number;

    @Field()
    proteinGoal!: number;

    @Field()
    carbsGoal!: number;

    @Field()
    fatsGoal!: number;
}

@ObjectType()
export class NutritionLog {
    @Field()
    date!: string;

    @Field()
    consumedCalories!: number;

    @Field()
    consumedProtein!: number;

    @Field()
    consumedCarbs!: number;

    @Field()
    consumedFats!: number;
}

@ObjectType()
export class Nutrition {
    @Field(() => ID)
    userID!: string;

    @Field(() => [NutritionGoal])
    dailyGoals!: NutritionGoal[];

    @Field(() => [NutritionLog])
    dailyLogs!: NutritionLog[];
}

@Resolver(Nutrition)
export class NutritionResolver {

    @Mutation(() => Boolean)
    async createNutritionProfile(
        @Arg("userID") userID: string
    ): Promise<boolean> {
        try {
            const nutritionRef = db.collection(COLLECTIONS.NUTRITION).doc(userID);
            const nutritionSnapshot = await nutritionRef.get();

            if (!nutritionSnapshot.exists) {
                await nutritionRef.set({
                    userID,
                    dailyGoals: [],
                    dailyLogs: []
                });
                console.log(`Nutrition profile created for user: ${userID}`);
            }
            return true;
        } catch (error) {
            console.error("Error creating nutrition profile:", error);
            return false;
        }
    }

    @Mutation(() => Boolean)
    async setDailyNutritionGoal(
        @Arg("userID") userID: string,
        @Arg("caloriesGoal") caloriesGoal: number,
        @Arg("proteinGoal") proteinGoal: number,
        @Arg("carbsGoal") carbsGoal: number,
        @Arg("fatsGoal") fatsGoal: number
    ): Promise<boolean> {
        try {
            const nutritionRef = db.collection(COLLECTIONS.NUTRITION).doc(userID);
            const nutritionSnapshot = await nutritionRef.get();

            if (!nutritionSnapshot.exists) {
                throw new Error(`No nutrition profile found for user: ${userID}`);
            }

            const today = new Date().toISOString().split("T")[0];

            let dailyGoals = nutritionSnapshot.data()?.dailyGoals || [];

            dailyGoals = dailyGoals.filter((goal: NutritionGoal) => goal.date !== today);
            dailyGoals.push({ date: today, caloriesGoal, proteinGoal, carbsGoal, fatsGoal });

            await nutritionRef.update({ dailyGoals });
            return true;
        } catch (error) {
            console.error("Error updating daily nutrition goal:", error);
            return false;
        }
    }

    @Mutation(() => Boolean)
    async logDailyNutrition(
        @Arg("userID") userID: string,
        @Arg("consumedCalories") consumedCalories: number,
        @Arg("consumedProtein") consumedProtein: number,
        @Arg("consumedCarbs") consumedCarbs: number,
        @Arg("consumedFats") consumedFats: number
    ): Promise<boolean> {
        try {
            const nutritionRef = db.collection(COLLECTIONS.NUTRITION).doc(userID);
            const nutritionSnapshot = await nutritionRef.get();

            if (!nutritionSnapshot.exists) {
                throw new Error(`No nutrition profile found for user: ${userID}`);
            }

            const today = new Date().toISOString().split("T")[0];

            let dailyLogs = nutritionSnapshot.data()?.dailyLogs || [];
            dailyLogs = dailyLogs.filter((log: NutritionLog) => log.date !== today);
            dailyLogs.push({ date: today, consumedCalories, consumedProtein, consumedCarbs, consumedFats });

            await nutritionRef.update({ dailyLogs });
            console.log(`Daily nutrition log updated for user: ${userID} on ${today}`);

            return true;
        } catch (error) {
            console.error("Error logging daily nutrition:", error);
            return false;
        }
    }

    @Query(() => NutritionGoal, { nullable: true })
    async getDailyNutritionGoal(
        @Arg("userID") userID: string,
        @Arg("date") date: string
    ): Promise<NutritionGoal | null> {
        try {
            const nutritionRef = db.collection(COLLECTIONS.NUTRITION).doc(userID);
            const nutritionSnapshot = await nutritionRef.get();

            if (!nutritionSnapshot.exists) {
                throw new Error(`No nutrition profile found for user: ${userID}`);
            }

            const dailyGoals = nutritionSnapshot.data()?.dailyGoals || [];
            return dailyGoals.find((goal: NutritionGoal) => goal.date === date) || null;
        } catch (error) {
            console.error("Error fetching daily nutrition goal:", error);
            return null;
        }
    }

    @Query(() => NutritionLog, { nullable: true })
    async getDailyNutritionLog(
        @Arg("userID") userID: string,
        @Arg("date") date: string
    ): Promise<NutritionLog | null> {
        try {
            const nutritionRef = db.collection(COLLECTIONS.NUTRITION).doc(userID);
            const nutritionSnapshot = await nutritionRef.get();

            if (!nutritionSnapshot.exists) {
                throw new Error(`No nutrition profile found for user: ${userID}`);
            }

            const dailyLogs = nutritionSnapshot.data()?.dailyLogs || [];
            return dailyLogs.find((log: NutritionLog) => log.date === date) || null;
        } catch (error) {
            console.error("Error fetching daily nutrition log:", error);
            return null;
        }
    }
}
