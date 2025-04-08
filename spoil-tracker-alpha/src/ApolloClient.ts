// src/ApolloClient.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://192.168.50.66:4000/graphql', // Replace with your backend GraphQL endpoint
  cache: new InMemoryCache(),
});

export default client;
