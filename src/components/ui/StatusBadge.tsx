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
        bg: 'bg-amber-50', 
        border: 'border-amber-200',
        text: 'text-amber-700', 
        icon: 'pending', 
        iconColor: '#D97706' 
      };
      case 'processing': return { 
        bg: 'bg-blue-50', 
        border: 'border-blue-200',
        text: 'text-blue-700', 
        icon: 'hourglass-top', 
        iconColor: '#2563EB' 
      };
      case 'shipped': return { 
        bg: 'bg-indigo-50', 
        border: 'border-indigo-200',
        text: 'text-indigo-700', 
        icon: 'local-shipping', 
        iconColor: '#4F46E5' 
      };
      case 'delivered': return { 
        bg: 'bg-green-50', 
        border: 'border-green-200',
        text: 'text-green-700', 
        icon: 'check-circle', 
        iconColor: '#16A34A' 
      };
      case 'cancelled': return { 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        text: 'text-red-700', 
        icon: 'cancel', 
        iconColor: '#DC2626' 
      };
      default: return { 
        bg: 'bg-gray-50', 
        border: 'border-gray-200',
        text: 'text-gray-700', 
        icon: 'help-outline', 
        iconColor: '#4B5563' 
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
    <View 
      className={`
        flex-row items-center ${currentSize.padding} rounded-full 
        ${statusStyle.bg} ${statusStyle.border} border
      `}
      style={{
        shadowColor: '#00000015',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 1
      }}
    >
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