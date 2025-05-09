import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return { 
        bg: 'bg-amber-100', 
        text: 'text-amber-700', 
        icon: 'pending', 
        iconColor: '#D97706' 
      };
      case 'processing': return { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        icon: 'hourglass-top', 
        iconColor: '#2563EB' 
      };
      case 'shipped': return { 
        bg: 'bg-purple-100', 
        text: 'text-purple-700', 
        icon: 'local-shipping', 
        iconColor: '#7C3AED' 
      };
      case 'delivered': return { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        icon: 'check-circle', 
        iconColor: '#16A34A' 
      };
      case 'cancelled': return { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        icon: 'cancel', 
        iconColor: '#DC2626' 
      };
      default: return { 
        bg: 'bg-herb-surface', 
        text: 'text-herb-primaryDark', 
        icon: 'help-outline', 
        iconColor: '#2B4D3F' 
      };
    }
  };

  const statusStyle = getStatusStyle(status);
  const sizeClasses = {
    small: {
      padding: 'px-2 py-1',
      fontSize: 'text-xs',
      iconSize: 12
    },
    medium: {
      padding: 'px-3 py-1.5',
      fontSize: 'text-sm',
      iconSize: 16
    },
    large: {
      padding: 'px-4 py-2',
      fontSize: 'text-base',
      iconSize: 18
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <View className={`flex-row items-center ${currentSize.padding} rounded-full ${statusStyle.bg} shadow-sm`}>
      <MaterialIcons 
        name={statusStyle.icon as keyof typeof MaterialIcons.glyphMap} 
        size={currentSize.iconSize} 
        color={statusStyle.iconColor}
        style={{ marginRight: 4 }} 
      />
      <Text className={`${currentSize.fontSize} font-poppins-semibold capitalize ${statusStyle.text}`}>
        {status}
      </Text>
    </View>
  );
};

export default StatusBadge;