import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Switch, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { FocusAwareStatusBar } from '@/components/common/status-bar';
import useUIStore from '@/stores/uiStore';
import useVendorItemsStore, { VendorItem } from '@/stores/vendor/vendorItemsStore';
import { Image } from 'expo-image';

const ItemCard: React.FC<{ item: VendorItem; onToggleActive: (id: string, isActive: boolean) => void; onEdit: (id: string) => void; }> = React.memo(({ item, onToggleActive, onEdit }) => {
  const [isActive, setIsActive] = useState(item.isActive);

  useEffect(() => {
    setIsActive(item.isActive);
  }, [item.isActive]);

  const handleToggle = (value: boolean) => {
    setIsActive(value); 
    onToggleActive(item.id, value);
  };
  
  return (
    <Pressable 
      onPress={() => onEdit(item.id)}
      className="bg-white p-4 mb-4 rounded-2xl shadow-lg border border-herb-divider/50 active:bg-herb-surface/50"
    >
      <View className="flex-row items-center">
        {item.imageUrl ? (
          <Image 
            source={item.imageUrl} 
            className="w-20 h-20 rounded-xl bg-herb-surface" 
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="w-20 h-20 rounded-xl bg-herb-surface items-center justify-center">
            <Ionicons name="leaf-outline" size={32} color="#3E6643" />
          </View>
        )}
        <View className="flex-1 ml-4">
          <Text className="text-lg font-poppins-semibold text-herb-primaryDark" numberOfLines={2}>{item.name}</Text>
          <Text className="text-sm font-poppins text-herb-muted mt-0.5" numberOfLines={2}>{item.description}</Text>
          <Text className="text-lg font-poppins-bold text-herb-accent mt-1.5">${item.price.toFixed(2)}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-herb-divider/60">
        <View className="flex-row items-center">
          <Switch
            trackColor={{ false: "#D1D5DB", true: "#6EE7B7" }}
            thumbColor={isActive ? "#10B981" : "#F3F4F6"}
            ios_backgroundColor="#D1D5DB"
            onValueChange={handleToggle}
            value={isActive}
          />
          <Text className={`ml-2 font-poppins-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <Pressable 
          onPress={() => onEdit(item.id)}
          className="flex-row items-center bg-herb-primary/10 py-2 px-4 rounded-xl active:bg-herb-primary/20"
        >
          <MaterialIcons name="edit" size={18} color="#2B4D3F" />
          <Text className="text-herb-primaryDark font-poppins-medium text-base ml-2">Edit Item</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});
ItemCard.displayName = "VendorItemCard";

export default function VendorItemsScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const showAlert = useUIStore(state => state.showAlert);
  const { 
    vendorItems, 
    isLoading, 
    error, 
    fetchVendorItems, 
    toggleItemActiveStatus 
  } = useVendorItemsStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVendorItems();
  }, [fetchVendorItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVendorItems();
    setRefreshing(false);
  }, [fetchVendorItems]);

  const handleToggleActive = async (itemId: string, isActive: boolean) => {
    await toggleItemActiveStatus(itemId, isActive);
    
  };

  const handleEditItem = (itemId: string) => {
    router.push(`/vendor/items/edit/${itemId}`);
  };
  
  if (isLoading && vendorItems.length === 0 && !refreshing) {
    return (
      <View style={{ paddingTop: top }} className="flex-1 items-center justify-center bg-herb-surface-alt">
        <ActivityIndicator size="large" color="#2B4D3F" />
        <Text className="text-herb-muted font-poppins mt-2">Loading your items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ paddingTop: top }} className="flex-1 items-center justify-center bg-herb-surface-alt px-5">
        <MaterialIcons name="error-outline" size={48} color="#F28C0F" />
        <Text className="text-xl font-poppins-semibold text-herb-error mt-3 text-center">Failed to Load Items</Text>
        <Text className="text-herb-muted font-poppins text-center mt-1 mb-4">{error.message}</Text>
        <Pressable onPress={onRefresh} className="bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark">
          <Text className="text-white font-poppins-semibold text-lg">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
    <FocusAwareStatusBar />
    <View style={{ flex: 1, paddingTop: top }} className="bg-herb-surface-alt">
      <View className="px-5 pt-6 pb-4 bg-white shadow-sm">
        <Text className="text-3xl font-poppins-bold text-herb-primaryDark">My Items</Text>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-herb-muted font-poppins">Manage your store inventory</Text>
          <Link href="/vendor/items/add" asChild>
            <Pressable className="bg-herb-primary p-3 rounded-xl shadow-md active:bg-herb-primaryDark flex-row items-center">
              <MaterialIcons name="add" size={20} color="white" />
              <Text className="text-white font-poppins-semibold ml-1">Add Item</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {vendorItems.length === 0 && !isLoading ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-herb-surface/50 w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="file-tray-stacked-outline" size={40} color="#8D978F" />
          </View>
          <Text className="text-xl font-poppins-semibold text-herb-primaryDark text-center">No Items Yet</Text>
          <Text className="text-herb-muted font-poppins text-center mt-2 mb-6 max-w-[280px]">
            Add your first herb or product to start selling on the marketplace.
          </Text>
          <Link href="/vendor/items/add" asChild>
            <Pressable className="bg-herb-primary py-3.5 px-8 rounded-xl shadow-lg active:bg-herb-primaryDark">
              <Text className="text-white font-poppins-semibold text-lg">Add New Item</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <FlatList
          data={vendorItems}
          renderItem={({ item }) => (
            <ItemCard 
              item={item} 
              onToggleActive={handleToggleActive} 
              onEdit={handleEditItem} 
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ 
            paddingHorizontal: 16, 
            paddingTop: 16, 
            paddingBottom: 20 
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={["#2B4D3F"]} 
              tintColor="#2B4D3F"
            />
          }
          ListFooterComponent={isLoading && vendorItems.length > 0 ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#2B4D3F" />
            </View>
          ) : null}
        />
      )}
    </View>
    </>
  );
}
