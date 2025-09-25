import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightComponent,
  subtitle,
  className = '',
}) => {
  return (
    <SafeAreaView className={`bg-poker-dark ${className}`}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-poker-card">
        {/* Left side - Back button or empty space */}
        <View className="flex-1">
          {showBack && onBack ? (
            <TouchableOpacity
              onPress={onBack}
              className="flex-row items-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-poker-green text-lg mr-2">←</Text>
              <Text className="text-poker-green text-base">Voltar</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center - Title */}
        <View className="flex-2 items-center">
          <Text className="text-white text-lg font-semibold text-center">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-poker-gray-400 text-sm text-center">
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right side - Custom component or empty space */}
        <View className="flex-1 items-end">
          {rightComponent}
        </View>
      </View>
    </SafeAreaView>
  );
};