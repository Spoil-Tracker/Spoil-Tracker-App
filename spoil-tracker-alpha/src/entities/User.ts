import { ObjectType, Field, ID } from "type-graphql";

@ObjectType() // Marks this class as a GraphQL Object Type
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  fav_color!: string;

  @Field()
  age!: number;
}
