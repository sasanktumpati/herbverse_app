import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import LoadingSpinner from '../ui/LoadingSpinner';
import StatusBadge from '../ui/StatusBadge';
import { Order } from '@/stores';

interface RecentOrderSectionProps {
  recentOrder: Order | null;
  isLoading: boolean;
}

const RecentOrderSection: React.FC<RecentOrderSectionProps> = ({ recentOrder, isLoading }) => {
  if (isLoading) {
    return (
      <View className="px-5 mb-8">
        <Text className="text-2xl font-poppins-bold text-herb-primaryDark mb-4">Recent Order</Text>
        <View 
          className="bg-white p-6 rounded-2xl items-center justify-center h-32 border border-herb-divider/40"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2
          }}
        >
          <LoadingSpinner size="small" />
          <Text className="text-herb-muted mt-2 font-poppins-regular">Loading your orders...</Text>
        </View>
      </View>
    );
  }

  if (!recentOrder) {
    return (
      <View className="px-5 mb-8">
        <Text className="text-2xl font-poppins-bold text-herb-primaryDark mb-4">Recent Order</Text>
        <View 
          className="bg-white p-8 rounded-2xl items-center justify-center border border-herb-divider/40"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2
          }}
        >
          <LinearGradient
            colors={['rgba(224, 231, 223, 0.7)', 'rgba(192, 210, 186, 0.5)']}
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
          >
            <MaterialIcons name="shopping-bag" size={32} color="#2B4D3F" />
          </LinearGradient>
          <Text className="text-herb-primaryDark text-lg font-poppins-semibold text-center">No orders yet</Text>
          <Text className="text-herb-muted text-sm mt-1 text-center px-6 font-poppins-regular">
            Your order history will appear here once you make your first purchase.
          </Text>
          <Link href="/explore" asChild>
            <Pressable className="mt-5 bg-herb-primary px-6 py-3 rounded-full items-center shadow-sm active:bg-herb-primaryDark">
              <Text className="text-white font-poppins-semibold">Browse Herbs</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View className="px-5 mb-8">
      <Text className="text-2xl font-poppins-bold text-herb-primaryDark mb-4">Recent Order</Text>
      <View 
        className="bg-white rounded-2xl overflow-hidden border border-herb-divider/40"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2
        }}
      >
        <View className="p-4 border-b border-herb-divider/40">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <LinearGradient
                colors={['#EAF2E8', '#DCE7D9']}
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
              >
                <MaterialIcons name="receipt" size={22} color="#2B4D3F" />
              </LinearGradient>
              <View>
                <Text className="text-herb-primaryDark font-poppins-semibold text-lg">
                  Order #{recentOrder.orderNumber || recentOrder.id.substring(0, 6)}
                </Text>
                <View className="flex-row items-center">
                  <MaterialIcons name="event" size={12} color="#5F6F64" />
                  <Text className="text-herb-muted text-xs ml-1 font-poppins-regular">
                    {recentOrder.createdAt?.toDate().toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
            <StatusBadge status={recentOrder.status} size="small" />
          </View>
        </View>
        
        <View className="p-4">
          <View className="flex-row items-center justify-between p-3 bg-herb-surface/50 rounded-xl mb-4">
            <View className="flex-row items-center">
              <MaterialIcons name="inventory-2" size={18} color="#3E6643" />
              <Text className="text-herb-primaryDark font-poppins-medium text-sm ml-2">
                {recentOrder.items?.length || 0} {recentOrder.items?.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <Text className="text-herb-primary font-poppins-bold text-base">
              ${recentOrder.totalPrice?.toFixed(2) || '0.00'}
            </Text>
          </View>
          
          <View className="mb-4">
            {recentOrder.items?.slice(0, 3).map((item, index) => (
              <View 
                key={item.id + index} 
                className="flex-row items-center mb-2 p-2.5 bg-herb-surface/30 rounded-lg"
              >
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-8 h-8 rounded-md mr-3"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-8 h-8 rounded-md mr-3 bg-herb-primary/10 items-center justify-center">
                    <MaterialIcons name="eco" size={16} color="#3E6643" />
                  </View>
                )}
                <Text className="text-herb-primaryDark text-sm font-poppins-medium flex-1" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-herb-primary text-xs font-poppins-semibold bg-herb-primary/10 px-2 py-1 rounded-full">
                  {item.quantity}×
                </Text>
              </View>
            ))}
            
            {recentOrder.items?.length > 3 && (
              <View className="bg-herb-primary/10 p-2 rounded-lg mb-2 flex-row items-center justify-center">
                <MaterialIcons name="more-horiz" size={16} color="#3E6643" />
                <Text className="text-herb-primary text-xs font-poppins-medium ml-1">
                  {recentOrder.items.length - 3} more items
                </Text>
              </View>
            )}
          </View>
          
          <Link href={`/order/${recentOrder.id}`} asChild>
            <Pressable 
              className="bg-herb-primary py-3.5 rounded-xl items-center shadow-sm active:bg-herb-primaryDark"
              style={{
                shadowColor: '#184229',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}
            >
              <Text className="text-white font-poppins-semibold">View Order Details</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
};

export default RecentOrderSection;