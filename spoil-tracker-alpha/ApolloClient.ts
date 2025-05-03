// src/ApolloClient.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';

const local_ip = process.env.EXPO_PUBLIC_LOCAL_IP;
const client = new ApolloClient({
  uri: `http://${local_ip}:4000/graphql`, // Replace with your backend GraphQL endpoint
  cache: new InMemoryCache(),
});

export default client;
