// services/currentTheme.ts
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    background: '#FEF9F2',
    text: '#000000',
    box: '#ffffff',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fd',
    background: '#26272B',
    text: '#ffffff',
    //box: '#535353',
    box: '#ffffff',
  },
};
