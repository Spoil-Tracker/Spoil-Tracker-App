//Expo will use this stack to figure out how, when, and if a certain page needs a header and also requires an additional back button.
import { Stack } from 'expo-router/stack';
import { Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();

  return (
    // Standard stack component; all params listed here are mainly to edit/stylize the visual components attached to the header
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
