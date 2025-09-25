import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}) => {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'elevated':
        return 'bg-poker-card shadow-poker-lg';
      case 'bordered':
        return 'bg-poker-card border border-poker-gray-700';
      default:
        return 'bg-poker-card';
    }
  };

  const getPaddingStyles = (): string => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  return (
    <View
      className={`
        ${getVariantStyles()}
        ${getPaddingStyles()}
        rounded-xl
        ${className}
      `}
    >
      {children}
    </View>
  );
};