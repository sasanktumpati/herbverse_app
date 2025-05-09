import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useAuthStore from '../../stores/authStore';
import useVendorOrdersStore from '../../stores/vendor/vendorOrdersStore';
import useVendorItemsStore from '../../stores/vendor/vendorItemsStore';
import { FocusAwareStatusBar } from '@/components/common/status-bar';

const StatCard = ({ title, value, icon, color, onPress }) => (
  <Pressable 
    onPress={onPress}
    className="bg-white p-5 rounded-2xl shadow-lg border border-herb-divider/50 flex-1 active:bg-herb-surface/50"
  >
    <View className="flex-row justify-between items-start">
      <Text className="text-herb-muted font-poppins text-xs uppercase tracking-wider">{title}</Text>
      <View className={`w-10 h-10 rounded-full items-center justify-center`} style={{ backgroundColor: color+'15' }}>
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
    </View>
    <Text className="text-4xl font-poppins-bold text-herb-primaryDark mt-2">{value}</Text>
  </Pressable>
);

export default function VendorDashboardScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { vendorOrders, isLoading: ordersLoading } = useVendorOrdersStore();
  const { vendorItems, isLoading: itemsLoading } = useVendorItemsStore();

  const pendingOrders = vendorOrders.filter(o => o.status === 'pending').length;
  const activeItems = vendorItems.filter(i => i.isActive).length;
  const totalSales = vendorOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <>
    <FocusAwareStatusBar />
    <View style={{ flex: 1 }} className="bg-herb-surface-alt">
      <View className="px-5 pt-6 pb-4 bg-white shadow-sm">
        <Text className="text-3xl font-poppins-bold text-herb-primaryDark">Vendor Dashboard</Text>
        <Text className="text-herb-muted font-poppins mt-1">Welcome back, {profile?.displayName || 'Vendor'}!</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between space-x-4 mb-6">
          <StatCard 
            title="Pending Orders" 
            value={ordersLoading ? '...' : pendingOrders} 
            icon="hourglass-top" 
            color="#FF9800" 
            onPress={() => router.push('/vendor/orders?filter=pending')}
          />
          <StatCard 
            title="Active Items" 
            value={itemsLoading ? '...' : activeItems} 
            icon="storefront" 
            color="#4CAF50" 
            onPress={() => router.push('/vendor/items')}
          />
        </View>
        
        <View className="bg-white p-5 rounded-2xl shadow-lg border border-herb-divider/50 mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-poppins-semibold text-herb-primaryDark">Total Revenue</Text>
            <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="cash-outline" size={24} color="#15803D" />
            </View>
          </View>
          <Text className="text-4xl font-poppins-bold text-herb-accent">
            ${totalSales.toFixed(2)}
          </Text>
          <Text className="text-herb-muted font-poppins text-sm mt-1">From delivered orders</Text>
        </View>

        <Text className="text-xl font-poppins-semibold text-herb-primaryDark mb-4 px-1">Quick Actions</Text>
        <View className="space-y-4">
          <Pressable 
            onPress={() => router.push('/vendor/items/add')}
            className="bg-herb-primary flex-row items-center justify-between py-4 px-5 rounded-2xl shadow-lg active:bg-herb-primaryDark"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="add-circle-outline" size={24} color="white" />
              <Text className="text-white font-poppins-semibold text-lg ml-3">Add New Item</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={18} color="white" />
          </Pressable>

          <Pressable 
            onPress={() => router.push('/vendor/orders')}
            className="bg-white border-2 border-herb-primary flex-row items-center justify-between py-4 px-5 rounded-2xl shadow-md active:bg-herb-surface"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="list-alt" size={24} color="#2B4D3F" />
              <Text className="text-herb-primary font-poppins-semibold text-lg ml-3">Manage Orders</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#2B4D3F" />
          </Pressable>

          <Pressable 
            onPress={() => router.push('/vendor/settings')}
            className="bg-white border border-herb-divider flex-row items-center justify-between py-4 px-5 rounded-2xl shadow-md active:bg-herb-surface"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="settings" size={24} color="#5F6F64" />
              <Text className="text-herb-muted font-poppins-semibold text-lg ml-3">Vendor Settings</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#5F6F64" />
          </Pressable>
        </View>
        
        <View className="mt-6 bg-white p-5 rounded-2xl shadow-lg border border-herb-divider/50">
          <Text className="text-xl font-poppins-semibold text-herb-primaryDark mb-4">Recent Activity</Text>
          <View className="items-center py-8">
            <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-3">
              <Ionicons name="notifications-off-outline" size={32} color="#8D978F" />
            </View>
            <Text className="text-herb-primaryDark font-poppins-medium text-lg">No new activity</Text>
            <Text className="text-herb-muted font-poppins text-center mt-1">Your recent activities will appear here</Text>
          </View>
        </View>
      </ScrollView>
    </View>
    </>
  );
}
