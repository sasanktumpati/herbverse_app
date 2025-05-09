import { useAuthStore, useUIStore } from '@/stores';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const showAlert = useUIStore((state) => state.showAlert);
  const { 
    signUpWithEmail, 
    loadingStates, 
    errors, 
    clearAuthError, 
    user 
  } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    clearAuthError('signUp');
    return () => {
      clearAuthError('signUp');
    };
  }, [clearAuthError]);

  React.useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      showAlert({ title: 'Validation Error', message: 'Please fill in all fields.', type: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    
    if (password.length < 6) {
      showAlert({ title: 'Invalid Password', message: 'Password must be at least 6 characters long.', type: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert({ title: 'Invalid Email', message: 'Please enter a valid email address.', type: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    
    await signUpWithEmail(email, password, name);
  };

  const isLoading = loadingStates.signUp;
  const error = errors.signUp;

  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View 
        style={{ paddingTop: top, paddingBottom: bottom }} 
        className="flex-1 bg-herb-background justify-center px-6"
      >
        <View className="items-center mb-8">
          <Image
            source={require('../../../assets/images/icon-black.png')}
            className="w-24 h-24 mb-4"
            resizeMode="contain"
          />
          <Text className="text-4xl font-bold text-herb-primaryDark">Create Account</Text>
          <Text className="text-lg text-herb-muted mt-2">Join HerbVerse today!</Text>
        </View>

        <View className="mb-5">
          <Text className="text-sm font-medium text-herb-textPrimary mb-1.5 ml-1">Full Name</Text>
          <TextInput
            className="bg-herb-surface border border-herb-divider text-herb-textPrimary text-lg rounded-2xl px-4 py-4 focus:border-herb-primary focus:ring-1 focus:ring-herb-primary"
            placeholder="Your Name"
            placeholderTextColor="#A0AEC0"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>

        <View className="mb-5">
          <Text className="text-sm font-medium text-herb-textPrimary mb-1.5 ml-1">Email</Text>
          <TextInput
            className="bg-herb-surface border border-herb-divider text-herb-textPrimary text-lg rounded-2xl px-4 py-4 focus:border-herb-primary focus:ring-1 focus:ring-herb-primary"
            placeholder="you@example.com"
            placeholderTextColor="#A0AEC0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-herb-textPrimary mb-1.5 ml-1">Password</Text>
          <TextInput
            className="bg-herb-surface border border-herb-divider text-herb-textPrimary text-lg rounded-2xl px-4 py-4 focus:border-herb-primary focus:ring-1 focus:ring-herb-primary"
            placeholder="Create a password (min. 6 characters)"
            placeholderTextColor="#A0AEC0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {error && (
          <View className="mb-4 p-3 bg-herb-error/20 rounded-md">
            <Text className="text-herb-error text-center">{error.message}</Text>
          </View>
        )}

        <Pressable
          onPress={handleSignup}
          disabled={isLoading}
          className={`bg-herb-primary py-4 rounded-2xl shadow-md items-center ${isLoading ? 'opacity-70' : 'active:bg-herb-primaryDark'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-lg font-semibold">Create Account</Text>
          )}
        </Pressable>

        <View className="flex-row justify-center mt-8">
          <Text className="text-herb-muted">Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <Pressable disabled={isLoading}>
              <Text className="text-herb-primary font-semibold">Login</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </>
  );
}