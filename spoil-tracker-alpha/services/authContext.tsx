import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { useRouter, useSegments } from 'expo-router';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthLoaded) return;

    // Check if we are on a public screen (e.g., login)
    const isInsideAuth =
      segments[0] === 'login' ||
      segments[0] === 'registration' ||
      segments[0] == 'forgotPassword';

    if (user && isInsideAuth) {
      router.replace('/Home'); // Redirect to home if logged in
    } else if (!user && !isInsideAuth) {
      router.replace('/login'); // Redirect to login if not authenticated
    }
  }, [user, isAuthLoaded, segments]);

  const login = async (email: string, password: string) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.replace('/login'); // Redirect user to login screen after logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
