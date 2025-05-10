import { FocusAwareStatusBar } from '@/components/common/status-bar';
import HerbCard from '@/components/home/HerbCard';
import { Item, useItemsStore } from '@/stores';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const numColumns = 2;
const cardMarginHorizontal = 8;
const listPaddingHorizontal = 16;

const cardWidth = (width - (listPaddingHorizontal * 2) - (cardMarginHorizontal * (numColumns - 1))) / numColumns;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Item>);

export default function ExploreScreen() {
  const { top } = useSafeAreaInsets();
  const { items, fetchItems, isLoading: itemsLoading, error: itemsError } = useItemsStore();
  const params = useLocalSearchParams<{ query?: string; autoFocus?: string }>() || {};

  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const searchInputRef = useRef<TextInput>(null);

  const categories = useMemo(() => {
    const cats = items
      .map(i => i.category)
      .filter((c): c is string => !!c);
    return Array.from(new Set(cats));
  }, [items]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setSearchQuery(params.query || '');
  }, [params.query]);

  useEffect(() => {
    if (params.autoFocus === 'true' && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [params.autoFocus]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) {
      result = result.filter(item => item.category === selectedCategory);
    }
    return result;
  }, [items, searchQuery, selectedCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const renderItem: ListRenderItem<Item> = ({ item, index }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
      style={{ width: cardWidth }}
    >
      <HerbCard item={item} width={cardWidth} />
    </Animated.View>
  );

  const flatListColumnWrapperStyle = {
    justifyContent: 'space-between' as 'space-between',
    marginBottom: 16,
  };

  return (
    <>
      <FocusAwareStatusBar />
      <View
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      >
        <Animated.View 
          entering={FadeIn}
          className="bg-white shadow-sm"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="px-5 pt-5 pb-3">
            <Text className="text-3xl font-poppins-bold text-herb-primaryDark mb-4">
              Explore Herbs
            </Text>
            <View 
              className="bg-herb-surface flex-row items-center px-4 h-14 rounded-xl border border-herb-divider/50"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1
              }}
            >
              <MaterialIcons name="search" size={24} color="#5F6F64" />
              <TextInput
                ref={searchInputRef}
                className="flex-1 ml-3 text-herb-textPrimary text-base font-poppins-regular"
                placeholder="Search for herbs, categories..."
                placeholderTextColor="#A0AEC0"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                style={{ height: '100%', paddingVertical: 0 }}
              />
              {searchQuery ? (
                <Pressable 
                  onPress={() => setSearchQuery('')} 
                  hitSlop={10}
                  className="active:opacity-70"
                >
                  <MaterialIcons name="close" size={22} color="#5F6F64" />
                </Pressable>
              ) : null}
            </View>
          </View>

          {categories.length > 0 && (
            <View className="border-b border-herb-divider/50">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' }}
              >
                <Pressable
                  onPress={() => setSelectedCategory(null)}
                  className={`mr-2.5 px-4 py-2 rounded-full border active:opacity-90 ${
                    !selectedCategory
                      ? 'bg-herb-primary border-herb-primary shadow'
                      : 'bg-herb-surface border-herb-divider'
                  }`}
                  style={!selectedCategory ? {
                    shadowColor: '#184229',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 2
                  } : {}}
                >
                  <Text
                    className={`text-sm font-poppins-medium ${
                      !selectedCategory ? 'text-white' : 'text-herb-primaryDark'
                    }`}
                  >
                    All
                  </Text>
                </Pressable>
                {categories.map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                    className={`mr-2.5 px-4 py-2 rounded-full border active:opacity-90 ${
                      cat === selectedCategory
                        ? 'bg-herb-primary border-herb-primary shadow'
                        : 'bg-herb-surface border-herb-divider'
                    }`}
                    style={cat === selectedCategory ? {
                      shadowColor: '#184229',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.15,
                      shadowRadius: 3,
                      elevation: 2
                    } : {}}
                  >
                    <Text
                      className={`text-sm font-poppins-medium capitalize ${
                        cat === selectedCategory ? 'text-white' : 'text-herb-primaryDark'
                      }`}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </Animated.View>

        {itemsLoading && items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2B4D3F" />
            <Text className="mt-3 font-poppins text-herb-muted">Loading herbs...</Text>
          </View>
        ) : itemsError ? (
          <Animated.View 
            entering={FadeInDown.springify()}
            className="flex-1 items-center justify-center px-6"
          >
            <MaterialIcons name="error-outline" size={48} color="#F28C0F" />
            <Text className="mt-3 text-xl font-poppins-semibold text-herb-error text-center">
              Failed to Load Herbs
            </Text>
            <Text className="mt-1 font-poppins text-herb-muted text-center">
              {itemsError.message || "An unexpected error occurred."}
            </Text>
            <Pressable
              onPress={() => fetchItems()}
              className="mt-6 bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark"
            >
              <Text className="text-white font-poppins-semibold text-lg">Retry</Text>
            </Pressable>
          </Animated.View>
        ) : filteredItems.length === 0 ? (
          <Animated.View 
            entering={FadeInDown.springify()}
            className="flex-1 items-center justify-center px-6"
          >
            <MaterialIcons name="search-off" size={48} color="#8D978F" />
            <Text className="mt-3 text-xl font-poppins-semibold text-herb-primaryDark text-center">
              No Herbs Found
            </Text>
            <Text className="mt-1 font-poppins text-herb-muted text-center">
              {searchQuery
                ? "Try adjusting your search or explore all items."
                : "There are no herbs available at the moment."}
            </Text>
            {(searchQuery || selectedCategory) && (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="mt-6 bg-herb-surface py-3 px-8 rounded-xl border border-herb-divider active:bg-herb-divider"
              >
                <Text className="text-herb-primary font-poppins-semibold text-lg">Clear All Filters</Text>
              </Pressable>
            )}
          </Animated.View>
        ) : (
          <AnimatedFlatList
            entering={FadeIn}
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item: Item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={{
              paddingHorizontal: listPaddingHorizontal - (cardMarginHorizontal / 2),
              paddingTop: 16, 
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={flatListColumnWrapperStyle}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#2B4D3F"
                colors={['#2B4D3F']}
              />
            }
          />
        )}
      </View>
    </>
  );
}