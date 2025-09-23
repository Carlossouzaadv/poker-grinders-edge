import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSessionStore } from '../store/sessionStore';
import { useAuthStore } from '../store/authStore';

export const DashboardScreen: React.FC = () => {
  const { sessions, getTotalProfit, getCurrentSession } = useSessionStore();
  const { user } = useAuthStore();

  const totalProfit = getTotalProfit();
  const currentSession = getCurrentSession();
  const totalSessions = sessions.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Olá, {user?.name || 'Jogador'}!
        </Text>
        <Text className="text-gray-600 mb-6">
          Bem-vindo ao Poker Grinder's Edge
        </Text>

        {/* Stats Cards */}
        <View className="space-y-4 mb-6">
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-sm text-gray-600 mb-1">Lucro Total</Text>
            <Text className={`text-2xl font-bold ${
              totalProfit >= 0 ? 'text-poker-green' : 'text-poker-red'
            }`}>
              {formatCurrency(totalProfit)}
            </Text>
          </View>

          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-sm text-gray-600 mb-1">Total de Sessões</Text>
            <Text className="text-2xl font-bold text-gray-900">
              {totalSessions}
            </Text>
          </View>

          {currentSession && (
            <View className="bg-poker-green rounded-lg p-4 shadow-sm">
              <Text className="text-sm text-white mb-1">Sessão Ativa</Text>
              <Text className="text-lg font-bold text-white">
                {currentSession.location} • {currentSession.type}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Ações Rápidas
          </Text>

          <View className="flex-row justify-between space-x-3">
            <TouchableOpacity className="flex-1 bg-poker-green rounded-lg p-4">
              <Text className="text-white font-semibold text-center">
                Nova Sessão
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-blue-600 rounded-lg p-4">
              <Text className="text-white font-semibold text-center">
                Consultor GTO
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Sessions */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Sessões Recentes
          </Text>

          {sessions.length === 0 ? (
            <View className="bg-white rounded-lg p-6 text-center">
              <Text className="text-gray-500">
                Nenhuma sessão registrada ainda.
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                Comece registrando sua primeira sessão!
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {sessions.slice(-3).reverse().map((session) => {
                const profit = session.cashOut - session.buyIn;
                return (
                  <View key={session.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900">
                          {session.location}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {session.type === 'cash' ? 'Cash Game' : 'Torneio'}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {session.startTime.toLocaleDateString()}
                        </Text>
                      </View>
                      <Text className={`font-bold ${
                        profit >= 0 ? 'text-poker-green' : 'text-poker-red'
                      }`}>
                        {formatCurrency(profit)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};