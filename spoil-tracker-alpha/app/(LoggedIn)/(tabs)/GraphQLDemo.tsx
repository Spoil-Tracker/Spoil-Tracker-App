import React from 'react';
import { AppRegistry } from 'react-native';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import App2 from '../../../src/BackendDemo'; // Your main app component

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Replace with your backend URL
  cache: new InMemoryCache(),
});

const App = () => (
  <ApolloProvider client={client}>
    <App2 />
  </ApolloProvider>
);

AppRegistry.registerComponent('YourAppName', () => App);

export default App;
