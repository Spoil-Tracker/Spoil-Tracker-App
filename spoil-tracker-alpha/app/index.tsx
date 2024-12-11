// app/index.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/authContext'; // Adjust path if needed
import { useRouter } from 'expo-router';

const Index = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Ensure navigation logic only runs after the layout is ready
  useEffect(() => {
    if (isReady) {
      if (!user) {
        router.push('./login'); // Navigate to login if no user is logged in
      } else {
        router.push('./HomeProfile'); // Navigate to home page if the user is logged in
      }
    }
  }, [isReady, user, router]);

  // Mark layout as ready once the component has mounted
  useEffect(() => {
    setIsReady(true);
  }, []);

  return null; // Blank screen while redirecting
};

export default Index;