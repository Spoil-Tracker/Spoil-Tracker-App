import { Field, ObjectType, ID } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;      //PK

  @Field()
  name!: string;    //Unique Key

  @Field()
  email!: string;

  @Field()
  password!: string; // Storing plaintext password (NOT recommended for production)
}