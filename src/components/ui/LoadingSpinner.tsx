import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  color = '#3E6643',
  text,
  fullScreen = false
}) => {
  const baseComponent = (
    <View className={`items-center justify-center ${fullScreen ? 'flex-1' : ''}`}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-herb-muted font-poppins mt-2 text-center">{text}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 bg-herb-background items-center justify-center px-4">
        {baseComponent}
      </View>
    );
  }

  return baseComponent;
};

export default LoadingSpinner;