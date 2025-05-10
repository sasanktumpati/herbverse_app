import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const { top, bottom } = useSafeAreaInsets();
  
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <LinearGradient
      colors={['#F8FBF7', '#FFFFFF']} 
      className="flex-1"
      style={{ paddingTop: top, paddingBottom: bottom }}
    >
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center">
        <Animated.View
          className="items-center justify-center"
          style={{
            opacity: opacity,
            transform: [{ translateY: translateY }],
          }}
        >
          <Image 
            source={require('../../assets/images/icon.png')} 
            className="w-32 h-32" 
            resizeMode="contain"
          />
          <Text className="text-herb-primaryDark text-4xl font-bold tracking-wide mt-6">
            HerbVerse
          </Text>
          <Text className="text-herb-primary text-lg mt-2 font-poppins">
            Natural wellness. Simplified.
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}