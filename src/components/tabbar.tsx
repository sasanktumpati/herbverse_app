import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useCartStore from '../stores/cartStore';

const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
  descriptors,
}) => {
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = 72;

  const cart = useCartStore(state => state.cart);
  const cartItemCountValue = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const getIconName = (routeName: string, isFocused: boolean): [string, string] => {
    switch (routeName) {
      case 'index':
        return ['home', 'Home'];
      case 'explore':
        return ['leaf', 'Explore'];
      case 'cart':
        return ['cart', 'Cart'];
      case 'orders':
        return ['receipt', 'Orders'];
      case 'profile':
        return ['person', 'Profile'];
      default:
        return ['help-circle', routeName];
    }
  };

  return (
    <View 
      className="w-full absolute bottom-0 left-0 right-0 bg-white/85 rounded-t-3xl shadow-[0_-2px_8px_rgba(0,0,0,0.12)] overflow-hidden border-t border-t-gray-200/50"
      style={[
        { 
          height: tabBarHeight + bottom,
          paddingBottom: bottom
        }
      ]}
    >
      <BlurView intensity={95} tint="light" className="absolute inset-0">
        <View className="absolute inset-0 bg-white/75" />
      </BlurView>
      
      <View className="flex-row items-center justify-around h-full">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const [iconName, label] = getIconName(route.name, isFocused);
          
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
              label={label}
              iconName={iconName}
              isFocused={isFocused}
              onPress={onPress}
              showBadge={route.name === 'cart' && cartItemCountValue > 0}
              badgeCount={cartItemCountValue}
            />
          );
        })}
      </View>
    </View>
  );
};

interface TabItemProps {
  label: string;
  iconName: string;
  isFocused: boolean;
  onPress: () => void;
  showBadge?: boolean;
  badgeCount?: number;
}

const TabItem: React.FC<TabItemProps> = ({ 
  label, 
  iconName, 
  isFocused, 
  onPress,
  showBadge = false,
  badgeCount = 0
}) => {
  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0.7, { duration: 200 }),
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0.6, { duration: 200 }),
      transform: [{ 
        translateY: withSpring(isFocused ? 0 : 2, { 
          damping: 20, 
          stiffness: 300 
        }) 
      }],
      color: interpolateColor(
        withTiming(isFocused ? 1 : 0, { duration: 200 }),
        [0, 1],
        ['#8D978F', '#2B4D3F'] 
      ),
    };
  });

  return (
    <Pressable 
      onPress={onPress} 
      className="flex-1 h-full items-center justify-center"
      android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: true, radius: 24}}
    >
      <Animated.View className="items-center justify-center py-2 px-3 rounded-2xl">
        <View className="items-center justify-center mb-0.5 relative">
          <Animated.View style={iconAnimatedStyle}>
            <Ionicons
              name={iconName as any}
              size={26}
              color={isFocused ? '#2B4D3F' : '#8D978F'}
            />
            
            {showBadge && (
              <View className="absolute -top-1.5 -right-2 bg-orange-500 rounded-[10px] min-w-[18px] h-[18px] items-center justify-center border-[1.5px] border-white shadow-[0_1px_1px_rgba(0,0,0,0.2)] elevation-2">
                <Text className="text-white font-poppins-medium text-xs">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
        
        <Animated.Text 
          className="text-xs font-poppins-medium mt-[3px]" 
          style={labelAnimatedStyle}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export default TabBar;