import { Stack, Redirect, Tabs } from 'expo-router';
import React from 'react';
import useAuthStore from '../../stores/authStore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VendorLayout() {
  const { user, isVendor, initializing } = useAuthStore();
  const { top, bottom } = useSafeAreaInsets();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user || !isVendor) {
    return <Redirect href="/(tabs)/profile" />; 
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2B4D3F', 
        tabBarInactiveTintColor: '#8D978F', 
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB', 
          paddingBottom: bottom,
          paddingTop: 8,
          height: 58 + bottom,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: 'My Items',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Incoming Orders',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt-long" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
