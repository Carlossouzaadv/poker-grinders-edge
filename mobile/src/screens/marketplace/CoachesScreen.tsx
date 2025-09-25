import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Header, Card } from '../../components/ui';

export const CoachesScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-poker-dark">
      <Header title="Marketplace de Coaches" />

      <View className="flex-1 px-4 py-4">
        <Card variant="elevated" className="mb-4">
          <Text className="text-white text-xl font-semibold mb-2">
            👨‍🏫 Em Desenvolvimento
          </Text>
          <Text className="text-poker-gray-300 text-base leading-6">
            O Marketplace de Coaches estará disponível em breve com:
          </Text>

          <View className="mt-4">
            <Text className="text-poker-gold text-base mb-1">
              • Busca por especialidade (MTT, Cash Game)
            </Text>
            <Text className="text-poker-gold text-base mb-1">
              • Filtros por preço e idioma
            </Text>
            <Text className="text-poker-gold text-base mb-1">
              • Avaliações e reviews
            </Text>
            <Text className="text-poker-gold text-base mb-1">
              • Pagamento seguro integrado
            </Text>
            <Text className="text-poker-gold text-base">
              • Agendamento de aulas
            </Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
};