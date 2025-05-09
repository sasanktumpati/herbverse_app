import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../../../src/stores/authStore';
import useUIStore from '../../../src/stores/uiStore';

export default function LoginScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const showAlert = useUIStore((state) => state.showAlert);
  const { 
    signInWithEmail, 
    loadingStates,
    errors, 
    clearAuthError, 
    user 
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const logoScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const errorShake = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        headerTranslateY.value = withTiming(-60, { duration: 300 });
        logoScale.value = withTiming(0.8, { duration: 300 });
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        headerTranslateY.value = withTiming(0, { duration: 300 });
        logoScale.value = withTiming(1, { duration: 300 });
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [headerTranslateY, logoScale]);
  
  useEffect(() => {
    clearAuthError('signIn');
    
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.elastic(1) });
    formOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    
    return () => {
      clearAuthError('signIn');
    };
  }, [clearAuthError, formOpacity, logoScale]);

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);
  
  useEffect(() => {
    if (errors.signIn) {
      errorShake.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [errors.signIn, errorShake]);

  const handleLogin = async () => {
    if (!email || !password) {
      errorShake.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      showAlert({ title: 'Missing Fields', message: 'Please enter both email and password.', type: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    
    Keyboard.dismiss();
    await signInWithEmail(email, password);
  };

  const isLoading = loadingStates.signIn;
  const error = errors.signIn;

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value }
    ]
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [
      { translateX: errorShake.value }
    ]
  }));
  
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: headerTranslateY.value }
    ]
  }));

  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#FFFFFF', '#F5F8F5']}
        style={{ flex: 1, paddingTop: top, paddingBottom: bottom }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center px-6"
        >
          <Animated.View style={headerAnimatedStyle} className="items-center mb-8">
            <Animated.View style={logoAnimatedStyle}>
              <Image
                source={require('../../../assets/images/icon-black.png')}
                className="w-24 h-24 mb-4"
                resizeMode="contain"
              />
            </Animated.View>
            <Text className="text-3xl font-bold text-herb-textPrimary mb-2">Welcome Back</Text>
            <Text className="text-base text-herb-muted">Login to your HerbVerse account</Text>
          </Animated.View>

          <Animated.View style={formAnimatedStyle} className="w-full">
            <View className="mb-5">
              <Text className="text-sm font-medium text-herb-textPrimary mb-2 ml-1">Email</Text>
              <View className="flex-row items-center bg-white border border-herb-divider rounded-xl px-4 h-14">
                <MaterialIcons name="email" size={20} color="#5F6F64" className="mr-2" />
                <TextInput
                  className="flex-1 text-base text-herb-textPrimary py-3"
                  placeholder="you@example.com"
                  placeholderTextColor="#A0AEC0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-herb-textPrimary mb-2 ml-1">Password</Text>
              <View className="flex-row items-center bg-white border border-herb-divider rounded-xl px-4 h-14">
                <MaterialIcons name="lock" size={20} color="#5F6F64" className="mr-2" /> 
                <TextInput
                  className="flex-1 text-base text-herb-textPrimary py-3"
                  placeholder="••••••••"
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons 
                    name={showPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color="#5F6F64" 
                  />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                className="self-end mt-2"
                onPress={() => showAlert({ title: "Forgot Password", message: "Forgot password feature coming soon!", type: 'info', buttons: [{ text: 'OK' }] })}
              >
                <Text className="text-herb-primary text-sm font-medium">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View className="flex-row items-center bg-red-100 rounded-lg p-3 mb-5">
                <MaterialIcons name="error-outline" size={16} color="#DC2626" /> 
                <Text className="text-red-700 ml-2 flex-1">{error.message}</Text>
              </View>
            )}

            <TouchableOpacity
              className={`bg-herb-primary h-14 rounded-xl justify-center items-center shadow-md mb-6 active:bg-herb-primaryDark ${isLoading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-lg">Login</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="text-herb-muted text-base">Don&apos;t have an account? </Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className="text-herb-primary font-semibold text-base">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}