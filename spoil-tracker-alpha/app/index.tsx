import React from "react";
import ReactDOM from "react-dom/client"; // Import from 'react-dom/client' in React 18
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import App2 from "../src/BackendDemo"; // Your main app component

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql", // Replace with your backend URL
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
); // Use createRoot for React 18

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App2 />
    </ApolloProvider>
  </React.StrictMode>
);
