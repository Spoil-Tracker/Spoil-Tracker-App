import React from "react";
import { useGetAllUsersQuery } from "../gql/generated"; // Adjust the path to your generated file

const UsersList: React.FC = () => {
  const { data, loading, error } = useGetAllUsersQuery();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.getAllUsers.map((user) => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  );
};

export default UsersList;
