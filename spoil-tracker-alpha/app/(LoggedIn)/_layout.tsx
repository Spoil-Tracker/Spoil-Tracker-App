import { Stack } from 'expo-router/stack';
import { Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#4CAE4F' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: 'inter-bold' },
        headerTitleAlign: 'center',
        headerTitle: () => (
          <TouchableOpacity
            onPress={() => {
              while (router.canGoBack()) {
                router.back();
              }
              router.replace('/(LoggedIn)/(tabs)/Home'); // Correct home navigation
            }}
          >
            <Image
              source={require('../../assets/images/logo_white.png')}
              style={{ width: 180, height: 40, marginLeft: 10 }}
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      <Stack.Screen name="ListUI" />
      <Stack.Screen name="PantryUI" />
    </Stack>
  );
}
