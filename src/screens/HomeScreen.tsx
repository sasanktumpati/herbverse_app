import React from 'react';
import { View, Text, TextInput, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-herb-background px-4">
      <View className="mt-4">
        <Text className="text-lg text-herb-muted">Good afternoon</Text>
        <Text className="text-xl font-semibold text-herb-primary">📍 New York</Text>
      </View>

      <View className="mt-4 bg-herb-secondary rounded-lg p-3">
        <TextInput
          className="text-herb-muted"
          placeholder="Search herbs or wellness"
          placeholderTextColor="#5F6F64"
        />
      </View>

      <Text className="mt-6 text-lg font-semibold text-herb-primary">Popular Herbs</Text>

      <ScrollView horizontal className="mt-2" showsHorizontalScrollIndicator={false}>
        {[
          { name: 'Echinacea Plant', price: '$5.00', image: require('../../assets/images/icon.png'), id: 'echinacea' },
          { name: 'Herbal Tea', price: '$5.00', image: require('../../assets/images/icon.png'), id: 'tea' }
        ].map((item, index) => (
          <Link href={`/product/${item.id}`} key={index} asChild>
            <Pressable>
              <View className="mr-4 bg-herb-card p-2 rounded-lg w-36 shadow-sm">
                <Image source={item.image} className="w-full h-24 rounded-md" resizeMode="cover" />
                <Text className="text-herb-primary mt-2 font-medium">{item.name}</Text>
                <Text className="text-herb-muted">{item.price}</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </ScrollView>

      <View className="mt-6">
        <Text className="text-sm font-medium text-herb-muted">Order Confirmed</Text>
        <View className="flex-row items-center mt-2 bg-herb-card p-3 rounded-md border border-herb-success">
          <Text className="text-herb-success font-semibold">✔ Confirmed</Text>
          <Text className="ml-2 text-herb-muted">Arriving on May 20</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
