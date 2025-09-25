import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#4ade80',
  text,
  fullScreen = false,
  className = '',
}) => {
  const Container = fullScreen ? View : React.Fragment;

  const containerProps = fullScreen
    ? {
        className: `flex-1 justify-center items-center bg-poker-dark ${className}`,
      }
    : {};

  return (
    <Container {...containerProps}>
      <View className={`items-center ${!fullScreen ? className : ''}`}>
        <ActivityIndicator size={size} color={color} />
        {text && (
          <Text className="text-white text-sm mt-2 text-center">
            {text}
          </Text>
        )}
      </View>
    </Container>
  );
};