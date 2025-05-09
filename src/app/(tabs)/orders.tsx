import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, SectionList, Text, View } from 'react-native';
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
  }, []);

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
      <View style={{ paddingTop: top, paddingBottom: bottom + 75 }} className="flex-1 items-center justify-center bg-herb-surface">
        <ActivityIndicator size="large" color="#2B4D3F" />
        <Text className="text-herb-muted font-poppins mt-2">Loading your orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ paddingTop: top, paddingBottom: bottom + 75 }} className="flex-1 items-center justify-center bg-herb-surface px-5">
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
      <View style={{ paddingTop: top, paddingBottom: bottom + 75 }} className="flex-1 items-center justify-center bg-herb-surface px-5">
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
    const renderOrderProgress = () => {
      const steps = ["pending", "processing", "shipped", "delivered"];
      const currentStepIndex = steps.indexOf(item.status);
      
      if (item.status === "cancelled" || item.status === "failed") {
        return null; 
      }
      
      return (
        <View className="flex-row items-center mt-3 mb-2 px-1">
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <View className="flex-1 items-center"> 
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
                    idx <= currentStepIndex
                      ? 'bg-herb-primary border-herb-primary'
                      : 'bg-white border-herb-divider'
                  }`}
                >
                  {idx <= currentStepIndex && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <Text
                  className={`text-xs capitalize mt-1 text-center ${
                    idx <= currentStepIndex ? 'text-herb-primary font-poppins-medium' : 'text-herb-muted font-poppins'
                  }`}
                  numberOfLines={1}
                >
                  {step}
                </Text>
              </View>
              {idx < steps.length - 1 && (
                <View
                  className={`h-0.5 flex-1 mx-1 ${ 
                    idx < currentStepIndex
                      ? 'bg-herb-primary'
                      : 'bg-herb-divider'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      );
    };

    return (
      <Link href={{ pathname: "/order/[id]", params: { id: item.id } }} asChild>
        <Pressable className="bg-white p-4 mb-4 rounded-xl shadow-md border border-herb-divider/70 active:bg-herb-surface/50">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-lg font-poppins-bold text-herb-primaryDark">Order #{item.orderNumber || item.id.substring(0,8)}</Text>
              <Text className="text-sm text-herb-muted font-poppins mt-0.5">{date} at {time}</Text>
            </View>
            <StatusBadge status={item.status} size="medium" />
          </View>

          {renderOrderProgress()}

          <View className="mt-3 pt-3 border-t border-herb-divider/70">
            <View className="flex-row justify-between items-center mb-1.5">
              <Text className="text-sm text-herb-muted font-poppins">
                {item.totalQuantity} item{item.totalQuantity > 1 ? 's' : ''}
              </Text>
              <Text className="text-base font-poppins-semibold text-herb-primaryDark">${item.totalPrice.toFixed(2)}</Text>
            </View>
            
            {item.items && item.items.length > 0 && (
              <View className="flex-row flex-wrap mt-1.5">
                {item.items.slice(0, 3).map((orderItem, index) => (
                  <View 
                    key={orderItem.id + '-' + index} 
                    className="bg-herb-surface/70 mr-1.5 mb-1.5 px-2.5 py-1 rounded-full"
                  >
                    <Text className="text-xs font-poppins text-herb-primaryDark">
                      {orderItem.quantity}× {orderItem.name}
                    </Text>
                  </View>
                ))}
                {item.items.length > 3 && (
                  <View className="bg-herb-primary/10 px-2.5 py-1 rounded-full mb-1.5">
                    <Text className="text-xs font-poppins text-herb-primary">+{item.items.length - 3} more</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View className="flex-row justify-end items-center mt-3 bg-herb-primary/10 p-2.5 rounded-lg active:bg-herb-primary/20">
            <Text className="text-sm font-poppins-medium text-herb-primary mr-1.5">View Details</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#2B4D3F" />
          </View>
        </Pressable>
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
      <View style={{ paddingBottom: bottom + 75 }} className="flex-1 bg-herb-surface">
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