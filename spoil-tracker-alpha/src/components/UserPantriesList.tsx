import React from 'react';
import { useGetAllUsersQuery, useGetPantriesForUserQuery } from '../gql/generated'; // Import generated hooks

const UsersAndPantriesPage = () => {
  // Fetch all users
  const { data: usersData, loading: usersLoading, error: usersError } = useGetAllUsersQuery();

  if (usersLoading) return <div>Loading users...</div>;
  if (usersError) return <div>Error loading users: {usersError.message}</div>;

  return (
    <div>
      <h1>Users and Their Pantries</h1>
      {usersData?.getAllUsers?.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <ul>
          {usersData?.getAllUsers?.map((user) => (
            <UserWithPantries key={user.id} user={user} />
          ))}
        </ul>
      )}
    </div>
  );
};

// Component for displaying each user along with their pantries and food items
const UserWithPantries = ({ user }: { user: { id: string; name: string } }) => {
  // Fetch the pantries for this user
  const { data: pantriesData, loading: pantriesLoading, error: pantriesError } = useGetPantriesForUserQuery({
    variables: { name: user.name },
  });

  if (pantriesLoading) return <div>Loading pantries for {user.name}...</div>;
  if (pantriesError) return <div>Error loading pantries: {pantriesError.message}</div>;

  return (
    <li>
      <h2>{user.name}</h2>
      {pantriesData?.getPantryForUser?.length === 0 ? (
        <p>No pantries found.</p>
      ) : (
        <ul>
          {pantriesData?.getPantryForUser?.map((pantry) => (
            <PantryWithFoodItems key={pantry.id} pantry={pantry} />
          ))}
        </ul>
      )}
    </li>
  );
};

// Component for displaying a pantry with its food items
const PantryWithFoodItems = ({ pantry }: { pantry: { id: string; name: string; foodItems: any[] } }) => {
  return (
    <li>
      <h3>{pantry.name}</h3>
      {pantry.foodItems?.length === 0 ? (
        <p>No food items found.</p>
      ) : (
        <ul>
          {pantry.foodItems?.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong> - Quantity: {item.quantity} - Expiration: {item.expiration || 'N/A'}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default UsersAndPantriesPage;
