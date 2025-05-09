import { Tabs } from 'expo-router';
import React from 'react';
import TabBar from '../../components/tabbar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'Poppins_500Medium',
          fontSize: 12
        }
      }}
    >
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="explore" 
        options={{
          title: 'Explore',
        }}
      />
      <Tabs.Screen
        name="cart" 
        options={{
          title: 'Cart',
        }}
      />
      <Tabs.Screen
        name="orders" 
        options={{
          title: 'Orders',
        }}
      />
      <Tabs.Screen
        name="profile" 
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}