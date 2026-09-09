import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import Colors from '@/constants/Colors';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const navLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.secondary,
  },
};

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // L'app est conçue en thème clair : on force le mode clair pour garantir une
  // lisibilité parfaite (sinon, en mode sombre du téléphone, le fond devient
  // foncé alors que les contenus restent clairs → texte illisible).
  return (
    <AuthProvider>
      <ThemeProvider value={navLight}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: Colors.light.background },
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="booking/[id]"
            options={{
              headerShown: true,
              title: 'Réservation',
              headerBackTitle: 'Retour',
              headerTintColor: Colors.light.primary,
              headerStyle: { backgroundColor: Colors.light.surface },
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            }}
          />
          <Stack.Screen
            name="service/[id]"
            options={{
              headerShown: true,
              title: 'Service',
              headerBackTitle: 'Retour',
              headerTintColor: Colors.light.primary,
              headerStyle: { backgroundColor: Colors.light.surface },
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            }}
          />
          <Stack.Screen
            name="service/create"
            options={{
              headerShown: true,
              title: 'Nouveau service',
              headerBackTitle: 'Retour',
              headerTintColor: Colors.light.primary,
              headerStyle: { backgroundColor: Colors.light.surface },
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            }}
          />
          <Stack.Screen
            name="service/edit/[id]"
            options={{
              headerShown: true,
              title: 'Modifier',
              headerBackTitle: 'Retour',
              headerTintColor: Colors.light.primary,
              headerStyle: { backgroundColor: Colors.light.surface },
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              headerShown: true,
              title: 'Notifications',
              headerBackTitle: 'Retour',
              headerTintColor: Colors.light.primary,
              headerStyle: { backgroundColor: Colors.light.surface },
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            }}
          />
          <Stack.Screen
            name="profile/edit"
            options={{
              headerShown: true,
              title: 'Modifier le profil',
              headerBackTitle: 'Retour',
              headerTintColor: Colors.light.primary,
              headerStyle: { backgroundColor: Colors.light.surface },
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            }}
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
