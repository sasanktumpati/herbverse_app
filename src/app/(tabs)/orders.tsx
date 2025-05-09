import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, SectionList, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useOrdersStore from '../../../src/stores/ordersStore';
import StatusBadge from '../../components/ui/StatusBadge';

const ORDER_STATUSES = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { orders, isLoading, error, fetchUserOrders } = useOrdersStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (orders.length === 0 && !isLoading) {
        fetchUserOrders(); 
    }
  }, [fetchUserOrders, isLoading, orders.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserOrders();
    setRefreshing(false);
  }, [fetchUserOrders]);
  
  const groupedOrders = React.useMemo(() => {
    if (!orders.length) return [];
    
    const sortedOrders = [...orders].sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
    
    const filteredOrders = activeFilter === "all" 
      ? sortedOrders 
      : sortedOrders.filter(order => order.status === activeFilter);
    
    const groups = {};
    filteredOrders.forEach(order => {
      if (!order.createdAt || !order.createdAt.toDate) return;
      
      const orderDate = order.createdAt.toDate();
      const dateKey = orderDate.toDateString();
      
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let title;
      if (dateKey === now.toDateString()) {
        title = "Today";
      } else if (dateKey === yesterday.toDateString()) {
        title = "Yesterday";
      } else {
        title = orderDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
      
      if (!groups[title]) {
        groups[title] = [];
      }
      
      groups[title].push(order);
    });
    
    return Object.keys(groups).map(title => ({
      title,
      data: groups[title]
    }));
  }, [orders, activeFilter]);

  if (isLoading && orders.length === 0) {
    return (
      <View style={{ paddingTop: top, paddingBottom: bottom + 75 }} className="flex-1 items-center justify-center bg-herb-background">
        <ActivityIndicator size="large" color="#2B4D3F" />
        <Text className="text-herb-muted font-poppins mt-2">Loading your orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ paddingTop: top, paddingBottom: bottom + 75 }} className="flex-1 items-center justify-center bg-herb-background px-5">
        <MaterialIcons name="error-outline" size={48} color="#F28C0F" />
        <Text className="text-xl font-poppins-semibold text-herb-error mt-3 text-center">Failed to Load Orders</Text>
        <Text className="text-herb-muted font-poppins text-center mt-1 mb-4">{error.message}</Text>
        <Pressable 
          onPress={onRefresh} 
          className="bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark"
        >
          <Text className="text-white font-poppins-semibold text-lg">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={{ paddingTop: top, paddingBottom: bottom + 75 }} className="flex-1 items-center justify-center bg-herb-background px-5">
        <LinearGradient
          colors={['rgba(224, 231, 223, 0.8)', 'rgba(192, 210, 186, 0.6)']}
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
        >
          <MaterialIcons name="receipt-long" size={40} color="#3E6643" />
        </LinearGradient>
        <Text className="text-2xl font-poppins-bold text-herb-primaryDark mt-2">No Orders Yet</Text>
        <Text className="text-herb-muted font-poppins text-lg text-center mt-2 mb-6">Your past orders will appear here once you&apos;ve made a purchase.</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/explore')}
          className="bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark"
        >
          <Text className="text-white font-poppins-semibold text-lg">Shop Now</Text>
        </Pressable>
      </View>
    );
  }

  const renderOrderItem = ({ item }) => {
    const date = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'N/A';
    const time = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return (
      <Link href={{ pathname: "/order/[id]", params: { id: item.id } }} asChild>
        <TouchableOpacity className="mb-6 bg-white rounded-2xl shadow-lg border border-herb-divider/70 overflow-hidden" activeOpacity={0.8}>
          {/* Header with icon, title, date and status */}
          <View className="px-5 py-4 flex-row items-center justify-between border-b border-herb-divider/70">
            <View className="flex-row items-center">
              <LinearGradient colors={['#EAF2E8', '#DCE7D9']} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="receipt-outline" size={20} color="#3E6643" />
              </LinearGradient>
              <View>
                <Text className="text-lg font-poppins-bold text-herb-primaryDark">Order #{item.orderNumber || item.id.substring(0,8)}</Text>
                <Text className="text-sm text-herb-muted font-poppins mt-0.5">{date} at {time}</Text>
              </View>
            </View>
            <StatusBadge status={item.status} size="medium" />
          </View>
          {/* Body with items count and previews */}
          <View className="px-5 py-4 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-herb-muted font-poppins-medium">{item.totalQuantity} item{item.totalQuantity > 1 ? 's' : ''}</Text>
              <Text className="text-base font-poppins-bold text-herb-primaryDark">${item.totalPrice.toFixed(2)}</Text>
            </View>
            {item.items && item.items.length > 0 && (
              <View className="flex-row flex-wrap">
                {item.items.slice(0, 3).map((orderItem, idx) => (
                  <View key={orderItem.id + '-' + idx} className="bg-herb-surface/70 mr-2 mb-2 px-3 py-1 rounded-full">
                    <Text className="text-xs font-poppins text-herb-primaryDark">{orderItem.quantity}× {orderItem.name}</Text>
                  </View>
                ))}
                {item.items.length > 3 && (
                  <View className="bg-herb-primary/10 px-3 py-1 rounded-full mb-2">
                    <Text className="text-xs font-poppins text-herb-primary">+{item.items.length - 3} more</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          {/* Footer with view details */}
          <View className="px-5 py-3 bg-herb-background flex-row items-center justify-center">
            <Text className="text-sm font-poppins-medium text-herb-primary mr-1.5">View Details</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#2B4D3F" />
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View className="bg-herb-surface/0 py-2 px-1 my-1 rounded-lg">
      <Text className="text-herb-primaryDark font-poppins-semibold text-lg">{section.title}</Text>
    </View>
  );

  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={{ paddingBottom: bottom + 75 }} className="flex-1 bg-herb-background">
        <View style={{ paddingTop: top }} className="bg-white shadow-sm">
          <View className="px-5 pt-5 pb-4">
            <Text className="text-3xl font-poppins-bold text-herb-primaryDark">My Orders</Text>
          </View>
        
          <View className="border-b border-herb-divider/70">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' }}
            >
              {ORDER_STATUSES.map(status => (
                <Pressable 
                  key={status}
                  onPress={() => setActiveFilter(status)}
                  className={`mr-2.5 px-4 py-2 rounded-full border ${
                    activeFilter === status 
                      ? 'bg-herb-primary border-herb-primary'
                      : 'bg-herb-surface border-herb-divider'
                  }`}
                >
                  <Text 
                    className={`text-sm font-poppins-medium capitalize ${
                      activeFilter === status ? 'text-white' : 'text-herb-primaryDark'
                    }`}
                  >
                    {status === 'all' ? 'All Orders' : status}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
        
        {groupedOrders.length > 0 ? (
          <SectionList
            sections={groupedOrders}
            renderItem={renderOrderItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop:12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={["#2B4D3F"]} 
                tintColor={"#2B4D3F"}
              />
            }
            ListFooterComponent={isLoading && orders.length > 0 ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#2B4D3F" />
                <Text className="text-herb-muted text-sm mt-2">Loading more orders...</Text>
              </View>
            ) : null}
            ListEmptyComponent={activeFilter !== "all" ? (
              <View className="flex-1 items-center justify-center py-10 px-6">
                <MaterialIcons name="filter-list-off" size={56} color="#8D978F" />
                <Text className="text-xl font-poppins-semibold text-herb-primaryDark text-center mt-4">
                  No {activeFilter} orders
                </Text>
                <Text className="text-herb-muted font-poppins text-center mt-1 mb-6">
                  You currently have no orders with this status.
                </Text>
                <Pressable 
                  onPress={() => setActiveFilter("all")} 
                  className="mt-4 bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark"
                >
                  <Text className="text-white font-poppins-semibold text-lg">View All Orders</Text>
                </Pressable>
              </View>
            ) : null}
          />
        ) : (
          
          <View className="flex-1 items-center justify-center px-6">
            <MaterialIcons name="filter-list-off" size={56} color="#8D978F" />
            <Text className="text-xl font-poppins-semibold text-herb-primaryDark text-center mt-4">
              No orders to display
            </Text>
            <Text className="text-herb-muted font-poppins text-center mt-1 mb-6">
              {activeFilter === "all" 
                ? "It seems you haven't placed any orders yet."
                : `You have no orders with the status: ${activeFilter}.`}
            </Text>
            <Pressable 
              onPress={() => router.push('/(tabs)/explore')}
              className="bg-herb-primary py-3 px-8 rounded-xl shadow active:bg-herb-primaryDark"
            >
              <Text className="text-white font-poppins-semibold text-lg">Start Shopping</Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}