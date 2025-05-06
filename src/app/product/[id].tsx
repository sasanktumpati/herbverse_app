import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const product = {
    name: id === 'echinacea' ? 'Echinacea Plant' : 'Herbal Tea',
    price: '$15.00',
    image: require('../../../assets/images/icon.png'),
    description: 'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
  };

  return (
    <SafeAreaView className="flex-1 bg-herb-background p-4">
      <View className="flex-row mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Text className="text-herb-primary">← Back</Text>
        </Pressable>
      </View>

      <Image source={product.image} className="w-full h-64 rounded-lg" resizeMode="cover" />
      
      <View className="mt-4">
        <Text className="text-xl font-bold text-herb-primary">{product.name}</Text>
        <Text className="text-herb-muted mt-1">{product.price}</Text>
        <Text className="mt-2 text-herb-muted">{product.description}</Text>
      </View>

      <View className="mt-6 flex-row items-center">
        <Pressable className="bg-herb-secondary px-3 py-1 rounded"> 
          <Text className="text-herb-primary text-lg">-</Text>
        </Pressable>
        <Text className="mx-4 text-lg text-herb-primary">1</Text>
        <Pressable className="bg-herb-secondary px-3 py-1 rounded">
          <Text className="text-herb-primary text-lg">+</Text>
        </Pressable>
      </View>

      <Pressable className="mt-6 bg-herb-primary py-3 rounded">
        <Text className="text-white text-center font-bold">Add to Cart</Text>
      </Pressable>

      <Pressable className="mt-3 py-2 rounded border border-herb-primary">
        <Text className="text-herb-primary text-center font-bold">Checkout</Text>
      </Pressable>
    </SafeAreaView>
  );
}
