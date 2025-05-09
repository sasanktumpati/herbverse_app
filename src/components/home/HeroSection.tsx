import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Pressable, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const SPACING = 12;

const HeroSection: React.FC = () => {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const heroData = [
    {
      id: '1',
      title: 'Seasonal Collection',
      description: 'Discover our handpicked organic herbs',
      image: 'https://images.unsplash.com/photo-1533792344354-ed5e8fc12494?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      color: ['rgba(159, 191, 135, 0.85)', 'rgba(90, 135, 77, 0.9)'] as const,
      buttonText: 'Shop Now',
      route: '/explore'
    },
    {
      id: '2',
      title: 'Wellness Essentials',
      description: 'Natural remedies for everyday health',
      image: 'https://images.unsplash.com/photo-1553744562-96972ff3cd46?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      color: ['rgba(255, 173, 173, 0.85)', 'rgba(237, 102, 102, 0.9)'] as const,
      buttonText: 'Learn More',
      route: '/explore'
    },
    {
      id: '3',
      title: 'Tea Collection',
      description: 'Premium herbal blends for relaxation',
      image: 'https://images.unsplash.com/photo-1491497895121-1334fc14d8c9?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      color: ['rgba(160, 196, 255, 0.85)', 'rgba(94, 163, 247, 0.9)'] as const,
      buttonText: 'Explore',
      route: '/explore'
    },
  ];
  
  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / (CARD_WIDTH + SPACING));
      setCurrentIndex(index);
    });
    
    return () => {
      scrollX.removeListener(listener);
    };
  }, [scrollX]);

  return (
    <View className="my-2">
      <Animated.FlatList
        data={heroData}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + SPACING),
            index * (CARD_WIDTH + SPACING),
            (index + 1) * (CARD_WIDTH + SPACING),
          ];
          
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              className="h-48 rounded-3xl overflow-hidden shadow-lg"
              style={[
                { 
                  width: CARD_WIDTH, 
                  marginRight: SPACING, 
                  transform: [{ scale }], 
                  opacity,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 6,
                }
              ]}
            >
              <LinearGradient
                colors={item.color}
                className="flex-1 justify-center rounded-3xl"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image 
                  source={{ uri: item.image }} 
                  className="absolute inset-0 rounded-3xl"
                  resizeMode="cover"
                  style={{ opacity: 0.35 }}
                />
                <View className="z-10 p-6">
                  <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-2 backdrop-blur-md border border-white/30">
                    <Text className="text-white font-poppins-semibold text-xs">NEW</Text>
                  </View>
                  <Text className="text-white font-poppins-bold text-2xl mb-1.5 shadow-text">
                    {item.title}
                  </Text>
                  <Text className="text-white/80 mb-3.5 shadow-text font-poppins-regular text-sm">
                    {item.description}
                  </Text>
                  <Pressable 
                    className="bg-white/25 backdrop-blur-md self-start px-5 py-2.5 rounded-full 
                               border border-white/30 flex-row items-center active:opacity-80
                               active:scale-95" 
                    onPress={() => router.push(item.route)}
                  >
                    <Text className="text-white font-poppins-semibold mr-1.5 text-sm">{item.buttonText}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              </LinearGradient>
            </Animated.View>
          );
        }}
      />
      
      <View className="flex-row justify-center mt-4">
        {heroData.map((_, index) => (
          <Animated.View
            key={`dot-${index}`}
            className={`h-2 mx-1 rounded-full ${
              currentIndex === index 
                ? 'w-5 bg-herb-primary' 
                : 'w-2 bg-herb-divider'
            }`}
            style={{
              transform: [
                { scale: currentIndex === index ? 1 : 0.8 }
              ],
              opacity: currentIndex === index ? 1 : 0.5,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default HeroSection;