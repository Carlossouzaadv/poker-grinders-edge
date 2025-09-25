import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
}) => {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-poker-green active:bg-poker-green-dark';
      case 'secondary':
        return 'bg-poker-card active:bg-poker-card-light';
      case 'danger':
        return 'bg-poker-red active:bg-poker-red-dark';
      case 'outline':
        return 'bg-transparent border-2 border-poker-green active:bg-poker-green active:bg-opacity-10';
      default:
        return 'bg-poker-green active:bg-poker-green-dark';
    }
  };

  const getSizeStyles = (): string => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 rounded-lg';
      case 'md':
        return 'px-4 py-3 rounded-xl';
      case 'lg':
        return 'px-6 py-4 rounded-xl';
      default:
        return 'px-4 py-3 rounded-xl';
    }
  };

  const getTextStyles = (): string => {
    const baseText = 'font-semibold text-center';

    switch (size) {
      case 'sm':
        return `${baseText} text-sm`;
      case 'md':
        return `${baseText} text-base`;
      case 'lg':
        return `${baseText} text-lg`;
      default:
        return `${baseText} text-base`;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return 'text-poker-gray-500';

    switch (variant) {
      case 'outline':
        return 'text-poker-green';
      default:
        return 'text-white';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
        ${className}
      `}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#4ade80' : 'white'}
        />
      ) : (
        <Text className={`${getTextStyles()} ${getTextColor()}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};