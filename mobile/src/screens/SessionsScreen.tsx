import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSessionStore } from '../store/sessionStore';
import { Session } from '../types';

export const SessionsScreen: React.FC = () => {
  const { sessions } = useSessionStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const diffMs = end.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderSession = ({ item }: { item: Session }) => {
    const profit = item.cashOut - item.buyIn;
    const isActive = !item.endTime;

    return (
      <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="font-semibold text-gray-900 text-lg">
                {item.location}
              </Text>
              {isActive && (
                <View className="ml-2 px-2 py-1 bg-poker-green rounded-full">
                  <Text className="text-white text-xs font-medium">ATIVA</Text>
                </View>
              )}
            </View>
            <Text className="text-gray-600 capitalize">
              {item.type === 'cash' ? 'Cash Game' : 'Torneio'}
            </Text>
          </View>
          <Text className={`font-bold text-lg ${
            profit >= 0 ? 'text-poker-green' : 'text-poker-red'
          }`}>
            {formatCurrency(profit)}
          </Text>
        </View>

        <View className="flex-row justify-between text-sm text-gray-500">
          <Text>
            {item.startTime.toLocaleDateString()} • {item.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text>
            {formatDuration(item.startTime, item.endTime)}
          </Text>
        </View>

        <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
          <Text className="text-sm text-gray-600">
            Buy-in: {formatCurrency(item.buyIn)}
          </Text>
          <Text className="text-sm text-gray-600">
            Cash-out: {formatCurrency(item.cashOut)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Sessões
          </Text>
          <TouchableOpacity className="bg-poker-green px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold">Nova Sessão</Text>
          </TouchableOpacity>
        </View>

        {sessions.length === 0 ? (
          <View className="bg-white rounded-lg p-8 text-center">
            <Text className="text-gray-500 text-lg mb-2">
              Nenhuma sessão registrada
            </Text>
            <Text className="text-gray-400">
              Comece registrando sua primeira sessão de poker!
            </Text>
            <TouchableOpacity className="bg-poker-green px-6 py-3 rounded-lg mt-4 self-center">
              <Text className="text-white font-semibold">
                Registrar Primeira Sessão
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())}
            renderItem={renderSession}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};