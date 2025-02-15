import React from 'react';
//import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'; // use FontAwesome5 to add the 'nutrition' icon
import { Tabs } from 'expo-router';
import { useColorScheme } from '../../../components/useColorScheme';
import { useClientOnlyValue } from '../../../components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  color: string;
}) {
  return <FontAwesome5 size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#fff',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#fff' : '#4CAE4F',
        },
        tabBarLabelStyle: {
          fontFamily: 'inter-bold'
        },
        // headerShown: useClientOnlyValue(false, true), // Prevent web hydration errors COMMENTING THIS OUT FOR DEMO
        headerShown: false,
        tabBarInactiveTintColor: '#fff'
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarLabel: 'Home',
          tabBarActiveBackgroundColor: '#39913b',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="GroceryList"
        options={{
          tabBarLabel: 'Grocery',
          tabBarActiveBackgroundColor: '#39913b',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="shopping-cart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Pantry"
        options={{
          tabBarLabel: 'Pantry',
          tabBarActiveBackgroundColor: '#39913b',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="archive" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarActiveBackgroundColor: '#39913b',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarActiveBackgroundColor: '#39913b',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Nutrition"
        options={{
          tabBarLabel: 'Nutrition',
          tabBarActiveBackgroundColor: '#39913b',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="nutritionix" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
