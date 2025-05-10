import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
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

  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, [setSelectedCategory]);

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
      <View className="mb-8">
        <View className="flex-row justify-between items-center px-5 mb-4">
          <Text className="text-2xl font-poppins-bold text-herb-primaryDark">
            Popular Herbs
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          className="mb-5"
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <View
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-herb-divider/40 mr-3"
              style={{ 
                width: 100, 
                paddingVertical: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 1
              }}
            >
              <View className="h-4 bg-herb-surface/50 w-3/4 mx-auto rounded-full animate-pulse" />
            </View>
          ))}
        </ScrollView>
        
        <View className="flex-row flex-wrap px-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <View
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-herb-divider/40 mb-4 mx-2"
              style={{ 
                width: cardWidth - 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
                elevation: 2
              }}
            >
              <View className="w-full h-36 bg-herb-surface/50 animate-pulse" />
              <View className="p-3">
                <View className="h-5 bg-herb-surface/50 rounded-full w-3/4 mb-2 animate-pulse" />
                <View className="h-6 bg-herb-surface/50 rounded-full w-1/3 mt-2 animate-pulse" />
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
        <View className="bg-white p-6 rounded-2xl items-center justify-center border border-herb-divider/40"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
            elevation: 1
          }}
        >
          <MaterialIcons name="search-off" size={40} color="#8D978F" />
          <Text className="text-herb-muted mt-3 text-center font-poppins-medium">No herbs match your selection.</Text>
          <Pressable 
            onPress={() => handleCategorySelect(null)}
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
          <MaterialIcons name="arrow-forward" size={14} color="#2B4D3F" />
        </Pressable>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        className="mb-5"
      >
        <Pressable 
          onPress={() => handleCategorySelect(null)}
          className={`mr-3 px-4 py-2.5 rounded-full active:opacity-90 ${
            !selectedCategory 
              ? "bg-herb-primary shadow-sm" 
              : "bg-white border border-herb-divider/40"
          }`}
          style={!selectedCategory ? {
            shadowColor: '#184229',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2
          } : {}}
        >
          <Text 
            className={`font-poppins-medium text-sm ${
              !selectedCategory 
                ? "text-white" 
                : "text-herb-primaryDark"
            }`}
          >
            All
          </Text>
        </Pressable>
        
        {categories.map(category => (
          <Pressable 
            key={category}
            onPress={() => handleCategorySelect(category === selectedCategory ? null : category)}
            className={`mr-3 px-4 py-2.5 rounded-full active:opacity-90 ${
              category === selectedCategory 
                ? "bg-herb-primary shadow-sm" 
                : "bg-white border border-herb-divider/40"
            }`}
            style={category === selectedCategory ? {
              shadowColor: '#184229',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2
            } : {}}
          >
            <Text 
              className={`font-poppins-medium text-sm capitalize ${
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
        keyExtractor={(itemPair) => itemPair[0]?.id || 'empty'}
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