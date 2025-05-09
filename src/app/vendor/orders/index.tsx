import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, RefreshControl, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { FocusAwareStatusBar } from '@/components/common/status-bar';
import useUIStore from '@/stores/uiStore';
import { OrderStatus, useVendorOrdersStore, VendorOrder } from '@/stores';
import StatusBadge from '@/components/ui/StatusBadge';

const ORDER_STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'];

const OrderCard: React.FC<{ order: VendorOrder; onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void; }> = React.memo(({ order, onUpdateStatus }) => {
  const router = useRouter();
  const showAlert = useUIStore(state => state.showAlert);

  const handleShowStatusOptions = () => {
    showAlert({
      title: `Update Order #${order.orderNumber || order.id.substring(0,6)}`,
      message: "Select the new status for this order:",
      type: 'confirmation',
      buttons: [
        ...ORDER_STATUS_OPTIONS.map(status => ({
          text: status.charAt(0).toUpperCase() + status.slice(1),
          onPress: () => onUpdateStatus(order.id, status)
        })),
        { text: "Cancel", style: 'cancel', onPress: () => {} }
      ]
    });
  };

  return (
    <Pressable 
      onPress={() => router.push(`/vendor/orders/${order.id}`)} 
      className="bg-white p-4 mb-4 rounded-xl shadow-lg border border-herb-divider/70 active:bg-herb-surface/50"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-poppins-bold text-herb-primaryDark">Order #{order.orderNumber || order.id.substring(0,8)}</Text>
          <Text className="text-xs text-herb-muted font-poppins">
            {new Date(order.createdAt?.toDate?.() ?? Date.now()).toLocaleDateString()} - {new Date(order.createdAt?.toDate?.() ?? Date.now()).toLocaleTimeString()}
          </Text>
        </View>
        <StatusBadge status={order.status} size="medium" />
      </View>
      
      <View className="mb-3">
        {order.items.slice(0,2).map(item => ( 
          <View key={item.id} className="flex-row items-center my-0.5">
            <Text className="text-sm text-herb-textPrimary font-poppins">{item.quantity} x {item.name}</Text>
          </View>
        ))}
        {order.items.length > 2 && (
          <Text className="text-xs text-herb-muted font-poppins mt-0.5">+{order.items.length - 2} more items</Text>
        )}
      </View>

      <View className="flex-row justify-between items-center pt-3 border-t border-herb-divider/60">
        <Text className="text-base font-poppins-semibold text-herb-accent">${order.totalPrice.toFixed(2)}</Text>
        <Pressable 
          onPress={handleShowStatusOptions}
          className="bg-herb-primary/10 py-2 px-3.5 rounded-lg active:bg-herb-primary/20"
        >
          <Text className="text-sm font-poppins-medium text-herb-primaryDark">Update Status</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});
OrderCard.displayName = "VendorOrderCard";


export default function VendorOrdersScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: OrderStatus }>();
  const { 
    vendorOrders, 
    isLoading, 
    error, 
    listenToVendorOrders, 
    updateOrderStatus,
    clearVendorOrders
  } = useVendorOrdersStore();
  
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>(params.filter || 'all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToVendorOrders();
    return () => {
      if (unsubscribe) unsubscribe();
      
    };
  }, [listenToVendorOrders, clearVendorOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);    
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return vendorOrders;
    return vendorOrders.filter(order => order.status === activeFilter);
  }, [vendorOrders, activeFilter]);
  
  if (isLoading && vendorOrders.length === 0 && !refreshing) {
    return (
      <View style={{ paddingTop: top }} className="flex-1 items-center justify-center bg-herb-surface-alt">
        <ActivityIndicator size="large" color="#2B4D3F" />
        <Text className="text-herb-muted font-poppins mt-2">Loading incoming orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ paddingTop: top }} className="flex-1 items-center justify-center bg-herb-surface-alt px-5">
        <MaterialIcons name="error-outline" size={48} color="#F28C0F" />
        <Text className="text-xl font-poppins-semibold text-herb-error mt-3 text-center">Failed to Load Orders</Text>
        <Text className="text-herb-muted font-poppins text-center mt-1 mb-4">{error.message}</Text>
        <Pressable onPress={onRefresh} className="bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark">
          <Text className="text-white font-poppins-semibold text-lg">Retry</Text>
        </Pressable>
      </View>
    );
  }  
  const allStatuses: (OrderStatus | 'all')[] = ['all', ...ORDER_STATUS_OPTIONS];

  return (
    <>
    <FocusAwareStatusBar />
    <View style={{ flex: 1, paddingTop: top }} className="bg-herb-surface-alt">
      <View className="px-5 pt-5 pb-1 bg-white shadow-sm">
        <Text className="text-3xl font-poppins-bold text-herb-primaryDark">Incoming Orders</Text>
      </View>
      <View className="bg-white shadow-sm border-b border-herb-divider/70">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        >
          {allStatuses.map(status => (
            <Pressable
              key={status}
              onPress={() => setActiveFilter(status)}
              className={`mr-2.5 px-4 py-2 rounded-full border ${
                activeFilter === status 
                  ? 'bg-herb-primary border-herb-primary' 
                  : 'bg-herb-surface border-herb-divider'
              }`}
            >
              <Text className={`text-sm font-poppins-medium capitalize ${
                activeFilter === status ? 'text-white' : 'text-herb-primaryDark'
              }`}>
                {status === 'all' ? 'All Orders' : status}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {filteredOrders.length === 0 && !isLoading ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="file-tray-outline" size={56} color="#8D978F" />
          <Text className="text-xl font-poppins-semibold text-herb-primaryDark text-center mt-4">
            {activeFilter === 'all' ? 'No Orders Yet' : `No ${activeFilter} orders`}
          </Text>
          <Text className="text-herb-muted font-poppins text-center mt-1 mb-6">
            {activeFilter === 'all' 
              ? "New customer orders will appear here." 
              : `You currently have no orders with the status: ${activeFilter}.`}
          </Text>
          {activeFilter !== 'all' && (
            <Pressable 
              onPress={() => setActiveFilter("all")} 
              className="mt-4 bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark"
            >
              <Text className="text-white font-poppins-semibold text-lg">View All Orders</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => <OrderCard order={item} onUpdateStatus={handleUpdateStatus} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2B4D3F"]} tintColor={"#2B4D3F"}/>
          }
          ListFooterComponent={isLoading && vendorOrders.length > 0 ? (
             <View className="py-4 items-center">
              <ActivityIndicator color="#2B4D3F" />
            </View>
          ) : null}
        />
      )}
    </View>
    </>
  );
}
