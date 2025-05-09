import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useAuthStore from '../../stores/authStore';
import { FocusAwareStatusBar } from '@/components/common/status-bar';
import useUIStore from '@/stores/uiStore';

export default function VendorSettingsScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuthStore();
  const showAlert = useUIStore(state => state.showAlert);

  const settingsOptions = [
    { 
      title: 'Store Profile', 
      icon: 'store', 
      onPress: () => showAlert({title: "Coming Soon", message: "Store profile editing will be available soon.", type: 'info', buttons: [{text: "OK"}]}),
      description: 'Manage your store name, description, logo, etc.'
    },
    { 
      title: 'Payment & Payouts', 
      icon: 'credit-card', 
      onPress: () => showAlert({title: "Coming Soon", message: "Payment and payout settings will be available soon.", type: 'info', buttons: [{text: "OK"}]}),
      description: 'Configure how you receive payments.'
    },
    { 
      title: 'Shipping Options', 
      icon: 'local-shipping', 
      onPress: () => showAlert({title: "Coming Soon", message: "Shipping options will be available soon.", type: 'info', buttons: [{text: "OK"}]}),
      description: 'Set up your shipping methods and rates.'
    },
    { 
      title: 'Notifications', 
      icon: 'notifications', 
      onPress: () => showAlert({title: "Coming Soon", message: "Notification settings will be available soon.", type: 'info', buttons: [{text: "OK"}]}),
      description: 'Manage your vendor-specific notifications.'
    },
    { 
      title: 'Account Security', 
      icon: 'security', 
      onPress: () => showAlert({title: "Coming Soon", message: "Account security settings will be available soon.", type: 'info', buttons: [{text: "OK"}]}),
      description: 'Change password, enable 2FA.'
    },
  ];

  return (
    <>
    <FocusAwareStatusBar />
    <View style={{ flex: 1, paddingTop: top }} className="bg-herb-surface-alt">
      <View className="px-5 pt-5 pb-4 bg-white shadow-sm">
        <Text className="text-3xl font-poppins-bold text-herb-primaryDark">Vendor Settings</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-xl shadow-lg border border-herb-divider/70 overflow-hidden">
          {settingsOptions.map((option, index) => (
            <React.Fragment key={option.title}>
              <Pressable 
                onPress={option.onPress}
                className="flex-row items-center p-4 active:bg-herb-surface/50"
              >
                <View className="w-10 h-10 bg-herb-primary/10 rounded-lg items-center justify-center mr-4">
                  <MaterialIcons name={option.icon as any} size={22} color="#3E6643" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-poppins-medium text-herb-textPrimary">{option.title}</Text>
                  <Text className="text-xs font-poppins text-herb-muted mt-0.5" numberOfLines={1}>{option.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#A0AEC0" />
              </Pressable>
              {index < settingsOptions.length - 1 && (
                <View className="h-px bg-herb-divider ml-[72px]" /> 
              )}
            </React.Fragment>
          ))}
        </View>

        <View className="mt-6">
            <Pressable
                onPress={() => router.replace('/(tabs)/profile')} 
                className="bg-herb-secondary flex-row items-center justify-center py-3.5 px-4 rounded-xl shadow-md active:bg-herb-secondaryDark"
            >
                <MaterialIcons name="arrow-back" size={20} color="white" />
                <Text className="text-white font-poppins-semibold text-base ml-2">Back to User Profile</Text>
            </Pressable>
        </View>
      </ScrollView>
    </View>
    </>
  );
}
