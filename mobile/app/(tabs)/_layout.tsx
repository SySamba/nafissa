import { useCallback, useEffect, useState } from 'react';
import { Redirect, Tabs, useRouter, useSegments } from 'expo-router';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';

function TabIcon(props: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  return (
    <Ionicons
      size={24}
      name={props.name}
      color={props.focused ? Colors.light.primary : Colors.light.tabIconDefault}
    />
  );
}

function NotificationBell() {
  const router = useRouter();
  const segments = useSegments();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<{ count: number }>('/notifications/unread-count');
      setCount(Number(data?.count) || 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 20000);
    return () => clearInterval(t);
  }, [refresh, segments]);

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      hitSlop={10}
      style={{ marginRight: 16, padding: 4 }}>
      <Ionicons name="notifications-outline" size={23} color={Colors.light.primary} />
      {count > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            minWidth: 16,
            height: 16,
            paddingHorizontal: 3,
            borderRadius: 8,
            backgroundColor: Colors.light.danger,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
            {count > 9 ? '9+' : count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function HeaderBrand() {
  return (
    <View accessible accessibilityRole="header">
      <Image
        source={require('@/assets/images/logo-nafissa.png')}
        style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.95)', padding: 7 }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (!loading && !user) return <Redirect href="/login" />;

  const brandHeader = {
    headerTitle: () => <HeaderBrand />,
    headerTitleAlign: 'center' as const,
    headerRight: () => <NotificationBell />,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.light.surface,
        },
        headerTintColor: Colors.light.text,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 84 : 64,
          backgroundColor: Colors.light.surface,
          borderTopColor: Colors.light.border,
        },
        ...brandHeader,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: '',
          tabBarLabel: 'Services',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: '',
          tabBarLabel: 'Réservations',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
