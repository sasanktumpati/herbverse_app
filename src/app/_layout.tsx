import "../global.css";
import { Slot, Redirect, useSegments } from "expo-router";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect } from 'react';
import SplashScreen from '../../src/screens/splashscreen';
import useAuthStore from '../../src/stores/authStore';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreenModule from 'expo-splash-screen';
import CustomAlertDialog from '../../src/components/ui/CustomAlertDialog';

SplashScreenModule.preventAutoHideAsync();
function InnerRootLayout() {
  const segments = useSegments();
  const { top } = useSafeAreaInsets();
  const {
    user,
    initializing,
    loadingStates,
    initializeAuthListener,
    cleanup
  } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  
  useEffect(() => {
    initializeAuthListener();
    return () => cleanup();
  }, [initializeAuthListener, cleanup]);

  React.useEffect(() => {
    if (fontsLoaded) {     
      SplashScreenModule.hideAsync();
    }
  }, [fontsLoaded]);

  if (segments[0] === 'auth') {
    return <Slot />;
  }

  if (initializing || loadingStates.auth || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1 }}>
        <Text className="text-herb-muted text-base font-poppins text-center mb-2">Loading the app...</Text>
        <SplashScreen />
      </View>
    );
  }

  if (fontError) {
    console.error("Font loading error:", fontError);
    return (
      <View style={{ flex: 1 }}>
        <Text className="text-herb-error text-lg font-poppins-medium text-center mb-2">
          Error Loading App
        </Text>
        <Text className="text-herb-muted text-base font-poppins text-center mb-4">
          {fontError.message}
        </Text>
        <Text className="text-white font-poppins-semibold text-base">Retry</Text>
      </View>
    );
  }
 
  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <View
      className="flex-1 bg-herb-background font-poppins-regular"
      style={{ paddingTop: top }}
    >
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <Slot />
      <CustomAlertDialog />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      
      SplashScreenModule.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <InnerRootLayout />
    </SafeAreaProvider>
  );
}
