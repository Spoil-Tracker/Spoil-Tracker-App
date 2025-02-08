import { Field, ObjectType, ID } from "type-graphql";
import { FoodItem } from "./FoodItem";

@ObjectType()
export class Pantry {
    @Field(() => ID)
    id!: string;      // PK

    @Field()
    owner_id!: string; // FK reference to User.id

    @Field()
    name!: string;

    //Food items iniialized as an empty array by default
    @Field(() => [FoodItem], { defaultValue: []})
    foodItems!: FoodItem[];
}
