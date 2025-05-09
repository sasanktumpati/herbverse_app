import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Item } from '../../stores';

interface HerbCardProps {
  item: Item;
  width?: number;
}

const HerbCard: React.FC<HerbCardProps> = ({ item, width }) => {
  return (
    <Link href={`/product/${item.id}`} asChild>
      <Pressable 
        className="active:opacity-90 active:scale-95 transition-transform" 
        style={width ? { width } : undefined}
      >
        <View className="bg-white rounded-2xl shadow-lg overflow-hidden border border-herb-divider/60">
          <View className="relative">
            {item.imageUrl ? (
              <Image 
                source={{ uri: item.imageUrl }} 
                className="w-full h-40 bg-gray-100" 
                resizeMode="cover" 
              />
            ) : (
              <View className="w-full h-40 bg-herb-surface/50 items-center justify-center">
                <Ionicons name="leaf-outline" size={40} color="#3E6643" />
              </View>
            )}
            <View className="absolute top-2.5 right-2.5 bg-white/80 rounded-full p-1.5 shadow-md backdrop-blur-sm border border-white/30">
              <Ionicons name="heart-outline" size={18} color="#3E6643" />
            </View>
          </View>
          
          <View className="p-3.5">
            <Text className="text-herb-primaryDark font-poppins-semibold text-base" numberOfLines={1}>
              {item.name}
            </Text>
            
            <View className="flex-row items-center justify-between mt-1.5">
              <Text className="text-herb-primary font-poppins-bold text-lg">${item.price ? item.price.toFixed(2) : 'N/A'}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

export default HerbCard;