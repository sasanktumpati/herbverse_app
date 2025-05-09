import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useAuthStore, useUIStore } from '@/stores';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Image, 
  Keyboard, 
  KeyboardAvoidingView, 
  Platform, 
  Text, 
  TextInput, 
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
import { LinearGradient } from 'expo-linear-gradient';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isSigningUpAsVendor, setIsSigningUpAsVendor] = useState(false);

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
    clearAuthError('signUp');
    return () => {
      clearAuthError('signUp');
    };
  }, [clearAuthError]);

  
  React.useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  
  useEffect(() => {
    if (errors.signUp) {
      errorShake.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [errors.signUp, errorShake]);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      errorShake.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
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
    
    Keyboard.dismiss();
    await signUpWithEmail(email, password, name, isSigningUpAsVendor);
  };
  
  const handleSocialSignup = (provider: string) => {
    showAlert({ 
      title: 'Coming Soon!', 
      message: `Sign up with ${provider} will be available soon.`, 
      type: 'info', 
      buttons: [{ text: 'OK' }] 
    });
  };

  const isLoading = loadingStates.signUp;
  const error = errors.signUp;

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
              Create Account
            </Text>
            <Text className="text-base text-herb-muted mb-2">
              Join HerbVerse today!
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
            <View className="flex-row items-center justify-center mb-6">
              <TouchableOpacity
                onPress={() => setIsSigningUpAsVendor(false)}
                className={`py-2 px-4 rounded-lg mr-2 ${!isSigningUpAsVendor ? 'bg-herb-primary' : 'bg-gray-200'}`}
              >
                <Text className={`${!isSigningUpAsVendor ? 'text-white' : 'text-gray-700'} font-poppins-medium`}>Sign up as User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsSigningUpAsVendor(true)}
                className={`py-2 px-4 rounded-lg ${isSigningUpAsVendor ? 'bg-herb-secondary' : 'bg-gray-200'}`}
              >
                <Text className={`${isSigningUpAsVendor ? 'text-white' : 'text-gray-700'} font-poppins-medium`}>Sign up as Vendor</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-herb-textPrimary mb-2 ml-1">Full Name</Text>
              <View className="flex-row items-center border border-herb-divider rounded-xl px-4 h-14 bg-herb-bgInput focus-within:border-herb-primary transition-all duration-150">
                <MaterialIcons name="person" size={20} color="#5F6F64" className="mr-2" />
                <TextInput
                  className="flex-1 text-base text-herb-textPrimary py-3"
                  placeholder="Your Name"
                  placeholderTextColor="#A0AEC0"
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                  autoComplete="name"
                  textContentType="name"
                  style={{ backgroundColor: 'transparent' }}
                  selectionColor="#5F6F64"
                />
              </View>
            </View>

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
                  placeholder="Create a password"
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  autoComplete="password-new"
                  textContentType="newPassword"
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
            </View>

            {error && (
              <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex-row items-center mt-2">
                <MaterialIcons name="error-outline" size={18} color="#DC2626" />
                <Text className="text-red-700 ml-2 flex-1 text-sm">{error.message}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.85}
              className={`bg-herb-primary h-14 rounded-xl justify-center items-center shadow-md mb-4 ${isLoading ? 'opacity-70' : ''}`}
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
                <Text className="text-white text-lg font-semibold tracking-wide">Create Account</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="px-2 text-herb-muted text-sm">or continue with</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>
            <View className="flex-row justify-center space-x-4 mb-4">
              <TouchableOpacity
                onPress={() => handleSocialSignup('Google')}
                className="w-12 h-12 bg-white rounded-full justify-center items-center shadow-md"
              >
                <AntDesign name="google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSocialSignup('Apple')}
                className="w-12 h-12 bg-white rounded-full justify-center items-center shadow-md"
              >
                <AntDesign name="apple1" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-2">
              <Text className="text-herb-muted text-base">Already have an account? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity disabled={isLoading} activeOpacity={0.7}>
                  <Text className="text-herb-primary font-semibold text-base underline">Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}