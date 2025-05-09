import { MaterialIcons, AntDesign } from '@expo/vector-icons';
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const errorShake = useSharedValue(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  
  useEffect(() => {
    clearAuthError('signIn');
    return () => {
      clearAuthError('signIn');
    };
  }, [clearAuthError]);

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

  const handleSocialLogin = (provider: string) => {
    showAlert({ 
      title: 'Coming Soon!', 
      message: `${provider} login will be available soon.`, 
      type: 'info', 
      buttons: [{ text: 'OK' }] 
    });
  };

  const isLoading = loadingStates.signIn;
  const error = errors.signIn;

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }]
  }));

  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#f8fafc', '#e6f4ea']}
        style={{ flex: 1, paddingTop: top, paddingBottom: bottom }}
      >
        <KeyboardAvoidingView 
          behavior="padding"
          keyboardVerticalOffset={top + 24}
          className="flex-1 justify-center px-4"
        >
          <View className="items-center mb-8">
            <Image
              source={require('../../../assets/images/icon-black.png')}
              className="w-24 h-24 mb-4"
              resizeMode="contain"
              style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
            />
            <Text className="text-4xl font-extrabold text-herb-primaryDark mb-1 tracking-tight">
              Welcome Back
            </Text>
            <Text className="text-base text-herb-muted mb-2">
              Login to your HerbVerse account
            </Text>
          </View>
          <Animated.View 
            style={[
              formAnimatedStyle, 
              { 
                backgroundColor: '#fff', 
                borderRadius: 20, 
                padding: 24, 
                shadowColor: '#000', 
                shadowOpacity: 0.07, 
                shadowRadius: 12, 
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
                marginBottom: 24,
              }
            ]}
            className="w-full"
          >
            <View className="mb-6">
              <Text className="text-sm font-semibold text-herb-textPrimary mb-2 ml-1">Email</Text>
              <View className="flex-row items-center border border-herb-divider rounded-xl px-4 h-14 bg-herb-bgInput focus-within:border-herb-primary transition-all duration-150">
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
                  autoComplete="email"
                  textContentType="emailAddress"
                  style={{ backgroundColor: 'transparent' }}
                  selectionColor="#5F6F64"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-herb-textPrimary mb-2 ml-1">Password</Text>
              <View className="flex-row items-center border border-herb-divider rounded-xl px-4 h-14 bg-herb-bgInput focus-within:border-herb-primary transition-all duration-150">
                <MaterialIcons name="lock" size={20} color="#5F6F64" className="mr-2" /> 
                <TextInput
                  className="flex-1 text-base text-herb-textPrimary py-3"
                  placeholder="••••••••"
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  autoComplete="password"
                  textContentType="password"
                  style={{ backgroundColor: 'transparent' }}
                  selectionColor="#5F6F64"
                />
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
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
                activeOpacity={0.7}
              >
                <Text className="text-herb-primary text-sm font-medium">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View className="flex-row items-center bg-red-50 border border-red-200 rounded-lg p-3 mb-5 mt-2">
                <MaterialIcons name="error-outline" size={18} color="#DC2626" /> 
                <Text className="text-red-700 ml-2 flex-1 text-sm">{error.message}</Text>
              </View>
            )}

            <TouchableOpacity
              className={`bg-herb-primary h-14 rounded-xl justify-center items-center shadow-md mb-4 ${isLoading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
              style={{
                shadowColor: '#5F6F64',
                shadowOpacity: 0.13,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white font-semibold text-lg tracking-wide">Login</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="px-2 text-herb-muted text-sm">or continue with</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>
            <View className="flex-row justify-center space-x-4 mb-4">
              <TouchableOpacity
                onPress={() => handleSocialLogin('Google')}
                className="w-12 h-12 bg-white rounded-full justify-center items-center shadow-md"
              >
                <AntDesign name="google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSocialLogin('Apple')}
                className="w-12 h-12 bg-white rounded-full justify-center items-center shadow-md"
              >
                <AntDesign name="apple1" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-2">
              <Text className="text-herb-muted text-base">Don&apos;t have an account? </Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity disabled={isLoading} activeOpacity={0.7}>
                  <Text className="text-herb-primary font-semibold text-base underline">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}