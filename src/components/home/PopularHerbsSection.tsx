import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { Item } from '../../stores';
import HerbCard from './HerbCard';

interface PopularHerbsSectionProps {
  items: Item[];
  isLoading: boolean;
  filteredItems: Item[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  categories: string[];
  cardWidth: number;
  cardSpacing: number;
}

const PopularHerbsSection: React.FC<PopularHerbsSectionProps> = ({
  items,
  isLoading,
  filteredItems,
  selectedCategory,
  setSelectedCategory,
  categories,
  cardWidth,
  cardSpacing
}) => {
  const router = useRouter();

  const pairedData = React.useMemo(() => {
    const result: Item[][] = [];
    if (!filteredItems) return [];
    for (let i = 0; i < filteredItems.length; i += 2) {
      const pair: Item[] = [filteredItems[i]];
      if (i + 1 < filteredItems.length) {
        pair.push(filteredItems[i + 1]);
      }
      result.push(pair);
    }
    return result;
  }, [filteredItems]);

  if (isLoading) {
    return (
      <View className="mb-8 px-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-poppins-bold text-herb-primaryDark">Popular Herbs</Text>
        </View>
        <View className="px-5 flex-row flex-wrap justify-between">
          {Array.from({ length: 4 }).map((_, idx) => (
            <View 
              key={idx} 
              className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden border border-herb-divider"
              style={{ width: cardWidth }}
            >
              <View className="w-full h-36 bg-herb-surface animate-pulse" />
              <View className="p-3">
                <View className="h-5 bg-herb-surface rounded-full w-3/4 mb-2 animate-pulse" />
                <View className="h-4 bg-herb-surface rounded-full w-1/2 mb-2 animate-pulse" />
                <View className="h-6 bg-herb-surface rounded-full w-1/3 mt-2 animate-pulse" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <View className="mb-8 px-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-poppins-bold text-herb-primaryDark">Popular Herbs</Text>
        </View>
        <View className="bg-white p-6 rounded-2xl shadow-sm items-center justify-center border border-herb-divider">
          <Ionicons name="search-outline" size={40} color="#5F6F64" />
          <Text className="text-herb-muted mt-3 text-center font-poppins-medium">No herbs match your selection.</Text>
          <Pressable 
            onPress={() => setSelectedCategory(null)}
            className="mt-3 bg-herb-primary px-4 py-2 rounded-full active:bg-herb-primaryDark"
          >
            <Text className="text-white font-poppins-medium">Clear Filters</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center px-5 mb-5">
        <Text className="text-2xl font-poppins-bold text-herb-primaryDark">Popular Herbs</Text>
        <Pressable 
          onPress={() => router.push('/explore')}
          className="flex-row items-center bg-herb-primary/10 px-3 py-1.5 rounded-full active:bg-herb-primary/20"
        >
          <Text className="text-herb-primary font-poppins-semibold mr-1 text-sm">View All</Text>
          <Ionicons name="arrow-forward" size={14} color="#2B4D3F" />
        </Pressable>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        className="mb-5"
      >
        {categories.map(category => (
          <Pressable 
            key={category}
            onPress={() => setSelectedCategory(category === selectedCategory ? null : category)}
            className={`mr-3 px-4 py-2.5 rounded-full active:opacity-90 shadow-sm ${
              category === selectedCategory 
                ? "bg-herb-primary" 
                : "bg-white border border-herb-divider"
            }`}
          >
            <Text 
              className={`font-poppins-medium text-sm ${
                category === selectedCategory 
                  ? "text-white" 
                  : "text-herb-primaryDark"
              }`}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      
      <FlatList
        data={pairedData}
        renderItem={({ item: itemPair }) => (
          <View style={{ marginHorizontal: cardSpacing / 2 }}>
            <View style={{ marginBottom: itemPair.length > 1 ? cardSpacing : 0 }}>
              <HerbCard item={itemPair[0]} width={cardWidth} />
            </View>
            {itemPair[1] && (
              <HerbCard item={itemPair[1]} width={cardWidth} />
            )}
          </View>
        )}
        keyExtractor={(itemPair) => itemPair[0].id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: cardSpacing ? (20 - cardSpacing / 2) : 20 
        }}
      />
    </View>
  );
};

export default PopularHerbsSection;