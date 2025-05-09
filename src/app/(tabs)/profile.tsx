import { FocusAwareStatusBar } from '@/components/common/status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image, Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../../../src/stores/authStore';
import useUIStore from '../../../src/stores/uiStore';

export default function ProfileScreen() {
  const { bottom } = useSafeAreaInsets();
  const { user, profile, signOut, loadingStates } = useAuthStore();
  const router = useRouter();
  const showAlert = useUIStore((state) => state.showAlert);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (e: any) {
      showAlert({
        title: 'Logout Failed',
        message: e.message || 'Please try again.',
        type: 'error',
        buttons: [{ text: 'OK' }]
      });
    }
  };

  const confirmLogout = () => {
    showAlert({
      title: 'Log Out',
      message: 'Are you sure you want to log out of your account?',
      type: 'confirmation',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive', 
          onPress: handleLogout,
          isLoading: loadingStates.signOut
        }
      ]
    });
  };
  
  const menuItems = [
    { 
      icon: 'receipt-long', 
      label: 'My Orders', 
      onPress: () => router.push('/(tabs)/orders'),
      color: '#3E6643' 
    },
    { 
      icon: 'favorite', 
      label: 'Favorites',
      onPress: () => showAlert({ title: 'Coming Soon', message: 'Favorites feature will be added soon', type: 'info', buttons: [{text: 'OK'}] }),
      color: '#E53935' 
    },
    { 
      icon: 'notifications', 
      label: 'Notifications', 
      onPress: () => showAlert({ title: 'Coming Soon', message: 'Notifications will be added soon', type: 'info', buttons: [{text: 'OK'}] }),
      color: '#FF9800' 
    },
    { 
      icon: 'credit-card', 
      label: 'Payment Methods', 
      onPress: () => showAlert({ title: 'Coming Soon', message: 'Payment methods will be added soon', type: 'info', buttons: [{text: 'OK'}] }),
      color: '#1976D2' 
    },
    { 
      icon: 'location-on', 
      label: 'Address Book', 
      onPress: () => showAlert({ title: 'Coming Soon', message: 'Address book will be added soon', type: 'info', buttons: [{text: 'OK'}] }),
      color: '#7B1FA2' 
    },
    { 
      icon: 'help', 
      label: 'Help & Support', 
      onPress: () => showAlert({ title: 'Coming Soon', message: 'Help & support will be added soon', type: 'info', buttons: [{text: 'OK'}] }),
      color: '#00897B' 
    },
  ];

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-herb-background">
        <MaterialIcons name="account-circle" size={64} color="#3E6643" />
        <Text className="text-herb-muted text-lg font-poppins">Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <FocusAwareStatusBar/>
      <View style={{ flex: 1}} className="bg-herb-surface">
        <View className="px-5 pt-5 pb-4 bg-white shadow-sm">
          <Text className="text-3xl font-poppins-bold text-herb-primaryDark">My Profile</Text>
        </View>
        
        <ScrollView
          contentContainerStyle={{ paddingBottom: bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['rgba(78, 124, 95, 0.8)', 'rgba(62, 102, 67, 0.9)']}
            className="rounded-b-3xl px-6 pt-6 pb-8"
          >
            <View className="items-center">
              <View className="mb-4">
                {profile?.photoURL ? (
                  <Image 
                    source={{ uri: profile.photoURL }} 
                    className="w-28 h-28 rounded-full border-4 border-white"
                  />
                ) : (
                  <View className="w-28 h-28 rounded-full bg-white items-center justify-center border-4 border-herb-primaryLight">
                    <Text className="text-5xl text-herb-primary font-light">
                      {profile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  className="absolute right-0 bottom-0 bg-white w-9 h-9 rounded-full items-center justify-center shadow-md"
                  onPress={() => showAlert({ title: 'Coming Soon', message: 'Profile photo upload will be added soon', type: 'info', buttons: [{text: 'OK'}] })}
                >
                  <MaterialIcons name="camera-alt" size={18} color="#3E6643" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-white font-poppins-bold text-2xl">
                {profile?.displayName || 'User'}
              </Text>
              
              <Text className="text-white/90 font-poppins mt-1">
                {profile?.email || user?.email || 'No email available'}
              </Text>
              
            </View>
          </LinearGradient>
          
          <View className="flex-row px-4 -mt-8">
            <View className="flex-1 mr-2 bg-white rounded-xl p-4 shadow-lg border border-herb-divider/70">
              <View className="rounded-lg bg-amber-100 w-11 h-11 items-center justify-center mb-2.5">
                <MaterialIcons name="local-shipping" size={20} color="#F59E0B" />
              </View>
              <Text className="text-lg font-poppins-bold text-herb-primaryDark">0</Text>
              <Text className="text-herb-muted font-poppins text-sm leading-tight">Active Orders</Text>
            </View>
            
            <View className="flex-1 ml-2 bg-white rounded-xl p-4 shadow-lg border border-herb-divider/70">
              <View className="rounded-lg bg-green-100 w-11 h-11 items-center justify-center mb-2.5">
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
              </View>
              <Text className="text-lg font-poppins-bold text-herb-primaryDark">0</Text>
              <Text className="text-herb-muted font-poppins text-sm leading-tight">Completed</Text>
            </View>
          </View>
          
          <View className="mt-6 mx-4 bg-white rounded-xl overflow-hidden shadow-lg border border-herb-divider/70">
            {menuItems.map((item, index) => (
              <React.Fragment key={item.label}>
                <Pressable 
                  onPress={item.onPress}
                  className="flex-row items-center py-4 px-5 active:bg-herb-surface/50"
                >
                  <View 
                    className="w-10 h-10 rounded-lg items-center justify-center mr-4"
                    style={{ backgroundColor: `${item.color}1A` }}
                  >
                    <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={22} color={item.color} />
                  </View>
                  <Text className="flex-1 text-base font-poppins-medium text-herb-textPrimary">{item.label}</Text>
                  <MaterialIcons name="chevron-right" size={24} color="#A0AEC0" />
                </Pressable>
                
                {index < menuItems.length - 1 && (
                  <View className="h-[1px] bg-herb-divider ml-16 mr-5" />
                )}
              </React.Fragment>
            ))}
          </View>
          
          <View className="mt-8 mx-4 mb-4">
            <Pressable
              onPress={confirmLogout}
              disabled={loadingStates.signOut}
              className="flex-row items-center justify-center bg-red-500 py-3.5 rounded-xl active:bg-red-600 shadow-md"
            >
              <MaterialIcons name="logout" size={20} color="white" />
              <Text className="text-white font-poppins-semibold text-base ml-2.5">
                {loadingStates.signOut ? 'Logging out...' : 'Log Out'}
              </Text>
            </Pressable>
          </View>
          
          <View className="items-center mb-6 mt-2">
            <Text className="text-herb-muted font-poppins text-xs">
              HerbVerse App v1.0.0
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}