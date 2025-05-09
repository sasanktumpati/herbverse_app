import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import useVendorOrdersStore from '../../../stores/vendor/vendorOrdersStore';
import { OrderStatus } from '../../../stores/ordersStore';
import StatusBadge from '../../../components/ui/StatusBadge';
import { FocusAwareStatusBar } from '@/components/common/status-bar';
import useUIStore from '@/stores/uiStore';

const ORDER_STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'];

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
    listenToVendorOrders // Ensure listener is active
  } = useVendorOrdersStore();

  // Ensure listener is initialized if not already (e.g. on direct navigation)
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
            <View className="my-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <Text className="text-center font-poppins-medium text-red-600">
                    Order is {order.status}
                </Text>
            </View>
        );
      }
      
      return (
        <View className="flex-row items-start mt-6 mb-4 px-1">
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <View className="flex-1 items-center"> 
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
                    idx <= currentStepIndex
                      ? 'bg-herb-primary border-herb-primary'
                      : 'bg-white border-herb-divider'
                  }`}
                >
                  {idx <= currentStepIndex && (
                    <Ionicons name="checkmark" size={18} color="white" />
                  )}
                </View>
                <Text
                  className={`text-xs capitalize mt-1.5 text-center ${
                    idx <= currentStepIndex ? 'text-herb-primary font-poppins-medium' : 'text-herb-muted font-poppins'
                  }`}
                  numberOfLines={1}
                >
                  {step}
                </Text>
              </View>
              {idx < steps.length - 1 && (
                <View
                  className={`h-1 flex-1 mx-1 mt-3.5 ${ // Adjusted margin for alignment
                    idx < currentStepIndex
                      ? 'bg-herb-primary'
                      : 'bg-herb-divider'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
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
      <View className="px-5 pt-5 pb-4 flex-row items-center bg-white shadow-sm">
        <Pressable onPress={() => router.back()} className="p-2 mr-2 -ml-2">
          <MaterialIcons name="arrow-back" size={26} color="#2B4D3F" />
        </Pressable>
        <Text className="text-2xl font-poppins-bold text-herb-primaryDark flex-1" numberOfLines={1}>
            Order #{order.orderNumber || order.id.substring(0,8)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 30 }}>
        <View className="bg-white p-5 rounded-xl shadow-lg border border-herb-divider/70">
            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-herb-divider">
                <View>
                    <Text className="text-xs text-herb-muted font-poppins">ORDER PLACED</Text>
                    <Text className="text-sm text-herb-textPrimary font-poppins-medium">
                        {new Date(order.createdAt.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                    <Text className="text-xs text-herb-textPrimary font-poppins">
                        {new Date(order.createdAt.toDate()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <StatusBadge status={order.status} size="large" />
            </View>
            
            {renderOrderProgress()}

            <View className="mt-4">
                <Text className="text-lg font-poppins-semibold text-herb-primaryDark mb-2">Items in Order ({order.totalQuantity})</Text>
                {order.items.map((item, index) => (
                    <View 
                        key={item.id + '-' + index} 
                        className="flex-row justify-between items-center py-2.5 my-1 bg-herb-surface/60 px-3 rounded-lg"
                    >
                        <View className="flex-1 mr-2">
                            <Text className="text-base font-poppins-medium text-herb-textPrimary">{item.name}</Text>
                            <Text className="text-xs text-herb-muted font-poppins">Qty: {item.quantity}</Text>
                        </View>
                        <Text className="text-base font-poppins-semibold text-herb-primary">${(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            <View className="mt-5 pt-4 border-t border-herb-divider">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-herb-muted font-poppins">Subtotal</Text>
                    <Text className="text-herb-textPrimary font-poppins-medium">${order.totalPrice.toFixed(2)}</Text>
                </View>
                 <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-herb-muted font-poppins">Shipping & Handling</Text>
                    <Text className="text-herb-textPrimary font-poppins-medium">$0.00</Text>
                </View>
                <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-herb-divider/50">
                    <Text className="text-lg font-poppins-bold text-herb-primaryDark">Order Total</Text>
                    <Text className="text-lg font-poppins-bold text-herb-primaryDark">${order.totalPrice.toFixed(2)}</Text>
                </View>
            </View>
            
            {/* Placeholder for Customer Details - In a real app, you'd fetch/show customer info */}
            <View className="mt-5 pt-4 border-t border-herb-divider">
                <Text className="text-lg font-poppins-semibold text-herb-primaryDark mb-1.5">Customer Details</Text>
                <Text className="text-sm text-herb-muted font-poppins">Customer ID: {order.userId.substring(0,10)}...</Text>
                {/* Add more customer details if available and necessary for vendor */}
            </View>

        </View>
        
        <Pressable
            onPress={handleShowStatusOptions}
            disabled={isLoading}
            className={`mt-6 bg-herb-primary py-4 rounded-xl items-center justify-center shadow-md ${isLoading ? 'opacity-70' : 'active:bg-herb-primaryDark'}`}
        >
            {isLoading ? (
            <ActivityIndicator color="white" />
            ) : (
            <Text className="text-white font-poppins-semibold text-lg">Update Order Status</Text>
            )}
        </Pressable>

      </ScrollView>
    </View>
    </>
  );
}
