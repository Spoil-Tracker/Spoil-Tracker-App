import { StackNavigationOptions } from 'expo-router';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      login: undefined;
      registration: undefined;
    }
  }
}