import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./entities/Users";
import { PantryResolver } from "./entities/Pantry";
import { AccountResolver } from "./entities/Account";
import { FoodAbstractResolver } from "./entities/FoodAbstract";
import { FoodConcreteResolver } from "./entities/FoodConcrete";
import { FoodGlobalResolver } from "./entities/FoodGlobal";
import { GroceryListResolver } from "./entities/GroceryList";

const bootstrap = async () => {
  // Build GraphQL schema
  const schema = await buildSchema({
    resolvers: [
      UserResolver, 
      PantryResolver, 
      AccountResolver, 
      FoodAbstractResolver, 
      FoodConcreteResolver,
      FoodGlobalResolver,
      GroceryListResolver
    ],
    validate: false,
  });

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
  });

  // Start server
  const { url } = await server.listen(4000);
  console.log(`Server is running at ${url}`);
};

bootstrap().catch(console.error);
