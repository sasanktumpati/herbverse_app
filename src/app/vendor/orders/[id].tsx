import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import useVendorOrdersStore from '../../../stores/vendor/vendorOrdersStore';
import { OrderStatus, OrderItem as OrderItemType } from '../../../stores/ordersStore';
import StatusBadge from '../../../components/ui/StatusBadge';
import { FocusAwareStatusBar } from '@/components/common/status-bar';
import useUIStore from '@/stores/uiStore';
import Animated, { FadeIn } from 'react-native-reanimated';

const ORDER_STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'];

interface OrderItemProps {
  item: OrderItemType;
}

const OrderItem: React.FC<OrderItemProps> = React.memo(({ item }) => (
  <View className="flex-row items-center justify-between py-3 px-4 bg-herb-surface/40 rounded-xl mb-2">
    <View className="flex-1 mr-4">
      <Text className="text-base font-poppins-medium text-herb-textPrimary" numberOfLines={2}>{item.name}</Text>
      <Text className="text-sm font-poppins text-herb-muted mt-0.5">Qty: {item.quantity}</Text>
    </View>
    <View className="items-end">
      <Text className="text-base font-poppins-semibold text-herb-accent">${(item.price * item.quantity).toFixed(2)}</Text>
      <Text className="text-xs text-herb-muted font-poppins mt-0.5">${item.price.toFixed(2)} each</Text>
    </View>
  </View>
));
OrderItem.displayName = "OrderItem";

