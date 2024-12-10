import React from "react";
import UsersList from "./components/UsersList"; // Path to your UsersList component
import UserPantriesList from "./components/UserPantriesList";

const App2: React.FC = () => {
  return (
    <div>
      <h1>Users</h1>
      <UserPantriesList />
    </div>
  );
};

export default App2;