import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FocusAwareStatusBar } from '@/components/common/status-bar';
import useUIStore from '@/stores/uiStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SettingCardProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  delay?: number;
}

const SettingCard: React.FC<SettingCardProps> = React.memo(({ title, description, icon, onPress, delay = 0 }) => (
  <Animated.View entering={FadeInDown.delay(delay)}>
    <Pressable 
      onPress={onPress}
      className="bg-white p-5 rounded-2xl shadow-lg border border-herb-divider/50 mb-4 active:bg-herb-surface/50"
    >
      <View className="flex-row items-start">
        <View className="w-12 h-12 bg-herb-primary/10 rounded-xl items-center justify-center">
          <MaterialIcons name={icon} size={24} color="#3E6643" />
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-lg font-poppins-semibold text-herb-primaryDark">{title}</Text>
          <Text className="text-sm font-poppins text-herb-muted mt-0.5">{description}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#A0AEC0" />
      </View>
    </Pressable>
  </Animated.View>
));
SettingCard.displayName = "SettingCard";

export default function VendorSettingsScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const showAlert = useUIStore(state => state.showAlert);

  const handleComingSoon = (feature: string) => {
    showAlert({
      title: "Coming Soon", 
      message: `${feature} will be available soon.`, 
      type: 'info', 
      buttons: [{text: "OK"}]
    });
  };

  const settingGroups = [
    {
      title: "Store Management",
      items: [
        { 
          title: 'Store Profile', 
          description: 'Manage your store name, description, logo, and more',
          icon: 'store' as const,
          onPress: () => handleComingSoon("Store profile editing")
        },
        { 
          title: 'Business Hours', 
          description: 'Set your operating hours and availability',
          icon: 'schedule' as const,
          onPress: () => handleComingSoon("Business hours management")
        }
      ]
    },
    {
      title: "Financial",
      items: [
        { 
          title: 'Payment Settings', 
          description: 'Configure payment methods and payout preferences',
          icon: 'credit-card' as const,
          onPress: () => handleComingSoon("Payment settings")
        },
        { 
          title: 'Tax Information', 
          description: 'Manage tax rates and documentation',
          icon: 'receipt-long' as const,
          onPress: () => handleComingSoon("Tax information management")
        }
      ]
    },
    {
      title: "Shipping & Delivery",
      items: [
        { 
          title: 'Shipping Options', 
          description: 'Set up delivery methods and shipping rates',
          icon: 'local-shipping' as const,
          onPress: () => handleComingSoon("Shipping options")
        },
        { 
          title: 'Service Areas', 
          description: 'Define your delivery zones and restrictions',
          icon: 'map' as const,
          onPress: () => handleComingSoon("Service area management")
        }
      ]
    },
    {
      title: "Account & Security",
      items: [
        { 
          title: 'Account Security', 
          description: 'Update password and security settings',
          icon: 'security' as const,
          onPress: () => handleComingSoon("Security settings")
        },
        { 
          title: 'Notifications', 
          description: 'Customize your notification preferences',
          icon: 'notifications' as const,
          onPress: () => handleComingSoon("Notification settings")
        }
      ]
    }
  ];

  return (
    <>
    <FocusAwareStatusBar />
    <View style={{ flex: 1, paddingTop: top }} className="bg-herb-surface-alt">
      <View className="px-5 pt-6 pb-4 bg-white shadow-sm">
        <Text className="text-3xl font-poppins-bold text-herb-primaryDark">Settings</Text>
        <Text className="text-herb-muted font-poppins mt-1">Manage your vendor account</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {settingGroups.map((group, groupIndex) => (
          <View key={group.title} className="mb-8">
            <Text className="text-lg font-poppins-semibold text-herb-primaryDark mb-4 px-1">
              {group.title}
            </Text>
            {group.items.map((item, index) => (
              <SettingCard 
                key={item.title}
                {...item}
                delay={((groupIndex * group.items.length) + index) * 100}
              />
            ))}
          </View>
        ))}

        <Pressable
          onPress={() => router.replace('/(tabs)/profile')} 
          className="mt-4 bg-white border-2 border-herb-primary flex-row items-center justify-center py-4 px-5 rounded-2xl shadow-md active:bg-herb-surface"
        >
          <MaterialIcons name="arrow-back" size={20} color="#2B4D3F" />
          <Text className="text-herb-primary font-poppins-semibold text-lg ml-2">
            Back to User Profile
          </Text>
        </Pressable>
      </ScrollView>
    </View>
    </>
  );
}
