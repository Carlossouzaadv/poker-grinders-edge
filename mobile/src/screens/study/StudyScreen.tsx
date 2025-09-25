import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Header, Card } from '../../components/ui';

export const StudyScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-poker-dark">
      <Header title="Laboratório de Estudo" />

      <View className="flex-1 px-4 py-4">
        <Card variant="elevated" className="mb-4">
          <Text className="text-white text-xl font-semibold mb-2">
            📚 Em Desenvolvimento
          </Text>
          <Text className="text-poker-gray-300 text-base leading-6">
            O Laboratório de Estudo estará disponível em breve com:
          </Text>

          <View className="mt-4">
            <Text className="text-poker-green text-base mb-1">
              • Analisador de Mãos Salvas
            </Text>
            <Text className="text-poker-green text-base mb-1">
              • MTT Trainer Gamificado
            </Text>
            <Text className="text-poker-green text-base mb-1">
              • Sistema de Ranking
            </Text>
            <Text className="text-poker-green text-base">
              • Análise GTO Integrada
            </Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
};