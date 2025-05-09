import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const { top, bottom } = useSafeAreaInsets();
  
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const logoY = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
      
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  });

  return (
    <LinearGradient
      colors={['#4E7C5F', '#2B4D3F']}
      className="flex-1"
      style={{ paddingTop: top, paddingBottom: bottom }}
    >
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center">
        <Animated.View
          className="items-center justify-center"
          style={{
            opacity: fadeIn,
            transform: [
              { scale },
              { translateY: logoY },
            ],
          }}
        >
          <Image 
            source={require('../../assets/images/icon-white.png')}
            className="w-36 h-36"
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          className="items-center mt-6"
          style={{
            opacity: textOpacity,
          }}
        >
          <Text className="text-white text-4xl font-bold tracking-wide">HerbVerse</Text>
          <Text className="text-white/80 text-lg mt-2">Natural wellness. Simplified.</Text>
        </Animated.View>
        
        <Animated.View 
          className="mt-12"
          style={{ opacity: textOpacity }}
        >
          <View className="flex-row space-x-2">
            {[0, 1, 2].map((i) => (
              <LoadingDot key={i} delay={i * 300 + 600} />
            ))}
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

function LoadingDot({ delay = 0 }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    const pulse = Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);

    setTimeout(() => {
      Animated.loop(pulse).start();
    }, delay);
    
    return () => {
      pulse.stop();
    };
  });

  return (
    <Animated.View
      className="h-3 w-3 rounded-full bg-white"
      style={{
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}