// src/ApolloClient.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { local_ip } from './vars';

const client = new ApolloClient({
  uri: `http://${local_ip}:4000/graphql`, // Replace with your backend GraphQL endpoint
  cache: new InMemoryCache(),
});

export default client;
