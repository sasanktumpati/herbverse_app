import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backAction?: () => void;
  rightAction?: () => void;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  transparent?: boolean;
  textColor?: string;
  iconColor?: string;
  showBorder?: boolean;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  backAction,
  rightAction,
  rightIcon,
  transparent = false,
  textColor = "#1E352C",
  iconColor = "#1E352C",
  showBorder = !transparent,
  subtitle
}) => {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  
  const containerBaseClasses = "w-full px-4 pb-3 z-10";
  const modeClasses = transparent 
    ? "bg-transparent" 
    : `bg-white ${showBorder ? 'border-b border-herb-divider/40' : ''}`;

  return (
    <View 
      style={{ paddingTop: top + 10 }} 
      className={`${containerBaseClasses} ${modeClasses}`}
    >
      {transparent && (
        <BlurView 
          intensity={60} 
          tint="light" 
          className="absolute inset-0"
        />
      )}
      
      <View className="flex-row items-center justify-between">
        {showBack ? (
          <Pressable 
            onPress={() => backAction ? backAction() : router.back()}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-herb-surface/50"
            style={{
              shadowColor: transparent ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: transparent ? 0.1 : 0,
              shadowRadius: 4,
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color={iconColor} />
          </Pressable>
        ) : (
          <View className="w-10" />
        )}
        
        <View className="flex-1 items-center">
          <Text 
            style={{ color: textColor }} 
            className="text-xl font-poppins-bold text-center"
            numberOfLines={1}
          >
            {title}
          </Text>
          
          {subtitle && (
            <Text 
              style={{ color: textColor }} 
              className="text-xs font-poppins opacity-70 text-center mt-0.5"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
        
        {rightAction && rightIcon ? (
          <Pressable 
            onPress={rightAction}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-herb-surface/50"
            style={{
              shadowColor: transparent ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: transparent ? 0.1 : 0,
              shadowRadius: 4,
            }}
          >
            <MaterialIcons name={rightIcon} size={24} color={iconColor} />
          </Pressable>
        ) : (
          <View className="w-10" />
        )}
      </View>
    </View>
  );
};

export default Header;