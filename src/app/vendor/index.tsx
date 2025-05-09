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
    className="bg-white p-4 rounded-xl shadow-lg border border-herb-divider/70 flex-1 active:bg-herb-surface/50"
  >
    <View className="flex-row justify-between items-start">
      <Text className="text-herb-muted font-poppins-medium text-sm uppercase tracking-wider">{title}</Text>
      <View className={`w-8 h-8 rounded-full items-center justify-center`} style={{ backgroundColor: color+'2A' }}>
        <MaterialIcons name={icon} size={16} color={color} />
      </View>
    </View>
    <Text className="text-3xl font-poppins-bold text-herb-primaryDark mt-1.5">{value}</Text>
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
    <View style={{ flex: 1, paddingTop: top }} className="bg-herb-surface-alt">
      <View className="px-5 pt-5 pb-4 bg-white shadow-sm">
        <Text className="text-3xl font-poppins-bold text-herb-primaryDark">Vendor Dashboard</Text>
        <Text className="text-herb-muted font-poppins">Welcome, {profile?.displayName || 'Vendor'}!</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between mb-5 space-x-4">
          <StatCard 
            title="Pending Orders" 
            value={ordersLoading ? '...' : pendingOrders} 
            icon="hourglass-top" 
            color="#FFA726" 
            onPress={() => router.push('/vendor/orders?filter=pending')}
          />
          <StatCard 
            title="Active Listings" 
            value={itemsLoading ? '...' : activeItems} 
            icon="storefront" 
            color="#4CAF50" 
            onPress={() => router.push('/vendor/items')}
          />
        </View>
        
        <View className="bg-white p-4 rounded-xl shadow-lg border border-herb-divider/70 mb-5">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-lg font-poppins-semibold text-herb-primaryDark">Total Revenue</Text>
            <Ionicons name="cash-outline" size={24} color="#2B4D3F" />
          </View>
          <Text className="text-4xl font-poppins-bold text-herb-accent">
            ${totalSales.toFixed(2)}
          </Text>
          <Text className="text-herb-muted font-poppins text-sm">From delivered orders</Text>
        </View>

        <Text className="text-xl font-poppins-semibold text-herb-primaryDark mb-3 mt-2 px-1">Quick Actions</Text>
        <View className="space-y-3">
          <Pressable 
            onPress={() => router.push('/vendor/items/add')}
            className="bg-herb-primary flex-row items-center justify-center py-3.5 px-4 rounded-xl shadow-md active:bg-herb-primaryDark"
          >
            <MaterialIcons name="add-circle-outline" size={22} color="white" />
            <Text className="text-white font-poppins-semibold text-base ml-2">Add New Item</Text>
          </Pressable>
          <Pressable 
            onPress={() => router.push('/vendor/orders')}
            className="bg-white border border-herb-primary flex-row items-center justify-center py-3.5 px-4 rounded-xl shadow-md active:bg-herb-surface"
          >
            <MaterialIcons name="list-alt" size={22} color="#2B4D3F" />
            <Text className="text-herb-primary font-poppins-semibold text-base ml-2">Manage Orders</Text>
          </Pressable>
           <Pressable 
            onPress={() => router.push('/vendor/settings')}
            className="bg-white border border-herb-muted flex-row items-center justify-center py-3.5 px-4 rounded-xl shadow-md active:bg-herb-surface"
          >
            <MaterialIcons name="settings" size={22} color="#5F6F64" />
            <Text className="text-herb-muted font-poppins-semibold text-base ml-2">Vendor Settings</Text>
          </Pressable>
        </View>
        
        <View className="mt-6 bg-white p-4 rounded-xl shadow-lg border border-herb-divider/70">
          <Text className="text-lg font-poppins-semibold text-herb-primaryDark mb-2">Recent Activity</Text>
          <View className="items-center py-6">
            <Ionicons name="notifications-off-outline" size={40} color="#CBD5E0" />
            <Text className="text-herb-muted font-poppins mt-2">No new activity to show.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
    </>
  );
}
