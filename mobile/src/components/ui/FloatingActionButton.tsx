import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string; // Emoji or text
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = '+',
  size = 'md',
  position = 'bottom-right',
  className = '',
}) => {
  const getSizeStyles = (): string => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12';
      case 'md':
        return 'w-14 h-14';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-14 h-14';
    }
  };

  const getPositionStyles = (): string => {
    switch (position) {
      case 'bottom-right':
        return 'absolute bottom-6 right-6';
      case 'bottom-left':
        return 'absolute bottom-6 left-6';
      case 'bottom-center':
        return 'absolute bottom-6 self-center';
      default:
        return 'absolute bottom-6 right-6';
    }
  };

  const getIconSize = (): string => {
    switch (size) {
      case 'sm':
        return 'text-lg';
      case 'md':
        return 'text-xl';
      case 'lg':
        return 'text-2xl';
      default:
        return 'text-xl';
    }
  };

  return (
    <TouchableOpacity
      className={`
        ${getSizeStyles()}
        ${getPositionStyles()}
        bg-poker-green
        rounded-full
        justify-center
        items-center
        shadow-poker-lg
        active:bg-poker-green-dark
        ${className}
      `}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text className={`text-white font-bold ${getIconSize()}`}>
        {icon}
      </Text>
    </TouchableOpacity>
  );
};