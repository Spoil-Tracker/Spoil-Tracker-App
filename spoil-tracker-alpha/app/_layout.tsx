// app/_layout.tsx
import React from 'react';
import { AuthProvider } from '../services/authContext'; // Adjust the path if needed
import { Slot } from 'expo-router'; // Slot will render the route page
import { ThemeProvider, useTheme } from '../services/themeContext';
import { PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from '../services/currentTheme';

// layout that allows a theme to be wrapped around it i.e dark mode
const Layout = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemedLayout />
      </ThemeProvider>
    </AuthProvider>
  );
};

function ThemedLayout() {
  const { theme } = useTheme();

  return (
    <PaperProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <Slot />
    </PaperProvider>
  );
}

export default Layout;
