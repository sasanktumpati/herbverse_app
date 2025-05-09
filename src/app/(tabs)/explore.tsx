import { FocusAwareStatusBar } from '@/components/common/status-bar';
import HerbCard from '@/components/home/HerbCard';
import { Item, useItemsStore } from '@/stores';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const numColumns = 2;
const cardMarginHorizontal = 8;
const listPaddingHorizontal = 16;

const cardWidth = (width - (listPaddingHorizontal * 2) - (cardMarginHorizontal * (numColumns - 1))) / numColumns;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { items, fetchItems, isLoading, error: itemsError } = useItemsStore();
  const params = useLocalSearchParams<{ query?: string; autoFocus?: string }>() || {};

  const [searchQuery, setSearchQuery] = React.useState(params.query || '');

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setSearchQuery(params.query || '');
  }, [params.query]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) {
      return items;
    }
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const renderItem = ({ item }: { item: Item }) => (
    <View style={{ width: cardWidth }}>
      <HerbCard item={item} width={cardWidth} />
    </View>
  );

  const flatListColumnWrapperStyle = {
    justifyContent: 'space-between' as 'space-between',
    marginBottom: 16,
  };

  return (
    <>
      <FocusAwareStatusBar />
      <View
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        className="flex-1 bg-herb-surface"
      >
        <View className="px-5 pt-5 pb-3">
          <Text className="text-3xl font-poppins-bold text-herb-primaryDark mb-4">
            Explore Herbs
          </Text>

          <View className="bg-white flex-row items-center px-4 h-14 rounded-xl shadow-md border border-herb-divider/70">
            <MaterialIcons name="search" size={24} color="#5F6F64" />
            <TextInput
              className="flex-1 ml-3 text-herb-textPrimary text-base font-poppins-regular"
              placeholder="Search for herbs, categories..."
              placeholderTextColor="#A0AEC0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={params.autoFocus === 'true'}
              returnKeyType="search"
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                <MaterialIcons name="close" size={22} color="#5F6F64" />
              </Pressable>
            ) : null}
          </View>
        </View>

        {isLoading && items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2B4D3F" />
            <Text className="mt-3 font-poppins text-herb-muted">Loading herbs...</Text>
          </View>
        ) : itemsError ? (
          <View className="flex-1 items-center justify-center px-6">
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
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <MaterialIcons name="search-off" size={48} color="#8D978F" />
            <Text className="mt-3 text-xl font-poppins-semibold text-herb-primaryDark text-center">
              No Herbs Found
            </Text>
            <Text className="mt-1 font-poppins text-herb-muted text-center">
              {searchQuery
                ? "Try adjusting your search or explore all items."
                : "There are no herbs available at the moment."}
            </Text>
            {searchQuery && (
              <Pressable
                onPress={() => setSearchQuery('')}
                className="mt-6 bg-herb-surface py-3 px-8 rounded-xl border border-herb-divider active:bg-herb-divider"
              >
                <Text className="text-herb-primary font-poppins-semibold text-lg">Clear Search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={{
              paddingHorizontal: listPaddingHorizontal - (cardMarginHorizontal / 2),
              paddingTop: 8,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={flatListColumnWrapperStyle}
          />
        )}
      </View>
    </>
  );
}