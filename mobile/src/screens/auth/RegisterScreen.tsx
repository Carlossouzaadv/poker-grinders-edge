import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Card, Header } from '../../components/ui';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { register, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Sobrenome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar conta');
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-poker-dark">
      <Header
        title="Criar Conta"
        showBack
        onBack={goBack}
      />

      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          <Card variant="elevated">
            <Text className="text-white text-xl font-semibold mb-4 text-center">
              Cadastre-se gratuitamente
            </Text>

            <View className="flex-row space-x-2 mb-4">
              <View className="flex-1">
                <Input
                  label="Nome"
                  placeholder="João"
                  value={formData.firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                  error={errors.firstName}
                  required
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Sobrenome"
                  placeholder="Silva"
                  value={formData.lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                  error={errors.lastName}
                  required
                />
              </View>
            </View>

            <Input
              label="Email"
              placeholder="seu@email.com"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              error={errors.email}
              required
            />

            <Input
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              error={errors.password}
              required
            />

            <Input
              label="Confirmar Senha"
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
              error={errors.confirmPassword}
              required
            />

            <Button
              title="Criar Conta"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              className="mt-2"
            />
          </Card>

          {/* Plan Info */}
          <Card variant="bordered" className="mt-4">
            <Text className="text-white font-semibold mb-2">
              🎉 Plano Gratuito inclui:
            </Text>
            <Text className="text-poker-gray-300 text-sm mb-1">
              • Até 20 sessões registradas
            </Text>
            <Text className="text-poker-gray-300 text-sm mb-1">
              • 10 mãos por dia no MTT Trainer
            </Text>
            <Text className="text-poker-gray-300 text-sm">
              • Acesso ao Marketplace de Coaches
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};