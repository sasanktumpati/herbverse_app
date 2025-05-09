import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, interpolateColor, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useCartStore from '../stores/cartStore';

function TabItem({ isFocused, label, routeName, onPress, badge = 0 }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFocused ? 1.1 : 1, { damping: 15, stiffness: 200 }) }],
  }));

  const getIconName = (routeName: string): keyof typeof MaterialIcons.glyphMap => {
    switch (routeName) {
      case 'index': return 'home';
      case 'explore': return 'search';
      case 'cart': return 'shopping-cart';
      case 'orders': return 'receipt-long';
      case 'profile': return 'person';
      default: return 'help-outline';
    }
  };

  return (
    <Pressable 
      onPress={onPress} 
      className="flex-1 h-full items-center justify-center"
    >
      <View className="items-center justify-center py-2">
        <Animated.View style={animatedStyle} className="relative">
          <MaterialIcons 
            name={getIconName(routeName)} 
            size={24} 
            color={isFocused ? '#2B4D3F' : '#8D978F'} 
          />
          {badge > 0 && (
            <View className="absolute -top-1.5 -right-3 bg-orange-500 rounded-[10px] min-w-[18px] h-[18px] items-center justify-center border-[1.5px] border-white shadow-sm">
              <Text className="text-white font-poppins-medium text-xs">
                {badge > 9 ? '9+' : badge}
              </Text>
            </View>
          )}
        </Animated.View>
        <Text className={`text-xs font-poppins-medium mt-1 ${isFocused ? 'text-herb-primaryDark' : 'text-herb-muted'}`}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
  descriptors,
}) => {
  const { bottom } = useSafeAreaInsets();
  const cart = useCartStore(state => state.cart);
  const cartItemCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <View 
      className="w-full absolute bottom-0 left-0 right-0 bg-white shadow-lg border-t border-herb-divider/30"
      style={{ 
        height: 58 + bottom,
        paddingBottom: bottom,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <BlurView intensity={10} tint="light" className="absolute inset-0">
        <View className="absolute inset-0 bg-white/95" />
      </BlurView>
      
      <View className="flex-row items-center justify-around h-full px-2">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem 
              key={route.key} 
              routeName={route.name}
              label={label}
              isFocused={isFocused} 
              onPress={onPress}
              badge={route.name === 'cart' ? cartItemCount : 0}
            />
          );
        })}
      </View>
    </View>
  );
};

export default TabBar;