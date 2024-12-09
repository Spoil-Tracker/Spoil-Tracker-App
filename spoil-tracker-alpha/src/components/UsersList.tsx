import React from "react";
import { useGetUsersQuery } from "../gql/generated"; // Adjust the path to your generated file

const UsersList: React.FC = () => {
  const { data, loading, error } = useGetUsersQuery();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.users.map((user) => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  );
};

export default UsersList;
