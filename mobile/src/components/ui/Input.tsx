import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  required = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPassword = secureTextEntry && !isPasswordVisible;

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-white text-sm font-medium mb-2">
          {label}
          {required && <Text className="text-poker-red"> *</Text>}
        </Text>
      )}

      <View className="relative">
        <TextInput
          className={`
            bg-poker-card text-white px-4 py-3 rounded-xl text-base
            ${isFocused ? 'border-2 border-poker-green' : 'border-2 border-transparent'}
            ${error ? 'border-poker-red' : ''}
            ${disabled ? 'opacity-50' : ''}
            ${multiline ? 'h-24' : 'h-12'}
          `}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={showPassword}
          keyboardType={keyboardType}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />

        {secureTextEntry && (
          <TouchableOpacity
            className="absolute right-3 top-3"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text className="text-poker-gray-400 text-sm">
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="text-poker-red text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};