import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image, Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  BackHandler,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { useCartStore, useItemsStore, useUIStore } from '@/stores';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const showAlert = useUIStore((state) => state.showAlert);
  
  const { items, isLoading: isItemsLoading, fetchItems } = useItemsStore();
  const item = items.find(i => i.id === id);
  
  const { addItemToCart, isLoading: isCartLoading } = useCartStore();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  useEffect(() => {
    if (items.length === 0) {
      fetchItems();
    }
  }, [items.length, fetchItems]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        router.push('/(tabs)/explore');
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [router]);
  
  const handleAddToCart = async () => {
    if (!item) return;
    
    setIsAdding(true);
    try {
      await addItemToCart(item, selectedQuantity);
      showAlert({
        title: "Added to Cart",
        message: `${selectedQuantity} × ${item.name} added to your cart.`,
        type: 'success',
        buttons: [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => router.push('/(tabs)/cart') }
        ]
      });
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to add item to cart. Please try again.",
        type: 'error',
        buttons: [{ text: "OK" }]
      });
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  if (isItemsLoading || !item) {
    return (
      <View className="flex-1 bg-herb-background">
        <Header title="Product Details" showBack backAction={() => router.push('/(tabs)/explore')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2B4D3F" />
          <Text className="text-herb-muted font-poppins mt-3">Loading product details...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View className="flex-1 bg-herb-background">
        <Header 
          title="Product Details" 
          showBack backAction={() => router.push('/(tabs)/explore')} 
          rightIcon="share" 
          rightAction={() => showAlert({ title: "Share", message: "Sharing feature coming soon!", type: 'info', buttons: [{ text: "OK" }] })} 
        />
        
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="relative w-full" style={{ height: width * 0.8 }}>
            {item.imageUrl ? (
              <Image 
                source={{ uri: item.imageUrl }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-herb-surface flex items-center justify-center">
                <Ionicons name="leaf" size={80} color="#3E6643" />
              </View>
            )}
            
            <View className="absolute top-4 right-4">
              <BlurView intensity={40} tint="light" className="rounded-full">
                <Pressable 
                  className="w-10 h-10 rounded-full items-center justify-center bg-white/30 border border-white/40"
                  onPress={() => showAlert({ title: "Favorites", message: "Favorites feature coming soon!", type: 'info', buttons: [{ text: "OK" }] })}
                >
                  <AntDesign name="hearto" size={20} color="#2B4D3F" />
                </Pressable>
              </BlurView>
            </View>
            
            {item.category && (
              <View className="absolute bottom-4 left-4">
                <BlurView intensity={40} tint="light" className="rounded-full">
                  <View className="px-3 py-1.5 rounded-full bg-white/30 border border-white/40">
                    <Text className="text-herb-primary font-medium">{item.category}</Text>
                  </View>
                </BlurView>
              </View>
            )}
          </View>
          
          <View className="bg-white rounded-t-3xl -mt-5 px-5 pt-6 pb-10">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-2xl font-poppins-bold text-herb-primaryDark mb-1">
                  {item.name}
                </Text>
                <Text className="text-herb-muted font-poppins">
                  Product ID: {item.id.substring(0, 8)}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-herb-primary">
                ${item.price.toFixed(2)}
              </Text>
            </View>
            
            <View className="mb-6">
              <Text className="text-lg font-poppins-semibold text-herb-primaryDark mb-2">
                Description
              </Text>
              <Text className="text-herb-textSecondary font-poppins leading-6">
                {item.description || "No description available for this product."}
              </Text>
            </View>
            
            <View className="mb-6">
              <Text className="text-lg font-poppins-semibold text-herb-primaryDark mb-2">
                Quantity
              </Text>
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 bg-herb-surface rounded-lg items-center justify-center active:bg-herb-divider"
                >
                  <MaterialIcons name="remove" size={24} color="#2B4D3F" />
                </Pressable>
                <Text className="mx-5 text-xl font-poppins-bold text-herb-primaryDark w-8 text-center">
                  {selectedQuantity}
                </Text>
                <Pressable
                  onPress={() => setSelectedQuantity(prev => prev + 1)}
                  className="w-10 h-10 bg-herb-surface rounded-lg items-center justify-center active:bg-herb-divider"
                >
                  <MaterialIcons name="add" size={24} color="#2B4D3F" />
                </Pressable>
                <Text className="ml-4 text-herb-muted">
                  ${(item.price * selectedQuantity).toFixed(2)}
                </Text>
              </View>
            </View>
            
            <View className="mb-6">
              <Text className="text-lg font-poppins-semibold text-herb-primaryDark mb-2">
                Benefits
              </Text>
              <View className="bg-herb-surface p-4 rounded-xl">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 bg-herb-primary/10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={16} color="#2B4D3F" />
                  </View>
                  <Text className="text-herb-textPrimary font-poppins">100% Organic & Natural</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 bg-herb-primary/10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={16} color="#2B4D3F" />
                  </View>
                  <Text className="text-herb-textPrimary font-poppins">High Quality Sourcing</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-herb-primary/10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={16} color="#2B4D3F" />
                  </View>
                  <Text className="text-herb-textPrimary font-poppins">Lab Tested for Quality</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View 
          className="absolute bottom-0 left-0 right-0 bg-white pt-4 pb-6 px-5 border-t border-herb-divider"
          style={{ paddingBottom: bottom || 24 }}
        >
          <Pressable
            onPress={handleAddToCart}
            disabled={isAdding || isCartLoading}
            className={`w-full py-4 rounded-xl items-center justify-center shadow-md 
              ${isAdding || isCartLoading ? 'bg-herb-muted' : 'bg-herb-primary active:bg-herb-primaryDark'}`}
          >
            {isAdding || isCartLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-lg font-poppins-semibold">Add to Cart</Text>
            )}
          </Pressable>
        </View>
      </View>
    </>
  );
}
