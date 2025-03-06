import {
    Field, 
    ObjectType, 
    ID} from "type-graphql";

@ObjectType()
export class GroceryListItem {
    @Field(type => ID)
    id!: string;
    
    @Field()
    food_name!: string;

    @Field()
    food_global_id!: string;

    @Field()
    measurement!: string;

    @Field()
    quantity!: number;

    @Field()
    isBought!: boolean;

    // New fields:
    @Field()
    description!: string;

    @Field()
    imageUrl!: string;
}
