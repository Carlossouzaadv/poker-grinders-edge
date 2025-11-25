import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store/authStore';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Erro', 'Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-center text-gray-900 mb-2">
          PokerMastery
        </Text>
        <Text className="text-center text-gray-600">
          Seu companheiro definitivo no poker
        </Text>
      </View>

      <View className="space-y-4 mb-6">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Email
          </Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
            placeholder="Digite seu email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Senha
          </Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>

      <TouchableOpacity
        className={`w-full py-4 rounded-lg mb-4 ${
          isLoading ? 'bg-gray-400' : 'bg-poker-green'
        }`}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="py-2">
        <Text className="text-center text-poker-green font-medium">
          Criar nova conta
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="py-2 mt-2">
        <Text className="text-center text-gray-600">
          Esqueceu sua senha?
        </Text>
      </TouchableOpacity>
    </View>
  );
};