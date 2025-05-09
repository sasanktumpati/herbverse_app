import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StatusBadge from '../../components/ui/StatusBadge';
import useOrdersStore, { Order, OrderItem } from '../../stores/ordersStore';

const OrderDetailScreen = () => {
  const params = useLocalSearchParams();
  const idFromParams = params.id;
  const orderId = Array.isArray(idFromParams) 
    ? (idFromParams.length > 0 ? idFromParams[0] : undefined) 
    : (idFromParams as string | undefined);

  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { orders, isLoading: ordersLoading, error: ordersError, fetchUserOrders } = useOrdersStore();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (orderId) {
      const foundOrder = orders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setOrder(null);
      }
    }
  }, [orderId, orders]);
  
  useEffect(() => {
    if (orderId && order === undefined && !ordersLoading && orders.length === 0) {
      fetchUserOrders();
    }
  }, [orderId, order, ordersLoading, orders.length, fetchUserOrders]);

  const renderOrderItem = (cartItem: OrderItem, index: number) => (
    <View 
      key={cartItem.id + index} 
      className="flex-row items-center py-3.5 px-4 my-1.5 bg-white rounded-xl shadow-sm border border-herb-divider/70"
    >
      {cartItem.imageUrl ? (
        <Image source={{ uri: cartItem.imageUrl }} className="w-16 h-16 rounded-lg mr-4" resizeMode="cover" />
      ) : (
        <View className="w-16 h-16 rounded-lg mr-4 bg-herb-surface items-center justify-center">
          <Ionicons name="leaf-outline" size={24} color="#3E6643" />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-base font-poppins-semibold text-herb-textPrimary" numberOfLines={2}>{cartItem.name}</Text>
        <Text className="text-sm text-herb-muted font-poppins mt-0.5">Quantity: {cartItem.quantity}</Text>
        <Text className="text-sm text-herb-muted font-poppins">Price: ${cartItem.price.toFixed(2)}</Text>
      </View>
      <Text className="text-lg font-poppins-bold text-herb-primary">
        ${(cartItem.price * cartItem.quantity).toFixed(2)}
      </Text>
    </View>
  );

  let screenTitle: string;
  let content: React.ReactNode;

  if (order === undefined || (ordersLoading && !order)) {
    screenTitle = "Loading Order...";
    content = (
      <View style={{ flex: 1, paddingTop: top, paddingBottom: bottom }} className="items-center justify-center bg-herb-background">
        <ActivityIndicator size="large" color="#446835" />
        <Text className="text-herb-muted font-poppins mt-2">Loading order details...</Text>
      </View>
    );
  } else if (order === null || !orderId) {
    screenTitle = "Order Not Found";
    content = (
      <View style={{ flex: 1, paddingTop: top, paddingBottom: bottom }} className="items-center justify-center bg-herb-background px-5">
        <MaterialIcons name="error-outline" size={48} color="#F28C0F" />
        <Text className="text-xl font-poppins-semibold text-herb-primaryDark mt-3">Order Not Found</Text>
        <Text className="text-herb-muted font-poppins text-center mt-1 mb-4">
          The requested order could not be found. It might have been removed or the ID is incorrect.
        </Text>
        <Pressable onPress={() => router.back()} className="bg-herb-primary py-3 px-8 rounded-2xl shadow-md active:bg-herb-primaryDark">
          <Text className="text-white font-poppins-semibold text-lg">Go Back</Text>
        </Pressable>
      </View>
    );
  } else if (ordersError) {
    screenTitle = "Error Loading Order";
    content = (
      <View style={{ flex: 1, paddingTop: top, paddingBottom: bottom }} className="items-center justify-center bg-herb-background px-5">
        <MaterialIcons name="error-outline" size={48} color="#F28C0F" />
        <Text className="text-xl font-poppins-semibold text-herb-error mt-3">Error Loading Order</Text>
        <Text className="text-herb-muted text-center mt-1 mb-4">{ordersError.message}</Text>
        <Pressable onPress={() => fetchUserOrders()} className="bg-herb-primary py-3 px-6 rounded-2xl shadow-md active:bg-herb-primaryDark mt-2">
          <Text className="text-white font-poppins-semibold">Try Again</Text>
        </Pressable>
      </View>
    );
  } else if (order) {
    screenTitle = `Order #${order.orderNumber || order.id.substring(0,8)}`;
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const orderTime = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    content = (
      <ScrollView
        style={{ paddingTop: top }}
        className="flex-1 bg-herb-background"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom + 20}}
      >
        <View className="bg-white p-5 my-4 rounded-2xl shadow-lg border border-herb-divider/70">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-2xl font-poppins-bold text-herb-primaryDark">Order #{order.orderNumber || order.id.substring(0,8)}</Text>
              <Text className="text-sm text-herb-muted font-poppins mt-1">Placed on {orderDate} at {orderTime}</Text>
            </View>
            <StatusBadge status={order.status} size="medium" />
          </View>
          
          <View className="border-t border-herb-divider my-3"></View>

          <View>
            <Text className="text-sm font-poppins-medium text-herb-muted mb-0.5">Order ID</Text>
            <Text className="text-base text-herb-textPrimary font-poppins selectable">{order.id}</Text>
          </View>
          <View className="mt-2">
            <Text className="text-sm font-poppins-medium text-herb-muted mb-0.5">User ID</Text>
            <Text className="text-base text-herb-textPrimary font-poppins selectable">{order.userId}</Text>
          </View>
        </View>

        <View className="bg-white p-5 mb-4 rounded-2xl shadow-lg border border-herb-divider/70">
          <Text className="text-xl font-poppins-bold text-herb-primaryDark mb-3">Items in this Order ({order.items.length})</Text>
          {order.items.map(renderOrderItem)}
        </View>
        
        <View className="bg-white p-5 mb-6 rounded-2xl shadow-lg border border-herb-divider/70">
          <Text className="text-xl font-poppins-bold text-herb-primaryDark mb-4">Payment Summary</Text>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-herb-muted font-poppins">Subtotal ({order.totalQuantity} item{order.totalQuantity === 1 ? '' : 's'})</Text>
            <Text className="text-base font-poppins-medium text-herb-textPrimary">${order.totalPrice.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-herb-muted font-poppins">Shipping & Handling</Text>
            <Text className="text-base font-poppins-medium text-herb-textPrimary">$0.00</Text> 
          </View>
          <View className="border-t border-herb-divider my-3"></View>
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-xl font-poppins-bold text-herb-primaryDark">Order Total</Text>
            <Text className="text-xl font-poppins-bold text-herb-primaryDark">${order.totalPrice.toFixed(2)}</Text>
          </View>
        </View>
        
        <Pressable 
          onPress={() => router.push('/(tabs)/explore')}
          className="bg-herb-primary py-4 mb-8 rounded-xl items-center shadow-md active:bg-herb-primaryDark flex-row justify-center"
        >
          <Ionicons name="bag-handle-outline" size={20} color="white" style={{marginRight: 8}} />
          <Text className="text-white font-poppins-semibold text-base">Continue Shopping</Text>
        </Pressable>
      </ScrollView>
    );
  } else {
    screenTitle = "Order Details";
    content = <View style={{ flex: 1, paddingTop: top, paddingBottom: bottom }} className="bg-herb-background" />;
  }

  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Stack.Screen options={{ 
        title: screenTitle,
        headerStyle: { backgroundColor: '#F7F9F7' },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: 'Poppins_600SemiBold', color: '#1E352C'},
        headerTintColor: '#1E352C',
      }} />
      {content}
    </>
  );
};

export default OrderDetailScreen;