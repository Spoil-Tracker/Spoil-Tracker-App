import { Stack } from 'expo-router/stack';
import { Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAE4F',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'inter-bold',
        },
        headerTitleAlign: 'center',  // Center the title
        headerTitle: () => (
          <TouchableOpacity onPress={() => {while (router.canGoBack()) {router.back(); }router.replace('./Home')}}>
            <Image
              source={require('../../assets/images/logo_white.png')}  // Path to your logo
              style={{ width: 180, height: 40, marginLeft: 10 }}  // Adjust the size and margin as needed
            />
          </TouchableOpacity>
        ),
      }}
    >
    <Stack.Screen name = "ListUI"/>
    <Stack.Screen name = "PantryUI"/>
    </Stack>
  );
}
