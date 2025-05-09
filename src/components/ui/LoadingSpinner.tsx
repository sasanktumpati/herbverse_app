import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  color = '#446835',
  text
}) => {
  return (
    <View className="items-center justify-center">
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-herb-muted font-poppins mt-2">{text}</Text>
      )}
    </View>
  );
};

export default LoadingSpinner;