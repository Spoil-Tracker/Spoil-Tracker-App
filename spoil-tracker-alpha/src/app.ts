import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";

const bootstrap = async () => {
  // Build GraphQL schema
  const schema = await buildSchema({
    resolvers: [UserResolver],
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
