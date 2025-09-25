import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Card } from '../../components/ui';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {email?: string; password?: string} = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!email.includes('@')) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({ email, password });
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao fazer login');
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView className="flex-1 bg-poker-dark">
      <View className="flex-1 justify-center px-6">
        {/* Logo/Title */}
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-white mb-2">
            Poker Grinder's Edge
          </Text>
          <Text className="text-poker-gray-400 text-center">
            Sua ferramenta completa para o poker
          </Text>
        </View>

        {/* Login Form */}
        <Card variant="elevated" className="mb-6">
          <Text className="text-white text-2xl font-semibold mb-6 text-center">
            Entrar
          </Text>

          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
            required
          />

          <Input
            label="Senha"
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            required
          />

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            className="mb-4"
          />

          <View className="flex-row justify-center">
            <Text className="text-poker-gray-400">
              Não tem conta?{' '}
            </Text>
            <Text
              className="text-poker-green font-semibold"
              onPress={goToRegister}
            >
              Criar conta
            </Text>
          </View>
        </Card>

        {/* Quick Test Login */}
        <Card variant="bordered" padding="sm">
          <Text className="text-poker-gray-400 text-sm text-center mb-2">
            Acesso rápido para testes:
          </Text>
          <Button
            title="Login como Player Pro"
            onPress={() => {
              setEmail('pro@test.com');
              setPassword('123456');
            }}
            variant="outline"
            size="sm"
            fullWidth
          />
        </Card>
      </View>
    </SafeAreaView>
  );
};