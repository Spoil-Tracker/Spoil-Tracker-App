import {
    Field, 
    ObjectType, 
    ID} from "type-graphql";

/**
 * Represents an item in a grocery list.
 *
 * This type defines the structure of a grocery list item, including its
 * unique identifier, food details, measurement, quantity, purchase status,
 * and additional descriptive information.
 */

@ObjectType()
export class GroceryListItem {
    /**
     * The unique identifier for this grocery list item.
     */
    @Field(type => ID)
    id!: string;

    /**
     * The name of the food item.
     */
    @Field()
    food_name!: string;

    /**
     * The identifier of the food item from the global food collection.
     */
    @Field()
    food_global_id!: string;

    /**
     * The measurement unit for the food item (e.g., "unit", "kg", "liters").
     */
    @Field()
    measurement!: string;

    /**
     * The quantity of the food item.
     */
    @Field()
    quantity!: number;

    /**
     * A flag indicating whether the item has been purchased.
     */
    @Field()
    isBought!: boolean;

    /**
     * A description of the food item.
     */
    @Field()
    description!: string;

    /**
     * The URL of the image representing the food item.
     */
    @Field()
    imageUrl!: string;
}
