// src/ApolloClient.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';

const local_ip = process.env.EXPO_PUBLIC_LOCAL_IP;

const client = new ApolloClient({
  uri: local_ip == undefined
    ? 'https://spoil-tracker-server.onrender.com/graphql' 
    : `http://${local_ip}:4000/graphql`,
  cache: new InMemoryCache(),
});

export default client;
