import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useUIStore, { AlertDialogButton, AlertDialogType } from '../../stores/uiStore';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const CustomAlertDialog: React.FC = () => {
  const { alertProps, hideAlert } = useUIStore();
  const { isVisible, title, message, type, buttons } = alertProps;

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.8, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [isVisible, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  if (!isVisible && opacity.value === 0) { // Only render if visible or animating out
    return null;
  }

  const getIconAndColorForType = (alertType: AlertDialogType) => {
    switch (alertType) {
      case 'success':
        return { icon: 'check-circle' as keyof typeof MaterialIcons.glyphMap, color: '#4CAF50', bgColor: 'bg-green-100' };
      case 'error':
        return { icon: 'error' as keyof typeof MaterialIcons.glyphMap, color: '#F44336', bgColor: 'bg-red-100' };
      case 'warning':
        return { icon: 'warning' as keyof typeof MaterialIcons.glyphMap, color: '#FF9800', bgColor: 'bg-amber-100' };
      case 'info':
        return { icon: 'info' as keyof typeof MaterialIcons.glyphMap, color: '#2196F3', bgColor: 'bg-blue-100' };
      case 'confirmation': // Added confirmation case
        return { icon: 'help-outline' as keyof typeof MaterialIcons.glyphMap, color: '#607D8B', bgColor: 'bg-slate-100' }; // Example style
      default:
        return { icon: 'notifications' as keyof typeof MaterialIcons.glyphMap, color: '#757575', bgColor: 'bg-gray-100' };
    }
  };

  const { icon, color, bgColor } = getIconAndColorForType(type);

  const handleButtonPress = (button: AlertDialogButton) => {
    if (button.onPress) {
      button.onPress();
    }
    // Do not hide alert automatically if button is destructive or has its own logic to close
    if (button.style !== 'destructive' && !button.isLoading) {
        // Hide only if not loading, to allow loading state to show
         if (!buttons.some(b => b.isLoading)) hideAlert();
    }
  };
  
  const getButtonTextStyle = (style?: 'default' | 'cancel' | 'destructive') => {
    switch (style) {
      case 'destructive':
        return 'text-red-600 font-poppins-semibold';
      case 'cancel':
        return 'text-gray-700 font-poppins-medium';
      default:
        return 'text-herb-primary font-poppins-semibold';
    }
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none" // Handled by reanimated
      onRequestClose={() => {
        // Allow closing via back button only if there's a cancel button or only one default button
        const cancelButton = buttons.find(b => b.style === 'cancel');
        if (cancelButton) {
          handleButtonPress(cancelButton);
        } else if (buttons.length === 1 && buttons[0].style === 'default') {
          handleButtonPress(buttons[0]);
        }
      }}
    >
      <View className="absolute inset-0 bg-black/30" />
      <BlurView intensity={10} tint="light" style={StyleSheet.absoluteFill} />
      
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View style={[animatedStyle, styles.alertBox]} className="bg-white w-full rounded-2xl shadow-xl overflow-hidden">
          <View className={`items-center pt-6 pb-4 px-6 ${bgColor}`}>
            <View 
              className={`w-16 h-16 rounded-full items-center justify-center mb-3`}
              style={{ backgroundColor: color + '20' }} // Lighter version of the icon color
            >
              <MaterialIcons name={icon} size={32} color={color} />
            </View>
            <Text className="text-xl font-poppins-bold text-center text-slate-800">{title}</Text>
          </View>
          
          <View className="p-5 pt-3">
            <Text className="text-base text-slate-600 font-poppins text-center mb-6 leading-relaxed">{message}</Text>
            
            <View className={`flex-col ${buttons.length > 2 ? '' : 'md:flex-row'} space-y-2 md:space-y-0 md:space-x-2`}>
              {buttons.map((button, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleButtonPress(button)}
                  disabled={button.isLoading}
                  className={`flex-1 py-3.5 px-4 rounded-xl items-center justify-center
                    ${button.style === 'destructive' ? 'bg-red-500/10' : 
                      button.style === 'cancel' ? 'bg-slate-200/70' : 'bg-herb-primary/10'}
                    ${button.isLoading ? 'opacity-70' : 'active:opacity-80'}
                  `}
                >
                  {button.isLoading ? (
                    <ActivityIndicator size="small" color={button.style === 'destructive' ? '#F44336' : button.style === 'cancel' ? '#4B5563' : '#2B4D3F'} />
                  ) : (
                    <Text className={`${getButtonTextStyle(button.style)} text-base`}>{button.text}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  alertBox: {
    maxWidth: 400, // Max width for larger screens if applicable
  },
});

export default CustomAlertDialog;
