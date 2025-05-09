import { MaterialIcons } from '@expo/vector-icons';
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
        className="active:opacity-95 active:scale-98" 
        style={width ? { width } : undefined}
      >
        <View 
          className="bg-white rounded-2xl overflow-hidden border border-herb-divider/40"
          style={{
            shadowColor: '#1E352C',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3
          }}
        >
          <View className="relative">
            {item.imageUrl ? (
              <Image 
                source={{ uri: item.imageUrl }} 
                className="w-full h-40 bg-gray-100" 
                resizeMode="cover" 
              />
            ) : (
              <View className="w-full h-40 bg-herb-surface/40 items-center justify-center">
                <MaterialIcons name="eco" size={40} color="#3E6643" />
              </View>
            )}
            
            <Pressable 
              className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center bg-white/80 backdrop-blur-md shadow-sm border border-white/50"
            >
              <MaterialIcons name="favorite-border" size={18} color="#3E6643" />
            </Pressable>
            
            {item.category && (
              <View className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-white/50">
                <Text className="text-xs font-poppins-medium text-herb-primary">{item.category}</Text>
              </View>
            )}
          </View>
          
          <View className="p-3.5">
            <Text className="text-herb-primaryDark font-poppins-semibold text-base leading-tight" numberOfLines={1}>
              {item.name}
            </Text>
            
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-herb-primary font-poppins-bold text-lg">${item.price ? item.price.toFixed(2) : 'N/A'}</Text>
              <View className="bg-herb-primary/10 p-1.5 rounded-full">
                <MaterialIcons name="add-shopping-cart" size={16} color="#3E6643" />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

export default HerbCard;