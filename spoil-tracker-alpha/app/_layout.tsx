// app/_layout.tsx
import React from 'react';
import { AuthProvider } from '../services/authContext'; // Adjust the path if needed
import { Slot } from 'expo-router'; // Slot will render the route page

const Layout = () => {
  return (
    <AuthProvider>
      {/* Slot renders the current screen */}
      <Slot />
    </AuthProvider>
  );
};

export default Layout;