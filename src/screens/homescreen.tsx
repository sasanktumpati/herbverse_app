import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable, 
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HeroSection from '../components/home/HeroSection';
import PopularHerbsSection from '../components/home/PopularHerbsSection';
import RecentOrderSection from '../components/home/RecentOrderSection';
import WellnessTips from '../components/home/WellnessTips';
import { useItemsStore, useOrdersStore, useAuthStore } from '@/stores';
import { FocusAwareStatusBar } from '@/components/common/status-bar';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { items, isLoading: itemsLoading, fetchItems } = useItemsStore();
  const { orders, isLoading: ordersLoading } = useOrdersStore();
  const { profile } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearchPress = () => {
    router.push({ pathname: '/explore', params: { autoFocus: 'true' }});
  };
  
  const categories = useMemo(() => {
    const uniqueCategories = new Set(items.map(item => item.category).filter(Boolean) as string[]);
    return Array.from(uniqueCategories);
  }, [items]);

  const filteredPopularHerbs = useMemo(() => {
    if (!selectedCategory) {
      return items;
    }
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const numPopularColumns = 2;
  const popularSectionHorizontalPadding = 20;
  const popularCardSpacing = 16;
  const availableWidthForCards = screenWidth - (popularSectionHorizontalPadding * 2);
  const popularCardWidth = (availableWidthForCards - (popularCardSpacing * (numPopularColumns - 1))) / numPopularColumns;

  const recentOrder = orders.length > 0 ? orders[0] : null;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [-60, 0],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1 bg-herb-background">
      <FocusAwareStatusBar/>
      <Animated.View 
        style={[
          styles.header, 
          { 
            paddingTop: top, 
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />
        
        <View style={styles.headerContent}>
          <Text className="text-herb-primary font-poppins-semibold text-2xl">HerbVerse</Text>
          <Pressable 
            onPress={() => router.push('/profile')}
            className="h-10 w-10 rounded-full items-center justify-center overflow-hidden border border-herb-divider/60 shadow-sm"
          >
            {profile?.photoURL ? (
              <Image 
                source={{ uri: profile.photoURL }} 
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <LinearGradient
                colors={['#E6EFE4', '#C7D9C2']}
                className="h-10 w-10 rounded-full items-center justify-center"
              >
                <Text className="text-herb-primary font-poppins-semibold text-lg">
                  {profile?.displayName?.[0]?.toUpperCase() || 'H'}
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </Animated.View>
      
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        className="bg-herb-background"
      >
        <View style={{ paddingTop: top }} className="px-5">
          <View className="mb-6">
            <Text className="text-herb-primary font-poppins-medium text-base">Welcome back,</Text>
            <Text className="text-3xl font-poppins-bold text-herb-primaryDark">
              {profile?.displayName || 'Herb Enthusiast'} 👋
            </Text>
          </View>
          
          <Pressable 
            onPress={handleSearchPress}
            className="bg-white flex-row items-center px-4 h-14 rounded-xl mb-6 border border-herb-divider/50"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2
            }}
          >
            <MaterialIcons name="search" size={24} color="#5F6F64" />
            <Text className="flex-1 ml-3 text-herb-muted text-base font-poppins-regular">
              Search for herbs, spices...
            </Text>
          </Pressable>
        </View>
        
        <HeroSection />
        
        <View className="bg-white pt-8 rounded-t-3xl mt-4 shadow-inner"> 
          <PopularHerbsSection
            items={items}
            isLoading={itemsLoading}
            filteredItems={filteredPopularHerbs}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            cardWidth={popularCardWidth}
            cardSpacing={popularCardSpacing}
          />
          
          <RecentOrderSection 
            recentOrder={recentOrder}
            isLoading={ordersLoading}
          />
          
          <WellnessTips />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 230, 228, 0.2)',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
