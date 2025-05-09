import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import useAuthStore from '../../stores/authStore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

function TabBarIcon({ focused, icon, name }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.1 : 1) }],
  }));

  return (
    <View className="items-center">
      <Animated.View style={animatedStyle}>
        <MaterialIcons 
          name={icon} 
          size={24} 
          color={focused ? '#2B4D3F' : '#8D978F'} 
        />
      </Animated.View>
    </View>
  );
}

export default function VendorLayout() {
  const { user, isVendor, initializing } = useAuthStore();
  const { bottom } = useSafeAreaInsets();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-herb-surface-alt">
        <Text className="text-herb-muted font-poppins">Loading...</Text>
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
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          paddingBottom: bottom,
          paddingTop: 8,
          height: 58 + bottom,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#2B4D3F',
        tabBarInactiveTintColor: '#8D978F',
        tabBarLabelStyle: {
          fontFamily: 'Poppins_500Medium',
          fontSize: 11,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon="dashboard" name="Dashboard" />
          ),
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: 'My Items',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon="inventory-2" name="Items" />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon="receipt-long" name="Orders" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon="settings" name="Settings" />
          ),
        }}
      />
    </Tabs>
  );
}
