import React from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Header, Card, Button } from '../../components/ui';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  const getPlanBadge = () => {
    const isPro = user?.plan === 'PRO';
    return (
      <View className={`px-3 py-1 rounded-full ${isPro ? 'bg-poker-gold' : 'bg-poker-gray-600'}`}>
        <Text className={`text-sm font-semibold ${isPro ? 'text-poker-dark' : 'text-white'}`}>
          {isPro ? '⭐ PRO' : '🆓 FREE'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-poker-dark">
      <Header title="Perfil" />

      <View className="flex-1 px-4 py-4">
        {/* User Info */}
        <Card variant="elevated" className="mb-4">
          <View className="items-center">
            <View className="w-20 h-20 bg-poker-green rounded-full items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">
                {user?.firstName?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>

            <Text className="text-white text-xl font-semibold mb-1">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-poker-gray-400 text-base mb-3">
              {user?.email}
            </Text>

            {getPlanBadge()}
          </View>
        </Card>

        {/* Plan Info */}
        {user?.plan === 'FREE' && (
          <Card variant="bordered" className="mb-4">
            <Text className="text-poker-gold text-lg font-semibold mb-2">
              🚀 Upgrade para PRO
            </Text>
            <Text className="text-poker-gray-300 text-sm mb-3">
              Desbloqueie todos os recursos do Poker Grinder's Edge
            </Text>

            <Button
              title="Ver Planos"
              variant="outline"
              fullWidth
              onPress={() => Alert.alert('Em breve', 'Sistema de pagamento em desenvolvimento')}
            />
          </Card>
        )}

        {/* Account Stats */}
        <Card variant="elevated" className="mb-4">
          <Text className="text-white text-lg font-semibold mb-3">
            📊 Estatísticas
          </Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-poker-gray-400">Sessões registradas:</Text>
            <Text className="text-white font-semibold">
              {user?.sessionCount || 0} / {user?.plan === 'PRO' ? '∞' : '20'}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-poker-gray-400">Membro desde:</Text>
            <Text className="text-white font-semibold">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <Card variant="elevated">
          <Button
            title="Sair da Conta"
            variant="danger"
            onPress={handleLogout}
            fullWidth
          />
        </Card>
      </View>
    </SafeAreaView>
  );
};