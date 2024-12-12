import { Field, ObjectType, ID, Float } from "type-graphql";

@ObjectType()
export class FoodItem {
    @Field(() => ID)
    id!: string;

    @Field()
    name!: string

    @Field(() => Float)
    quantity!: number;

    @Field(() => String, { nullable: true})
    expiration?: string | null;
}