export default function VendorOrderDetailScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const showAlert = useUIStore(state => state.showAlert);

  const { 
    vendorOrders, 
    isLoading, 
    error, 
    updateOrderStatus,
    listenToVendorOrders
  } = useVendorOrdersStore();

  useEffect(() => {
    const unsubscribe = listenToVendorOrders();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [listenToVendorOrders]);

  const order = useMemo(() => vendorOrders.find(o => o.id === orderId), [vendorOrders, orderId]);

  const handleShowStatusOptions = () => {
    if (!order) return;
    showAlert({
      title: `Update Order #${order.orderNumber || order.id.substring(0,6)}`,
      message: "Select the new status for this order:",
      type: 'confirmation',
      buttons: [
        ...ORDER_STATUS_OPTIONS.map(status => ({
          text: status.charAt(0).toUpperCase() + status.slice(1),
          onPress: () => updateOrderStatus(order.id, status)
        })),
        { text: 'Cancel', style: 'cancel', onPress: () => {} }
      ]
    });
  };
  
  const renderOrderProgress = () => {
    if (!order) return null;
    const steps: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];
    const currentStepIndex = steps.indexOf(order.status);
    
    if (order.status === "cancelled" || order.status === "failed") {
      return (
        <View className="my-4 p-4 rounded-xl border" style={{
          backgroundColor: order.status === "cancelled" ? "#FEE2E2" : "#FEF3C7",
          borderColor: order.status === "cancelled" ? "#FCA5A5" : "#FCD34D",
        }}>
          <View className="flex-row items-center justify-center">
            <MaterialIcons 
              name={order.status === "cancelled" ? "cancel" : "warning"} 
              size={24} 
              color={order.status === "cancelled" ? "#DC2626" : "#D97706"}
            />
            <Text className={`ml-2 font-poppins-medium text-base ${
              order.status === "cancelled" ? "text-red-700" : "text-amber-700"
            }`}>
              Order is {order.status}
            </Text>
          </View>
        </View>
      );
    }
    
    return (
      <View className="mt-6 mb-4 px-1">
        <View className="flex-row items-start justify-between">
          {steps.map((step, idx) => (
            <View key={step} className="items-center flex-1">
              <View className={`
                w-8 h-8 rounded-full items-center justify-center border-2 
                ${idx <= currentStepIndex 
                  ? 'bg-herb-primary border-herb-primary' 
                  : 'bg-white border-herb-divider'
                }
              `}>
                {idx <= currentStepIndex && (
                  <Ionicons name="checkmark" size={18} color="white" />
                )}
              </View>
              <Text className={`
                text-xs capitalize mt-2 text-center
                ${idx <= currentStepIndex 
                  ? 'text-herb-primary font-poppins-medium' 
                  : 'text-herb-muted font-poppins'
                }
              `}>
                {step}
              </Text>
              {idx < steps.length - 1 && (
                <View className={`
                  absolute top-4 left-8 w-[100%] h-0.5
                  ${idx < currentStepIndex ? 'bg-herb-primary' : 'bg-herb-divider'}
                `} />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading && !order) {
    return (
      <View style={{ paddingTop: top }} className="flex-1 items-center justify-center bg-herb-surface-alt">
        <ActivityIndicator size="large" color="#2B4D3F" />
        <Text className="text-herb-muted font-poppins mt-2">Loading order details...</Text>
      </View>
    );
  }

  if (error && !order) {
    return (
      <View style={{ paddingTop: top }} className="flex-1 items-center justify-center bg-herb-surface-alt px-5">
        <MaterialIcons name="error-outline" size={48} color="#F28C0F" />
        <Text className="text-xl font-poppins-semibold text-herb-error mt-3 text-center">Failed to Load Order</Text>
        <Text className="text-herb-muted font-poppins text-center mt-1 mb-4">{error.message}</Text>
        <Pressable onPress={() => router.back()} className="bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark">
          <Text className="text-white font-poppins-semibold text-lg">Go Back</Text>
        </Pressable>
      </View>
    );
  }
  
  if (!order) {
     return (
      <View style={{ paddingTop: top }} className="flex-1 items-center justify-center bg-herb-surface-alt px-5">
        <Ionicons name="document-text-outline" size={48} color="#8D978F" />
        <Text className="text-xl font-poppins-semibold text-herb-primaryDark mt-3 text-center">Order Not Found</Text>
        <Text className="text-herb-muted font-poppins text-center mt-1 mb-4">The requested order could not be found or is no longer available.</Text>
        <Pressable onPress={() => router.back()} className="bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark">
          <Text className="text-white font-poppins-semibold text-lg">Back to Orders</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
    <FocusAwareStatusBar />
    <View style={{ flex: 1, paddingTop: top }} className="bg-herb-surface-alt">
      <Animated.View entering={FadeIn} className="px-5 pt-5 pb-4 bg-white shadow-sm">
        <View className="flex-row items-center mb-2">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <MaterialIcons name="arrow-back" size={26} color="#2B4D3F" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-poppins-bold text-herb-primaryDark" numberOfLines={1}>
              Order #{order.orderNumber || order.id.substring(0,8)}
            </Text>
            <Text className="text-sm text-herb-muted font-poppins mt-0.5">
              {new Date(order.createdAt.toDate()).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <StatusBadge status={order.status} size="medium" />
        </View>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeIn.delay(100)}
          className="bg-white p-5 rounded-2xl shadow-lg border border-herb-divider/50"
        >
          {renderOrderProgress()}

          <View className="mt-5">
            <Text className="text-lg font-poppins-semibold text-herb-primaryDark mb-3">
              Items ({order.totalQuantity})
            </Text>
            {order.items.map((item, index) => (
              <OrderItem key={item.id + '-' + index} item={item} />
            ))}
          </View>

          <View className="mt-6 pt-4 border-t border-herb-divider space-y-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-herb-muted font-poppins">Subtotal</Text>
              <Text className="text-herb-textPrimary font-poppins-medium">${order.totalPrice.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-herb-muted font-poppins">Shipping & Handling</Text>
              <Text className="text-herb-textPrimary font-poppins-medium">$0.00</Text>
            </View>
            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-herb-divider">
              <Text className="text-lg font-poppins-bold text-herb-primaryDark">Order Total</Text>
              <Text className="text-lg font-poppins-bold text-herb-primaryDark">${order.totalPrice.toFixed(2)}</Text>
            </View>
          </View>
          
          <View className="mt-6 pt-4 border-t border-herb-divider">
            <Text className="text-lg font-poppins-semibold text-herb-primaryDark mb-2">Customer Details</Text>
            <Text className="text-sm text-herb-muted font-poppins">Customer ID: {order.userId.substring(0,10)}...</Text>
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeIn.delay(200)}>
          <Pressable
            onPress={handleShowStatusOptions}
            disabled={isLoading}
            className={`mt-6 bg-herb-primary py-4 rounded-xl items-center justify-center shadow-lg ${isLoading ? 'opacity-70' : 'active:bg-herb-primaryDark'}`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-poppins-semibold text-lg">Update Order Status</Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
    </>
  );
}
