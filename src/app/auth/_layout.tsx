import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import useAuthStore from '../../stores/authStore';
import CustomAlertDialog from '../../../src/components/ui/CustomAlertDialog';

export default function AuthLayout() {
  const { user, initializing } = useAuthStore();
  
  if (!initializing && user) {
    return <Redirect href="/" />;
  }
  
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { 
          backgroundColor: '#F5F6E7' 
        },
        animation: 'slide_from_right',
        animationDuration: 200,
      }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
      <CustomAlertDialog />
    </>
  );
}