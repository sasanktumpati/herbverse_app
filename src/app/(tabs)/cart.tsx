import { CartItem, useCartStore, useOrdersStore, useUIStore } from '@/stores';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CartItemDisplayProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

const CartItemDisplay: React.FC<CartItemDisplayProps> = React.memo(({ item, onUpdateQuantity, onRemoveItem }) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  return (
    <View className="flex-row items-center bg-white p-3.5 mb-3.5 rounded-xl shadow-md border border-herb-divider/70">
      <View className="bg-herb-surface rounded-lg overflow-hidden mr-3.5">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="w-24 h-24 rounded-lg" resizeMode="cover" />
        ) : (
          <View className="w-24 h-24 rounded-lg items-center justify-center bg-herb-surface/50">
            <Ionicons name="leaf-outline" size={36} color="#3E6643" />
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-poppins-semibold text-herb-primaryDark leading-tight" numberOfLines={2}>{item.name}</Text>
        <Text className="text-lg font-poppins-bold text-herb-primary mt-1">${item.price.toFixed(2)}</Text>
        <View className="flex-row items-center mt-3">
          <Pressable
            onPress={() => {
              const next = localQuantity - 1;
              setLocalQuantity(next);
              onUpdateQuantity(item.id, next);
            }}
            disabled={localQuantity <= 0}
            className="p-2 bg-herb-surface rounded-full active:bg-herb-divider"
          >
            <MaterialIcons name="remove" size={20} color="#2B4D3F" />
          </Pressable>
          <Text className="text-lg font-poppins-medium text-herb-textPrimary w-10 text-center">{localQuantity}</Text>
          <Pressable
            onPress={() => {
              const next = localQuantity + 1;
              setLocalQuantity(next);
              onUpdateQuantity(item.id, next);
            }}
            className="p-2 bg-herb-surface rounded-full active:bg-herb-divider"
          >
            <MaterialIcons name="add" size={20} color="#2B4D3F" />
          </Pressable>
        </View>
      </View>
      <Pressable 
        onPress={() => onRemoveItem(item.id)} 
        className="p-2.5 rounded-full active:bg-red-100 self-start ml-2"
        hitSlop={10}
      >
        <MaterialIcons name="delete-outline" size={24} color="#F44336" />
      </Pressable>
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.price === nextProps.item.price && 
         prevProps.item.name === nextProps.item.name &&
         prevProps.item.imageUrl === nextProps.item.imageUrl &&
         true;
});

CartItemDisplay.displayName = 'CartItemDisplay';

export default function CartScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const showAlert = useUIStore((state) => state.showAlert);
  const {
    cart,
    isLoading: isCartLoading,
    error: cartError,
    updateItemQuantityInCart,
    removeItemFromCart,
  } = useCartStore();

  const {
    createOrderFromCart,
    isLoading: isOrderCreating,
    error: orderError,
  } = useOrdersStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      showAlert({
        title: "Empty Cart",
        message: "Please add items to your cart before checking out.",
        type: 'warning',
        buttons: [{ text: "OK" }]
      });
      return;
    }
    setIsCheckingOut(true);
    const orderId = await createOrderFromCart();
    setIsCheckingOut(false);

    if (orderId) {
      showAlert({
        title: "Order Placed!",
        message: `Your order #${orderId.substring(0, 8)} has been placed successfully.`,
        type: 'success',
        buttons: [{ text: "View Order", onPress: () => router.push(`/order/${orderId}`) }]
      });
    } else {
      showAlert({
        title: "Checkout Failed",
        message: orderError?.message || "An unexpected error occurred while placing your order. Please check your connection or try again later.",
        type: 'error',
        buttons: [{ text: "OK" }]
      });
    }
  };

  
  const isLoading = isCartLoading && !cart;
  const currentError = cartError || (isCheckingOut ? null : orderError);

  if (isLoading) { 
    return (
      <View style={{ paddingTop: top, paddingBottom: bottom + 75 }} className="flex-1 bg-herb-surface items-center justify-center">
        <ActivityIndicator size="large" color="#2B4D3F" />
        <Text className="text-herb-muted font-poppins mt-2">Loading your cart...</Text>
      </View>
    );
  }

  if (currentError && !isCheckingOut) {
    return (
      <View style={{ paddingTop: top, paddingBottom: bottom + 75 }} className="flex-1 bg-herb-surface items-center justify-center px-5">
        <MaterialIcons name="error-outline" size={48} color="#F28C0F" />
        <Text className="text-xl font-poppins-bold text-herb-error mt-3 text-center">Oops! Something went wrong.</Text>
        <Text className="text-herb-muted font-poppins text-center mt-1 mb-4">{currentError.message}</Text>
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={{ paddingTop: top, paddingBottom: bottom + 75 }} className="flex-1 bg-herb-surface items-center justify-center px-5">
        <LinearGradient
          colors={['rgba(224, 231, 223, 0.8)', 'rgba(192, 210, 186, 0.6)']}
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
        >
          <MaterialIcons name="remove-shopping-cart" size={40} color="#3E6643" />
        </LinearGradient>
        <Text className="text-2xl font-poppins-bold text-herb-primaryDark mt-2">Your Cart is Empty</Text>
        <Text className="text-herb-muted font-poppins text-lg text-center mt-2 mb-6">Looks like you haven&apos;t added anything to your cart yet.</Text>
        <Pressable
          onPress={() => router.push('/explore')}
          className="bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark"
        >
          <Text className="text-white font-poppins-semibold text-lg">Start Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      <View style={{ flex: 1 }} className="bg-herb-surface">
        <View 
          style={{ paddingTop: top }} 
          className="px-5 pt-5 pb-4 flex-row justify-between items-center bg-white shadow-sm"
        >
          <Text className="text-3xl font-poppins-bold text-herb-primaryDark">Your Cart</Text>
          {(isCartLoading || isOrderCreating || isCheckingOut) && <ActivityIndicator color="#2B4D3F" />}
        </View>

        <FlatList
          data={cart.items}
          renderItem={({ item }) => (
            <CartItemDisplay
              item={item}
              onUpdateQuantity={updateItemQuantityInCart}
              onRemoveItem={removeItemFromCart}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 230 }} 
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? ( 
              <View className="items-center justify-center mt-20">
                <Text className="text-herb-muted font-poppins text-lg">Your cart is currently empty.</Text>
              </View>
            ) : null
          }
          extraData={cart?.items} 
        />

        <View 
          className="absolute bottom-0 left-0 right-0 bg-white pt-5 pb-6 px-5 rounded-t-3xl shadow-2xl border-t border-herb-divider" 
          style={{ paddingBottom: bottom + 80 }} 
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-poppins text-herb-muted">Subtotal ({cart.totalQuantity} item{cart.totalQuantity === 1 ? '' : 's'})</Text>
            <Text className="text-lg font-poppins-medium text-herb-textPrimary">${cart.totalPrice.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-poppins text-herb-muted">Shipping</Text>
            <Text className="text-lg font-poppins-medium text-herb-textPrimary">Free</Text> 
          </View>
          <View className="border-t border-herb-divider/70 my-3"></View>
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-poppins-bold text-herb-primaryDark">Total</Text>
            <Text className="text-2xl font-poppins-bold text-herb-primaryDark">${cart.totalPrice.toFixed(2)}</Text>
          </View>
          <Pressable
            onPress={handleCheckout}
            disabled={isCheckingOut || !cart || cart.items.length === 0} 
            className={`w-full py-4 rounded-xl items-center justify-center shadow-lg 
                        ${(isCheckingOut || !cart || cart.items.length === 0) 
                          ? 'bg-herb-divider' 
                          : 'bg-herb-primary active:bg-herb-primaryDark'}`}
          >
            {isCheckingOut ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-poppins-semibold text-lg">
                Proceed to Checkout
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </>
  );
}